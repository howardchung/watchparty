#include <io.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>
#include <strsafe.h>
#include <uv.h>

#include "../include/fs-ext.h"

#include "platform.h"
#include "win32/nt.h"

int
fs_ext__try_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  if (length == 0) length = SIZE_MAX;

  DWORD flags = LOCKFILE_FAIL_IMMEDIATELY;

  if (type == FS_EXT_WRLOCK) flags |= LOCKFILE_EXCLUSIVE_LOCK;

  OVERLAPPED data = {
    .hEvent = 0,
    .Offset = offset,
    .OffsetHigh = offset >> 32,
  };

  BOOL res = LockFileEx(
    fd,
    flags,
    0,
    length,
    length >> 32,
    &data
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

int
fs_ext__wait_for_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  if (length == 0) length = SIZE_MAX;

  DWORD flags = 0;

  if (type == FS_EXT_WRLOCK) flags |= LOCKFILE_EXCLUSIVE_LOCK;

  OVERLAPPED data = {
    .hEvent = 0,
    .Offset = offset,
    .OffsetHigh = offset >> 32,
  };

  BOOL res = LockFileEx(
    fd,
    flags,
    0,
    length,
    length >> 32,
    &data
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

int
fs_ext__try_downgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__try_lock(fd, offset, length, FS_EXT_RDLOCK);
  if (res < 0) return res;

  return fs_ext__unlock(fd, offset, length);
}

int
fs_ext__wait_for_downgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__wait_for_lock(fd, offset, length, FS_EXT_RDLOCK);
  if (res < 0) return res;

  return fs_ext__unlock(fd, offset, length);
}

int
fs_ext__try_upgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__unlock(fd, offset, length);
  if (res < 0) return res;

  return fs_ext__try_lock(fd, offset, length, FS_EXT_WRLOCK);
}

int
fs_ext__wait_for_upgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__unlock(fd, offset, length);
  if (res < 0) return res;

  return fs_ext__wait_for_lock(fd, offset, length, FS_EXT_WRLOCK);
}

