#include <io.h>
#include <stdint.h>
#include <strsafe.h>
#include <uv.h>

#include "../include/fs-ext.h"
#include "platform.h"

int
fs_ext__try_lock (uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
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
fs_ext__wait_for_lock (uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
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
fs_ext__try_downgrade_lock (uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__try_lock(fd, offset, length, FS_EXT_RDLOCK);
  if (res < 0) return res;

  return fs_ext__unlock(fd, offset, length);
}

int
fs_ext__wait_for_downgrade_lock (uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__wait_for_lock(fd, offset, length, FS_EXT_RDLOCK);
  if (res < 0) return res;

  return fs_ext__unlock(fd, offset, length);
}

int
fs_ext__try_upgrade_lock (uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__unlock(fd, offset, length);
  if (res < 0) return res;

  return fs_ext__try_lock(fd, offset, length, FS_EXT_WRLOCK);
}

int
fs_ext__wait_for_upgrade_lock (uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fs_ext__unlock(fd, offset, length);
  if (res < 0) return res;

  return fs_ext__wait_for_lock(fd, offset, length, FS_EXT_WRLOCK);
}

int
fs_ext__unlock (uv_os_fd_t fd, uint64_t offset, size_t length) {
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
fs_ext__trim (uv_os_fd_t fd, uint64_t offset, size_t length) {
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
fs_ext__sparse (uv_os_fd_t fd) {
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
fs_ext__temp_path (char *path) {
  TCHAR temp_path[MAX_PATH];

  DWORD bytes = GetTempPath(MAX_PATH, temp_path);

  if (bytes == 0) return uv_translate_sys_error(GetLastError());

  bytes = GetTempFileName(temp_path, NULL, 0, path);

  return bytes > 0 ? 0 : uv_translate_sys_error(GetLastError());
}

static int
fs_ext__move (const char *from, const char *to) {
  BOOL res = MoveFileEx(
    from,
    to,
    MOVEFILE_REPLACE_EXISTING
  );

  return res ? 0 : uv_translate_sys_error(GetLastError());
}

int
fs_ext__swap (const char *from, const char *to) {
  TCHAR swap[MAX_PATH];

  int err = fs_ext__temp_path(swap);
  if (err < 0) return err;

  err = fs_ext__move(to, from);
  if (err < 0) return err;

  err = fs_ext__move(from, to);
  if (err < 0) return err;

  return fs_ext__move(swap, from);
}
