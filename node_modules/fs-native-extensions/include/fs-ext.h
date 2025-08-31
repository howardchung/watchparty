#ifndef FS_EXT_H
#define FS_EXT_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <uv.h>

// Requests

typedef struct fs_ext_lock_s fs_ext_lock_t;
typedef struct fs_ext_trim_s fs_ext_trim_t;
typedef struct fs_ext_sparse_s fs_ext_sparse_t;
typedef struct fs_ext_swap_s fs_ext_swap_t;

// Callbacks

typedef void (*fs_ext_lock_cb)(fs_ext_lock_t *req, int status);
typedef void (*fs_ext_trim_cb)(fs_ext_trim_t *req, int status);
typedef void (*fs_ext_sparse_cb)(fs_ext_sparse_t *req, int status);
typedef void (*fs_ext_swap_cb)(fs_ext_swap_t *req, int status);

typedef enum {
  FS_EXT_RDLOCK = 1,
  FS_EXT_WRLOCK,
} fs_ext_lock_type_t;

struct fs_ext_lock_s {
  uv_work_t req;

  uv_os_fd_t fd;
  uint64_t offset;
  uint64_t length;
  fs_ext_lock_type_t type;

  fs_ext_lock_cb cb;

  int result;

  void *data;
};

struct fs_ext_trim_s {
  uv_work_t req;

  uv_os_fd_t fd;
  uint64_t offset;
  uint64_t length;

  fs_ext_trim_cb cb;

  int result;

  void *data;
};

struct fs_ext_sparse_s {
  uv_work_t req;

  uv_os_fd_t fd;

  fs_ext_sparse_cb cb;

  int result;

  void *data;
};

struct fs_ext_swap_s {
  uv_work_t req;

  const char *from;
  const char *to;

  fs_ext_swap_cb cb;

  int result;

  void *data;
};

int
fs_ext_try_lock (uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type);

int
fs_ext_wait_for_lock (uv_loop_t *loop, fs_ext_lock_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type, fs_ext_lock_cb cb);

int
fs_ext_try_downgrade_lock (uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext_wait_for_downgrade_lock (uv_loop_t *loop, fs_ext_lock_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_cb cb);

int
fs_ext_try_upgrade_lock (uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext_wait_for_upgrade_lock (uv_loop_t *loop, fs_ext_lock_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_cb cb);

int
fs_ext_unlock (uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext_trim (uv_loop_t *loop, fs_ext_trim_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_trim_cb cb);

int
fs_ext_sparse (uv_loop_t *loop, fs_ext_sparse_t *req, uv_os_fd_t fd, fs_ext_sparse_cb cb);

int
fs_ext_swap (uv_loop_t *loop, fs_ext_swap_t *req, const char *from, const char *to, fs_ext_swap_cb cb);

#ifdef __cplusplus
}
#endif
#endif // FS_EXT_H
