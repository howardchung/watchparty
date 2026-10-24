#include <bare.h>
#include <js.h>
#include <stdlib.h>
#include <string.h>
#include <utf.h>
#include <uv.h>

#include "include/fs-ext.h"

typedef utf8_t fs_ext_js_path_t[4096 + 1 /* NULL */];

typedef struct {
  fs_ext_lock_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_lock_t;

typedef struct {
  fs_ext_trim_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_trim_t;

typedef struct {
  fs_ext_sparse_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_sparse_t;

typedef struct {
  fs_ext_swap_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_swap_t;

typedef struct {
  fs_ext_get_attr_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_get_attr_t;

typedef struct {
  fs_ext_set_attr_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_set_attr_t;

typedef struct {
  fs_ext_remove_attr_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_remove_attr_t;

typedef struct {
  fs_ext_list_attrs_t req;

  js_env_t *env;
  js_ref_t *ctx;
  js_ref_t *cb;

  bool exiting;

  js_deferred_teardown_t *teardown;
} fs_ext_js_list_attrs_t;

static void
fs_ext_js__on_teardown(js_deferred_teardown_t *teardown, void *data) {
  bool *exiting = data;

  *exiting = true;
}

static void
fs_ext_js__on_lock(fs_ext_lock_t *req, int status) {
  int err;

  fs_ext_js_lock_t *r = (fs_ext_js_lock_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[1];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 1, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_trim(fs_ext_trim_t *req, int status) {
  int err;

  fs_ext_js_trim_t *r = (fs_ext_js_trim_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[1];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 1, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_sparse(fs_ext_sparse_t *req, int status) {
  int err;

  fs_ext_js_sparse_t *r = (fs_ext_js_sparse_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[1];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 1, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_swap(fs_ext_swap_t *req, int status) {
  int err;

  fs_ext_js_swap_t *r = (fs_ext_js_swap_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[1];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 1, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_get_attr(fs_ext_get_attr_t *req, int status, const uv_buf_t *value) {
  int err;

  fs_ext_js_get_attr_t *r = (fs_ext_js_get_attr_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[2];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0 && req->result != UV_ENODATA) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);

    err = js_get_null(env, &argv[1]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);

    if (req->result == UV_ENODATA) {
      err = js_get_null(env, &argv[1]);
      assert(err == 0);
    } else {
      void *data;
      err = js_create_arraybuffer(env, value->len, &data, &argv[1]);
      assert(err == 0);

      memcpy(data, value->base, value->len);
    }
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 2, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_set_attr(fs_ext_set_attr_t *req, int status) {
  int err;

  fs_ext_js_set_attr_t *r = (fs_ext_js_set_attr_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[1];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 1, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_remove_attr(fs_ext_remove_attr_t *req, int status) {
  int err;

  fs_ext_js_remove_attr_t *r = (fs_ext_js_remove_attr_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[1];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0 && req->result != UV_ENODATA) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 1, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static void
fs_ext_js__on_list_attrs(fs_ext_list_attrs_t *req, int status, const char *attrs[], ssize_t len) {
  int err;

  fs_ext_js_list_attrs_t *r = (fs_ext_js_list_attrs_t *) req;

  js_env_t *env = r->env;

  js_deferred_teardown_t *teardown = r->teardown;

  js_handle_scope_t *scope;
  err = js_open_handle_scope(env, &scope);
  assert(err == 0);

  js_value_t *argv[2];

  js_value_t *ctx;
  err = js_get_reference_value(env, r->ctx, &ctx);
  assert(err == 0);

  js_value_t *callback;
  err = js_get_reference_value(env, r->cb, &callback);
  assert(err == 0);

  err = js_delete_reference(env, r->cb);
  assert(err == 0);

  err = js_delete_reference(env, r->ctx);
  assert(err == 0);

  if (req->result < 0) {
    js_value_t *code;
    err = js_create_string_utf8(env, (const utf8_t *) uv_err_name(req->result), -1, &code);
    assert(err == 0);

    js_value_t *message;
    err = js_create_string_utf8(env, (const utf8_t *) uv_strerror(req->result), -1, &message);
    assert(err == 0);

    err = js_create_error(env, code, message, &argv[0]);
    assert(err == 0);

    err = js_get_null(env, &argv[1]);
    assert(err == 0);
  } else {
    err = js_get_null(env, &argv[0]);
    assert(err == 0);

    err = js_create_array_with_length(env, len, &argv[1]);
    assert(err == 0);

    for (size_t i = 0; i < len; i++) {
      js_value_t *value;
      err = js_create_string_utf8(env, (const utf8_t *) attrs[i], -1, &value);
      assert(err == 0);

      err = js_set_element(env, argv[1], i, value);
      assert(err == 0);
    }
  }

  if (!r->exiting) js_call_function_with_checkpoint(env, ctx, callback, 2, argv, NULL);

  err = js_close_handle_scope(env, scope);
  assert(err == 0);

  err = js_finish_deferred_teardown_callback(teardown);
  assert(err == 0);
}

static js_value_t *
fs_ext_js_try_lock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  bool exclusive;
  err = js_get_value_bool(env, argv[3], &exclusive);
  assert(err == 0);

  err = fs_ext_try_lock(
    uv_get_osfhandle(fd),
    offset,
    len,
    exclusive ? FS_EXT_WRLOCK : FS_EXT_RDLOCK
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);
  }

  return NULL;
}

static js_value_t *
fs_ext_js_wait_for_lock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 6;
  js_value_t *argv[6];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 6);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  bool exclusive;
  err = js_get_value_bool(env, argv[3], &exclusive);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_lock_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_lock_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_wait_for_lock(
    loop,
    (fs_ext_lock_t *) req,
    uv_get_osfhandle(fd),
    offset,
    len,
    exclusive ? FS_EXT_WRLOCK : FS_EXT_RDLOCK,
    fs_ext_js__on_lock
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[4], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[5], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_try_downgrade_lock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  err = fs_ext_try_downgrade_lock(uv_get_osfhandle(fd), offset, len);

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);
  }

  return NULL;
}

static js_value_t *
fs_ext_js_wait_for_downgrade_lock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 5;
  js_value_t *argv[5];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 5);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_lock_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_lock_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_wait_for_downgrade_lock(
    loop,
    (fs_ext_lock_t *) req,
    uv_get_osfhandle(fd),
    offset,
    len,
    fs_ext_js__on_lock
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[3], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[4], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_try_upgrade_lock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  err = fs_ext_try_upgrade_lock(uv_get_osfhandle(fd), offset, len);

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);
  }

  return NULL;
}

static js_value_t *
fs_ext_js_wait_for_upgrade_lock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 5;
  js_value_t *argv[5];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 5);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_lock_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_lock_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_wait_for_upgrade_lock(
    loop,
    (fs_ext_lock_t *) req,
    uv_get_osfhandle(fd),
    offset,
    len,
    fs_ext_js__on_lock
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[3], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[4], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_unlock(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  err = fs_ext_unlock(uv_get_osfhandle(fd), offset, len);

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);
  }

  return NULL;
}

static js_value_t *
fs_ext_js_trim(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 5;
  js_value_t *argv[5];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 5);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_trim_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_trim_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_trim(
    loop,
    (fs_ext_trim_t *) req,
    uv_get_osfhandle(fd),
    offset,
    len,
    fs_ext_js__on_trim
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[3], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[4], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_sparse(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_sparse_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_sparse_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_sparse(
    loop,
    (fs_ext_sparse_t *) req,
    uv_get_osfhandle(fd),
    fs_ext_js__on_sparse
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[1], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[2], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_swap(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  fs_ext_js_path_t from;
  err = js_get_value_string_utf8(env, argv[0], from, sizeof(from), NULL);
  assert(err == 0);

  fs_ext_js_path_t to;
  err = js_get_value_string_utf8(env, argv[1], to, sizeof(to), NULL);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_swap_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_swap_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_swap(
    loop,
    (fs_ext_swap_t *) req,
    (const char *) from,
    (const char *) to,
    fs_ext_js__on_swap
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[2], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[3], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_get_attr(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[1], NULL, 0, &name_len);
  assert(err == 0);

  name_len += 1 /* NULL */;

  utf8_t *name = malloc(name_len);
  err = js_get_value_string_utf8(env, argv[1], name, name_len, NULL);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_get_attr_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_get_attr_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_get_attr(
    loop,
    (fs_ext_get_attr_t *) req,
    uv_get_osfhandle(fd),
    (const char *) name,
    fs_ext_js__on_get_attr
  );

  free(name);

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[2], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[3], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_set_attr(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 7;
  js_value_t *argv[7];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 7);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[1], NULL, 0, &name_len);
  assert(err == 0);

  name_len += 1 /* NULL */;

  utf8_t *name = malloc(name_len);
  err = js_get_value_string_utf8(env, argv[1], name, name_len, NULL);
  assert(err == 0);

  char *data;
  err = js_get_arraybuffer_info(env, argv[2], (void **) &data, NULL);
  assert(err == 0);

  int64_t data_offset;
  err = js_get_value_int64(env, argv[3], &data_offset);
  assert(err == 0);

  int64_t data_len;
  err = js_get_value_int64(env, argv[4], &data_len);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_set_attr_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_set_attr_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  uv_buf_t buf = uv_buf_init(&data[data_offset], data_len);

  err = fs_ext_set_attr(
    loop,
    (fs_ext_set_attr_t *) req,
    uv_get_osfhandle(fd),
    (const char *) name,
    &buf,
    fs_ext_js__on_set_attr
  );

  free(name);

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[5], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[6], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_remove_attr(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[1], NULL, 0, &name_len);
  assert(err == 0);

  name_len += 1 /* NULL */;

  utf8_t *name = malloc(name_len);
  err = js_get_value_string_utf8(env, argv[1], name, name_len, NULL);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_remove_attr_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_remove_attr_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_remove_attr(
    loop,
    (fs_ext_remove_attr_t *) req,
    uv_get_osfhandle(fd),
    (const char *) name,
    fs_ext_js__on_remove_attr
  );

  free(name);

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[2], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[3], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_list_attrs(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  int64_t fd;
  err = js_get_value_int64(env, argv[0], &fd);
  assert(err == 0);

  js_value_t *handle;

  fs_ext_js_list_attrs_t *req;
  err = js_create_arraybuffer(env, sizeof(fs_ext_js_list_attrs_t), (void **) &req, &handle);
  assert(err == 0);

  uv_loop_t *loop;
  err = js_get_env_loop(env, &loop);
  assert(err == 0);

  err = fs_ext_list_attrs(
    loop,
    (fs_ext_list_attrs_t *) req,
    uv_get_osfhandle(fd),
    fs_ext_js__on_list_attrs
  );

  if (err < 0) {
    err = js_throw_error(env, uv_err_name(err), uv_strerror(err));
    assert(err == 0);

    return NULL;
  }

  req->env = env;
  req->exiting = false;

  err = js_create_reference(env, argv[1], 1, &req->ctx);
  assert(err == 0);

  err = js_create_reference(env, argv[2], 1, &req->cb);
  assert(err == 0);

  err = js_add_deferred_teardown_callback(env, fs_ext_js__on_teardown, (void *) &req->exiting, &req->teardown);
  assert(err == 0);

  return handle;
}

static js_value_t *
fs_ext_js_exports(js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn) \
  { \
    js_value_t *val; \
    err = js_create_function(env, name, -1, fn, NULL, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("tryLock", fs_ext_js_try_lock)
  V("waitForLock", fs_ext_js_wait_for_lock)
  V("tryDowngradeLock", fs_ext_js_try_downgrade_lock)
  V("waitForDowngradeLock", fs_ext_js_wait_for_downgrade_lock)
  V("tryUpgradeLock", fs_ext_js_try_upgrade_lock)
  V("waitForUpgradeLock", fs_ext_js_wait_for_upgrade_lock)
  V("unlock", fs_ext_js_unlock)
  V("trim", fs_ext_js_trim)
  V("sparse", fs_ext_js_sparse)
  V("swap", fs_ext_js_swap)
  V("getAttr", fs_ext_js_get_attr)
  V("setAttr", fs_ext_js_set_attr)
  V("removeAttr", fs_ext_js_remove_attr)
  V("listAttrs", fs_ext_js_list_attrs)
#undef V

  return exports;
}

BARE_MODULE(fs_ext_js, fs_ext_js_exports)
