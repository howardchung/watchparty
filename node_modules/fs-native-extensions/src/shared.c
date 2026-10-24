#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <uv.h>

#include "../include/fs-ext.h"

#include "platform.h"

int
fs_ext_try_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type) {
  int err = fs_ext__try_lock(fd, offset, length, type);

  if (err == UV_EACCES || err == UV_EAGAIN || err == UV_EBUSY) {
    err = UV_EAGAIN;
  }

  return err;
}

static void
fs_ext__lock_work(uv_work_t *req) {
  fs_ext_lock_t *r = (fs_ext_lock_t *) req->data;

  r->result = fs_ext__wait_for_lock(r->fd, r->offset, r->length, r->type);
}

static void
fs_ext__lock_after_work(uv_work_t *req, int status) {
  fs_ext_lock_t *r = (fs_ext_lock_t *) req->data;

  if (r->cb) r->cb(r, r->result);
}

int
fs_ext_wait_for_lock(uv_loop_t *loop, fs_ext_lock_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type, fs_ext_lock_cb cb) {
  req->fd = fd;
  req->offset = offset;
  req->length = length;
  req->type = type;
  req->cb = cb;
  req->req.data = (void *) req;

  return uv_queue_work(loop, &req->req, fs_ext__lock_work, fs_ext__lock_after_work);
}

int
fs_ext_try_downgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int err = fs_ext__try_downgrade_lock(fd, offset, length);

  if (err == UV_EACCES || err == UV_EAGAIN || err == UV_EBUSY) {
    err = UV_EAGAIN;
  }

  return err;
}

static void
fs_ext__downgrade_lock_work(uv_work_t *req) {
  fs_ext_lock_t *r = (fs_ext_lock_t *) req->data;

  r->result = fs_ext__wait_for_downgrade_lock(r->fd, r->offset, r->length);
}

int
fs_ext_wait_for_downgrade_lock(uv_loop_t *loop, fs_ext_lock_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_cb cb) {
  req->fd = fd;
  req->offset = offset;
  req->length = length;
  req->type = FS_EXT_RDLOCK;
  req->cb = cb;
  req->req.data = (void *) req;

  return uv_queue_work(loop, &req->req, fs_ext__downgrade_lock_work, fs_ext__lock_after_work);
}

static void
fs_ext__upgrade_lock_work(uv_work_t *req) {
  fs_ext_lock_t *r = (fs_ext_lock_t *) req->data;

  r->result = fs_ext__wait_for_upgrade_lock(r->fd, r->offset, r->length);
}

int
fs_ext_try_upgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  int err = fs_ext__try_upgrade_lock(fd, offset, length);

  if (err == UV_EACCES || err == UV_EAGAIN || err == UV_EBUSY) {
    err = UV_EAGAIN;
  }

  return err;
}

int
fs_ext_wait_for_upgrade_lock(uv_loop_t *loop, fs_ext_lock_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_cb cb) {
  req->fd = fd;
  req->offset = offset;
  req->length = length;
  req->type = FS_EXT_WRLOCK;
  req->cb = cb;
  req->req.data = (void *) req;

  return uv_queue_work(loop, &req->req, fs_ext__upgrade_lock_work, fs_ext__lock_after_work);
}

int
fs_ext_unlock(uv_os_fd_t fd, uint64_t offset, size_t length) {
  return fs_ext__unlock(fd, offset, length);
}

static void
fs_ext__trim_work(uv_work_t *req) {
  fs_ext_trim_t *r = (fs_ext_trim_t *) req->data;

  r->result = fs_ext__trim(r->fd, r->offset, r->length);
}

static void
fs_ext__trim_after_work(uv_work_t *req, int status) {
  fs_ext_trim_t *r = (fs_ext_trim_t *) req->data;

  if (r->cb) r->cb(r, r->result);
}

int
fs_ext_trim(uv_loop_t *loop, fs_ext_trim_t *req, uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_trim_cb cb) {
  req->fd = fd;
  req->offset = offset;
  req->length = length;
  req->cb = cb;
  req->req.data = (void *) req;

  return uv_queue_work(loop, &req->req, fs_ext__trim_work, fs_ext__trim_after_work);
}

static void
fs_ext__sparse_work(uv_work_t *req) {
  fs_ext_sparse_t *r = (fs_ext_sparse_t *) req->data;

  r->result = fs_ext__sparse(r->fd);
}

static void
fs_ext__sparse_after_work(uv_work_t *req, int status) {
  fs_ext_sparse_t *r = (fs_ext_sparse_t *) req->data;

  if (r->cb) r->cb(r, r->result);
}

int
fs_ext_sparse(uv_loop_t *loop, fs_ext_sparse_t *req, uv_os_fd_t fd, fs_ext_sparse_cb cb) {
  req->fd = fd;
  req->cb = cb;
  req->req.data = (void *) req;

  return uv_queue_work(loop, &req->req, fs_ext__sparse_work, fs_ext__sparse_after_work);
}

static void
fs_ext__swap_work(uv_work_t *req) {
  fs_ext_swap_t *r = (fs_ext_swap_t *) req->data;

  r->result = fs_ext__swap(r->from, r->to);
}

