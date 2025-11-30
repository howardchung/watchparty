#define _GNU_SOURCE

#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/syscall.h>
#include <sys/xattr.h>
#include <unistd.h>
#include <uv.h>

#include "../include/fs-ext.h"

#include "platform.h"

#ifndef RENAME_EXCHANGE
#define RENAME_EXCHANGE 2
#endif

int
fs_ext__try_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  struct flock data = {
    .l_start = offset,
    .l_len = length,
    .l_pid = 0,
    .l_type = type == FS_EXT_WRLOCK ? F_WRLCK : F_RDLCK,
    .l_whence = SEEK_SET,
  };

  int res = fcntl(fd, F_OFD_SETLK, &data);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__wait_for_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  struct flock data = {
    .l_start = offset,
    .l_len = length,
    .l_pid = 0,
    .l_type = type == FS_EXT_WRLOCK ? F_WRLCK : F_RDLCK,
    .l_whence = SEEK_SET,
  };

  int res = fcntl(fd, F_OFD_SETLKW, &data);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__unlock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  struct flock data = {
    .l_start = offset,
    .l_len = length,
    .l_pid = 0,
    .l_type = F_UNLCK,
    .l_whence = SEEK_SET,
  };

  int res = fcntl(fd, F_OFD_SETLK, &data);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__trim(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fallocate(fd, FALLOC_FL_PUNCH_HOLE | FALLOC_FL_KEEP_SIZE, offset, length);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__swap(const char *from, const char *to) {
  int res = syscall(SYS_renameat2, AT_FDCWD, from, AT_FDCWD, to, RENAME_EXCHANGE);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__get_attr(uv_os_fd_t fd, const char *name, uv_buf_t *value) {
  int res = fgetxattr(fd, name, NULL, 0);

  if (res == -1) return uv_translate_sys_error(errno);

  *value = uv_buf_init(malloc(res), res);

  res = fgetxattr(fd, name, value->base, value->len);

  return res == -1 ? uv_translate_sys_error(errno) : 0;
}

int
fs_ext__set_attr(uv_os_fd_t fd, const char *name, const uv_buf_t *value) {
  int res = fsetxattr(fd, name, value->base, value->len, 0);

  return res == -1 ? uv_translate_sys_error(errno) : 0;
}

int
fs_ext__remove_attr(uv_os_fd_t fd, const char *name) {
  int res = fremovexattr(fd, name);

  return res == -1 ? uv_translate_sys_error(errno) : 0;
}

int
fs_ext__list_attrs(uv_os_fd_t fd, char **names, size_t *length) {
  int res = flistxattr(fd, NULL, 0);

  if (res == -1) return uv_translate_sys_error(errno);

  *names = malloc(res);
  *length = res;

  res = flistxattr(fd, *names, *length);

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
