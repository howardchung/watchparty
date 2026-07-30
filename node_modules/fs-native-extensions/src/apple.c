#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/xattr.h>
#include <unistd.h>
#include <uv.h>

#include "../include/fs-ext.h"

#include "platform.h"

int
fs_ext__try_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  if (offset != 0 || length != 0) return UV_EINVAL;

  int res = flock(fd, (type == FS_EXT_WRLOCK ? LOCK_EX : LOCK_SH) | LOCK_NB);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__wait_for_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  if (offset != 0 || length != 0) return UV_EINVAL;

  int res = flock(fd, type == FS_EXT_WRLOCK ? LOCK_EX : LOCK_SH);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__unlock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  if (offset != 0 || length != 0) return UV_EINVAL;

  int res = flock(fd, LOCK_UN);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

static inline size_t
fs_ext__align_up(size_t n, size_t align) {
  return (n + (align - 1)) & -align;
}

static inline size_t
fs_ext__align_down(size_t n, size_t align) {
  return n & -align;
}

static inline size_t
fs_ext__min(size_t a, size_t b) {
  return a < b ? a : b;
}

int
fs_ext__trim(uv_os_fd_t fd, uint64_t offset, size_t length) {
  struct stat st;

  int res = fstat(fd, &st);

  if (res == -1) return uv_translate_sys_error(errno);

  size_t align = st.st_blksize;

  size_t aligned_offset = fs_ext__align_up(offset, align);

  if (aligned_offset != offset) {
    size_t zero_length = fs_ext__min(length, aligned_offset - offset);

    void *buf = calloc(1, zero_length);

    ssize_t res = pwrite(fd, buf, zero_length, offset);

    free(buf);

    if (res == -1) return uv_translate_sys_error(errno);

    offset += zero_length;
    length -= zero_length;
  }

  size_t aligned_length = fs_ext__align_down(length, align);

  if (aligned_length >= align) {
    struct fpunchhole data = {
      .fp_flags = 0,
      .reserved = 0,
      .fp_offset = offset,
      .fp_length = aligned_length,
    };

    int res = fcntl(fd, F_PUNCHHOLE, &data);

    if (res == -1) return uv_translate_sys_error(errno);

    offset += aligned_length;
    length -= aligned_length;
  }

  if (length > 0) {
    void *buf = calloc(1, length);

    ssize_t res = pwrite(fd, buf, length, offset);

    free(buf);

    if (res == -1) return uv_translate_sys_error(errno);
  }

  return 0;
}

int
fs_ext__swap(const char *from, const char *to) {
  int res = renameatx_np(AT_FDCWD, from, AT_FDCWD, to, RENAME_SWAP);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__get_attr(uv_os_fd_t fd, const char *name, uv_buf_t *value) {
  int res = fgetxattr(fd, name, NULL, 0, 0, 0);

  if (res == -1) {
    if (errno == ENOATTR) return UV_ENODATA;

    return uv_translate_sys_error(errno);
  }

  *value = uv_buf_init(malloc(res), res);

  res = fgetxattr(fd, name, value->base, value->len, 0, 0);

  return res == -1 ? uv_translate_sys_error(errno) : 0;
}

int
fs_ext__set_attr(uv_os_fd_t fd, const char *name, const uv_buf_t *value) {
  int res = fsetxattr(fd, name, value->base, value->len, 0, 0);

  return res == -1 ? uv_translate_sys_error(errno) : 0;
}

int
fs_ext__remove_attr(uv_os_fd_t fd, const char *name) {
  int res = fremovexattr(fd, name, 0);

  if (res == -1) {
    if (errno == ENOATTR) return UV_ENODATA;

    return uv_translate_sys_error(errno);
  }

  return 0;
}

int
fs_ext__list_attrs(uv_os_fd_t fd, char **names, size_t *length) {
  int res = flistxattr(fd, NULL, 0, 0);

  if (res == -1) return uv_translate_sys_error(errno);

  *names = malloc(res);
  *length = res;

  res = flistxattr(fd, *names, *length, 0);

  if (res == -1) return uv_translate_sys_error(errno);

  size_t i = 0, j = 0, n = *length;

  *length = 0;

  while (i < n) {
    i += strlen(*names + i) + 1;
    *length += 1;
  }

  size_t offset = *length * sizeof(char *);

  *names = realloc(*names, offset + n);

  memmove(*names + offset, *names, n);

  i = 0;

  while (i < n) {
    char *name = *names + offset + i;
    i += strlen(name) + 1;

    memcpy(*names + j, &name, sizeof(char *));
    j += sizeof(char *);
  }

  return 0;
}