int
fs_ext__unlock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  if (length == 0) length = SIZE_MAX;

  OVERLAPPED data = {
    .hEvent = 0,
    .Offset = offset,
    .OffsetHigh = offset >> 32,
  };

  BOOL res = UnlockFileEx(
    fd,
    0,
    length,
    length >> 32,
    &data
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

int
fs_ext__trim(uv_os_fd_t fd, uint64_t offset, size_t length) {
  FILE_ZERO_DATA_INFORMATION data = {
    .FileOffset = {
      .QuadPart = offset,
    },
    .BeyondFinalZero = {
      .QuadPart = offset + length,
    },
  };

  DWORD bytes;

  BOOL res = DeviceIoControl(
    fd,
    FSCTL_SET_ZERO_DATA,
    &data,
    sizeof(data),
    NULL,
    0,
    &bytes, // Must be passed when lpOverlapped is NULL
    NULL
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

int
fs_ext__sparse(uv_os_fd_t fd) {
  DWORD bytes;

  BOOL res = DeviceIoControl(
    fd,
    FSCTL_SET_SPARSE,
    NULL,
    0,
    NULL,
    0,
    &bytes, // Must be passed when lpOverlapped is NULL
    NULL
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

static int
fs_ext__temp_path(char *path) {
  TCHAR temp_path[MAX_PATH];

  DWORD bytes = GetTempPath(MAX_PATH, temp_path);

  if (bytes == 0) return uv_translate_sys_error(GetLastError());

  bytes = GetTempFileName(temp_path, NULL, 0, path);

  return bytes > 0 ? 0 : uv_translate_sys_error(GetLastError());
}

static int
fs_ext__move(const char *from, const char *to) {
  BOOL res = MoveFileEx(
    from,
    to,
    MOVEFILE_REPLACE_EXISTING
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

int
fs_ext__swap(const char *from, const char *to) {
  TCHAR swap[MAX_PATH];

  int err = fs_ext__temp_path(swap);
  if (err < 0) return err;

  err = fs_ext__move(to, from);
  if (err < 0) return err;

  err = fs_ext__move(from, to);
  if (err < 0) return err;

  return fs_ext__move(swap, from);
}

int
fs_ext__get_attr(uv_os_fd_t fd, const char *name, uv_buf_t *value) {
  HANDLE handle = fd;
  HANDLE stream_handle;

  size_t len = strlen(name);

  WCHAR unicode_name[MAX_PATH] = L":";
  MultiByteToWideChar(CP_OEMCP, 0, name, -1, &unicode_name[1], len + 1);

  len = wcslen(unicode_name) * 2;

  UNICODE_STRING object_name = {
    .Length = len,
    .MaximumLength = len + 2,
    .Buffer = unicode_name,
  };

  OBJECT_ATTRIBUTES object_attributes = {
    .Length = sizeof(object_attributes),
    .RootDirectory = handle,
    .ObjectName = &object_name,
  };

  IO_STATUS_BLOCK status;

  NTSTATUS res = NtOpenFile(
    &stream_handle,
    GENERIC_READ,
    &object_attributes,
    &status,
    FILE_SHARE_READ,
    0
  );

  if (res < 0) {
    if (res == STATUS_OBJECT_NAME_NOT_FOUND) return UV_ENODATA;

    return UV_EIO;
  }

  FILE_STANDARD_INFORMATION info;

  res = NtQueryInformationFile(
    stream_handle,
    &status,
    &info,
    sizeof(info),
    FileStandardInformation
  );

  if (res < 0) {
    NtClose(stream_handle);

    return UV_EIO;
  }

  size_t length = info.EndOfFile.QuadPart;

  *value = uv_buf_init(malloc(length), length);

  LARGE_INTEGER offset = {
    .QuadPart = 0,
  };

  res = NtReadFile(
    stream_handle,
    NULL,
    NULL,
    NULL,
    &status,
    value->base,
    value->len,
    &offset,
    NULL
  );

  NtClose(stream_handle);

  if (res < 0) return UV_EIO;

  return 0;
}

int
fs_ext__set_attr(uv_os_fd_t fd, const char *name, const uv_buf_t *value) {
  HANDLE handle = fd;
  HANDLE stream_handle;

  size_t len = strlen(name);

  WCHAR unicode_name[MAX_PATH] = L":";
  MultiByteToWideChar(CP_OEMCP, 0, name, -1, &unicode_name[1], len + 1);

  len = wcslen(unicode_name) * 2;

  UNICODE_STRING object_name = {
    .Length = len,
    .MaximumLength = len + 2,
    .Buffer = unicode_name,
  };

  OBJECT_ATTRIBUTES object_attributes = {
    .Length = sizeof(object_attributes),
    .RootDirectory = handle,
    .ObjectName = &object_name,
  };

  IO_STATUS_BLOCK status;

  NTSTATUS res = NtCreateFile(
    &stream_handle,
    GENERIC_WRITE,
    &object_attributes,
    &status,
    NULL,
    FILE_ATTRIBUTE_NORMAL,
    0,
    FILE_OVERWRITE_IF,
    0,
    NULL,
    0
  );

  if (res < 0) return UV_EIO;

  LARGE_INTEGER offset = {
    .QuadPart = 0,
  };

  res = NtWriteFile(
    stream_handle,
    NULL,
    NULL,
    NULL,
    &status,
    value->base,
    value->len,
    &offset,
    NULL
  );

  NtClose(stream_handle);

  if (res < 0) return UV_EIO;

  return 0;
}

int
fs_ext__remove_attr(uv_os_fd_t fd, const char *name) {
  HANDLE handle = fd;
  HANDLE stream_handle;

  size_t len = strlen(name);

  WCHAR unicode_name[MAX_PATH] = L":";
  MultiByteToWideChar(CP_OEMCP, 0, name, -1, &unicode_name[1], len + 1);

  len = wcslen(unicode_name) * 2;

  UNICODE_STRING object_name = {
    .Length = len,
    .MaximumLength = len + 2,
    .Buffer = unicode_name,
  };

  OBJECT_ATTRIBUTES object_attributes = {
    .Length = sizeof(object_attributes),
    .RootDirectory = handle,
    .ObjectName = &object_name,
  };

  IO_STATUS_BLOCK status;

  NTSTATUS res = NtOpenFile(
    &stream_handle,
    DELETE,
    &object_attributes,
    &status,
    FILE_SHARE_DELETE,
    0
  );

  if (res < 0) {
    if (res == STATUS_OBJECT_NAME_NOT_FOUND) return UV_ENODATA;

    return UV_EIO;
  }

  res = NtDeleteFile(&object_attributes);

  NtClose(stream_handle);

  if (res < 0) return UV_EIO;

  return 0;
}

int
fs_ext__list_attrs(uv_os_fd_t fd, char **names, size_t *length) {
  HANDLE handle = fd;

  size_t info_size = 64;

  PFILE_STREAM_INFORMATION info = malloc(info_size);
  memset(info, 0, info_size);

  NTSTATUS res;

  do {
    IO_STATUS_BLOCK status;

    res = NtQueryInformationFile(
      handle,
      &status,
      &info[0],
      info_size,
      FileStreamInformation
    );

    if (res == STATUS_BUFFER_OVERFLOW) {
      info = realloc(info, info_size *= 2);
      memset(info, 0, info_size);
    } else {
      break;
    }
  } while (true);

  if (res < 0) return UV_EIO;

  PFILE_STREAM_INFORMATION next = info;

  size_t names_len = 0;
  *length = 0;

  do {
    PWCHAR unicode_name = &next->StreamName[1];

    unicode_name[wcslen(unicode_name) - wcslen(L":$DATA")] = L'\0';

    if (wcscmp(unicode_name, L"") != 0) {
      size_t name_len = WideCharToMultiByte(CP_UTF8, 0, unicode_name, -1, NULL, 0, NULL, NULL);

      *length += 1;

      names_len += sizeof(char *) + name_len;
    }

    if (next->NextEntryOffset) {
      next = (PFILE_STREAM_INFORMATION) (((uintptr_t) next) + next->NextEntryOffset);
    } else {
      break;
    }
  } while (true);

  *names = malloc(names_len);

  size_t offset = *length * sizeof(char *), i = 0, j = 0;

  next = info;

  do {
    PWCHAR unicode_name = &next->StreamName[1];

    if (wcscmp(unicode_name, L"") != 0) {
      size_t name_len = WideCharToMultiByte(CP_UTF8, 0, unicode_name, -1, NULL, 0, NULL, NULL);

      char *name = *names + offset + i;
      i += name_len;

      WideCharToMultiByte(CP_UTF8, 0, unicode_name, -1, name, name_len, NULL, NULL);

      memcpy(*names + j, &name, sizeof(char *));
      j += sizeof(char *);
    }

    if (next->NextEntryOffset) {
      next = (PFILE_STREAM_INFORMATION) (((uintptr_t) next) + next->NextEntryOffset);
    } else {
      break;
    }
  } while (true);

  free(info);

  return 0;
}