static void
fs_ext__swap_after_work(uv_work_t *req, int status) {
  fs_ext_swap_t *r = (fs_ext_swap_t *) req->data;

  char *from = r->from;
  char *to = r->to;

  if (r->cb) r->cb(r, r->result);

  free(from);
  free(to);
}

int
fs_ext_swap(uv_loop_t *loop, fs_ext_swap_t *req, const char *from, const char *to, fs_ext_swap_cb cb) {
  int err;

  req->from = strdup(from);
  req->to = strdup(to);
  req->cb = cb;
  req->req.data = (void *) req;

  err = uv_queue_work(loop, &req->req, fs_ext__swap_work, fs_ext__swap_after_work);

  if (err < 0) {
    free(req->from);
    free(req->to);

    return err;
  }

  return 0;
}

static void
fs_ext__get_attr_work(uv_work_t *req) {
  fs_ext_get_attr_t *r = (fs_ext_get_attr_t *) req->data;

  r->result = fs_ext__get_attr(r->fd, r->name, &r->value);
}

static void
fs_ext__get_attr_after_work(uv_work_t *req, int status) {
  fs_ext_get_attr_t *r = (fs_ext_get_attr_t *) req->data;

  uv_buf_t value = r->value;
  char *name = r->name;

  if (r->cb) r->cb(r, r->result, &value);

  free(value.base);
  free(name);
}

int
fs_ext_get_attr(uv_loop_t *loop, fs_ext_get_attr_t *req, uv_os_fd_t fd, const char *name, fs_ext_get_attr_cb cb) {
  int err;

  req->fd = fd;
  req->name = strdup(name);
  req->value.base = NULL;
  req->value.len = 0;
  req->cb = cb;
  req->req.data = (void *) req;

  err = uv_queue_work(loop, &req->req, fs_ext__get_attr_work, fs_ext__get_attr_after_work);

  if (err < 0) {
    free(req->name);

    return err;
  }

  return 0;
}

static void
fs_ext__set_attr_work(uv_work_t *req) {
  fs_ext_set_attr_t *r = (fs_ext_set_attr_t *) req->data;

  r->result = fs_ext__set_attr(r->fd, r->name, &r->value);
}

static void
fs_ext__set_attr_after_work(uv_work_t *req, int status) {
  fs_ext_set_attr_t *r = (fs_ext_set_attr_t *) req->data;

  char *name = r->name;

  if (r->cb) r->cb(r, r->result);

  free(name);
}

int
fs_ext_set_attr(uv_loop_t *loop, fs_ext_set_attr_t *req, uv_os_fd_t fd, const char *name, const uv_buf_t *value, fs_ext_set_attr_cb cb) {
  int err;

  req->fd = fd;
  req->name = strdup(name);
  req->value = *value;
  req->cb = cb;
  req->req.data = (void *) req;

  err = uv_queue_work(loop, &req->req, fs_ext__set_attr_work, fs_ext__set_attr_after_work);

  if (err < 0) {
    free(req->name);

    return err;
  }

  return 0;
}

static void
fs_ext__remove_attr_work(uv_work_t *req) {
  fs_ext_remove_attr_t *r = (fs_ext_remove_attr_t *) req->data;

  r->result = fs_ext__remove_attr(r->fd, r->name);
}

static void
fs_ext__remove_attr_after_work(uv_work_t *req, int status) {
  fs_ext_remove_attr_t *r = (fs_ext_remove_attr_t *) req->data;

  char *name = r->name;

  if (r->cb) r->cb(r, r->result);

  free(name);
}

int
fs_ext_remove_attr(uv_loop_t *loop, fs_ext_remove_attr_t *req, uv_os_fd_t fd, const char *name, fs_ext_remove_attr_cb cb) {
  int err;

  req->fd = fd;
  req->name = strdup(name);
  req->cb = cb;
  req->req.data = (void *) req;

  err = uv_queue_work(loop, &req->req, fs_ext__remove_attr_work, fs_ext__remove_attr_after_work);

  if (err < 0) {
    free(req->name);

    return err;
  }

  return 0;
}

static void
fs_ext__list_attrs_work(uv_work_t *req) {
  fs_ext_list_attrs_t *r = (fs_ext_list_attrs_t *) req->data;

  r->result = fs_ext__list_attrs(r->fd, &r->names, &r->length);
}

static void
fs_ext__list_attrs_after_work(uv_work_t *req, int status) {
  fs_ext_list_attrs_t *r = (fs_ext_list_attrs_t *) req->data;

  const char **names = (const char **) r->names;

  if (r->cb) r->cb(r, r->result, names, r->length);

  free(names);
}

int
fs_ext_list_attrs(uv_loop_t *loop, fs_ext_list_attrs_t *req, uv_os_fd_t fd, fs_ext_list_attrs_cb cb) {
  req->fd = fd;
  req->cb = cb;
  req->req.data = (void *) req;

  return uv_queue_work(loop, &req->req, fs_ext__list_attrs_work, fs_ext__list_attrs_after_work);
}
