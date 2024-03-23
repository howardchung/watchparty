#define _GNU_SOURCE

#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <sys/syscall.h>
#include <unistd.h>
#include <uv.h>

#include "../include/fs-ext.h"
#include "platform.h"

#ifndef RENAME_EXCHANGE
#define RENAME_EXCHANGE 2
#endif

int
fs_ext__try_lock (uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
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
fs_ext__wait_for_lock (uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
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
fs_ext__unlock (uv_os_fd_t fd, uint64_t offset, size_t length) {
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
fs_ext__trim (uv_os_fd_t fd, uint64_t offset, size_t length) {
  int res = fallocate(fd, FALLOC_FL_PUNCH_HOLE | FALLOC_FL_KEEP_SIZE, offset, length);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}

int
fs_ext__swap (const char *from, const char *to) {
  int res = syscall(SYS_renameat2, AT_FDCWD, from, AT_FDCWD, to, RENAME_EXCHANGE);

  return res == -1 ? uv_translate_sys_error(errno) : res;
}
