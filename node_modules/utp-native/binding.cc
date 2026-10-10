#include <node_api.h>
#include <napi-macros.h>
#include <uv.h>
#include <stdlib.h>
#include <string.h>
#include "./deps/libutp/utp.h"

#define UTP_NAPI_TIMEOUT_INTERVAL 20

#define UTP_NAPI_THROW(err) \
  { \
    napi_throw_error(env, uv_err_name(err), uv_strerror(err)); \
    return NULL; \
  }

#define NAPI_MAKE_CALLBACK_AND_ALLOC(env, nil, ctx, cb, n, argv, res, nread) \
  if (napi_make_callback(env, nil, ctx, cb, n, argv, &res) == napi_pending_exception) { \
    napi_value fatal_exception; \
    napi_get_and_clear_last_exception(env, &fatal_exception); \
    napi_fatal_exception(env, fatal_exception); \
    { \
      UTP_NAPI_CALLBACK(self->realloc, { \
        NAPI_MAKE_CALLBACK(env, nil, ctx, callback, 0, NULL, &res); \
        UTP_NAPI_BUFFER_ALLOC(self, res, 0) \
      }) \
    } \
  } else { \
    UTP_NAPI_BUFFER_ALLOC(self, res, nread) \
  }

#define UTP_NAPI_CALLBACK(fn, src) \
  napi_env env = self->env; \
  napi_handle_scope scope; \
  napi_open_handle_scope(env, &scope); \
  napi_value ctx; \
  napi_get_reference_value(env, self->ctx, &ctx); \
  napi_value callback; \
  napi_get_reference_value(env, fn, &callback); \
  src \
  napi_close_handle_scope(env, scope);

#define UTP_NAPI_BUFFER_ALLOC(self, ret, nread) \
  char *buf; \
  size_t buf_len; \
  napi_get_buffer_info(env, ret, (void **) &buf, &buf_len); \
  if (buf_len == 0) { \
    size_t size = nread <= 0 ? 0 : nread; \
    self->buf.base += size; \
    self->buf.len -= size; \
  } else { \
    self->buf.base = buf; \
    self->buf.len = buf_len; \
  }

typedef struct {
  uint32_t min_recv_packet_size;
  uint32_t recv_packet_size;

  struct utp_iovec send_buffer[256];
  struct utp_iovec *send_buffer_next;
  uint32_t send_buffer_missing;

  utp_socket *socket;
  napi_env env;
  napi_ref ctx;
  uv_buf_t buf;
  napi_ref on_read;
  napi_ref on_drain;
  napi_ref on_end;
  napi_ref on_error;
  napi_ref on_close;
  napi_ref on_connect;
  napi_ref realloc;
} utp_napi_connection_t;

typedef struct {
  uv_udp_t handle;
  utp_context *utp;
  uint32_t accept_connections;
  utp_napi_connection_t *next_connection;
  uv_timer_t timer;
  napi_env env;
  napi_ref ctx;
  uv_buf_t buf;
  napi_ref on_message;
  napi_ref on_send;
  napi_ref on_connection;
  napi_ref on_close;
  napi_ref realloc;
  int pending_close;
  int closing;
} utp_napi_t;

typedef struct {
  uv_udp_send_t req;
  napi_ref ctx;
} utp_napi_send_request_t;

static void
on_sendto_free (uv_udp_send_t *req, int status) {
  free(req);
}

static int
utp_napi_connection_drain (utp_napi_connection_t *self) {

  struct utp_iovec *next = self->send_buffer_next;
  uint32_t missing = self->send_buffer_missing;

  if (!missing) return 1;

  int sent_bytes = utp_writev(self->socket, next, missing);
  if (sent_bytes < 0) {
    UTP_NAPI_CALLBACK(self->on_error, {
      napi_value argv[1];
      napi_create_int32(env, sent_bytes, &(argv[0]));
      NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 1, argv, NULL)
    })
    return 0;
  }

  size_t bytes = sent_bytes;

  while (bytes > 0) {
    if (next->iov_len <= bytes) {
      bytes -= next->iov_len;
      next++;
      missing--;
    } else {
      next->iov_len -= bytes;
      next->iov_base = ((char *) next->iov_base) + bytes;
      break;
    }
  }

  self->send_buffer_missing = missing;
  self->send_buffer_next = next;

  return missing ? 0 : 1;
}

inline static void
utp_napi_parse_address (struct sockaddr *name, char *ip, int *port) {
  struct sockaddr_in *name_in = (struct sockaddr_in *) name;
  *port = ntohs(name_in->sin_port);
  uv_ip4_name(name_in, ip, 17);
}

static void
on_uv_interval (uv_timer_t *req) {
  utp_napi_t *self = (utp_napi_t *) req->data;
  utp_issue_deferred_acks(self->utp);
  utp_check_timeouts(self->utp);
}

static void
on_uv_alloc (uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf) {
  utp_napi_t *self = (utp_napi_t *) handle->data;
  *buf = self->buf;
}

static void
on_uv_read (uv_udp_t *handle, ssize_t nread, const uv_buf_t *buf, const struct sockaddr *addr, unsigned flags) {
  utp_napi_t *self = (utp_napi_t *) handle->data;

  // TODO: is this overkill to call here?
  // we do it because ucat.c does it
  utp_check_timeouts(self->utp);
  if (self->closing) return;

  if (nread == 0) {
    utp_issue_deferred_acks(self->utp);
    return;
  }

  if (nread > 0) {
    const unsigned char *base = (const unsigned char *) buf->base;
    if (utp_process_udp(self->utp, base, nread, addr, sizeof(struct sockaddr))) return;
  }

  int port;
  char ip[17];
  utp_napi_parse_address((struct sockaddr *) addr, ip, &port);

  UTP_NAPI_CALLBACK(self->on_message, {
    napi_value ret;
    napi_value argv[3];
    napi_create_int32(env, nread, &(argv[0]));
    napi_create_uint32(env, port, &(argv[1]));
    napi_create_string_utf8(env, ip, NAPI_AUTO_LENGTH, &(argv[2]));
    NAPI_MAKE_CALLBACK_AND_ALLOC(env, NULL, ctx, callback, 3, argv, ret, nread)
  })
}

static void
on_uv_close (uv_handle_t *handle) {
  utp_napi_t *self = (utp_napi_t *) handle->data;

  self->pending_close--;
  if (self->pending_close > 0) return;

  UTP_NAPI_CALLBACK(self->on_close, {
    NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 0, NULL, NULL);
  })
}

static void
on_uv_send (uv_udp_send_t *req, int status) {
  uv_udp_t *handle = req->handle;
  utp_napi_t *self = (utp_napi_t *) handle->data;
  utp_napi_send_request_t *send = (utp_napi_send_request_t *) req->data;

  UTP_NAPI_CALLBACK(self->on_send, {
    napi_value argv[2];
    napi_get_reference_value(env, send->ctx, &(argv[0]));
    napi_create_int32(env, status, &(argv[1]));
    NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 2, argv, NULL);
  })
}

static uint64
on_utp_firewall (utp_callback_arguments *a) {
  utp_napi_t *self = (utp_napi_t *) utp_context_get_userdata(a->context);

  return self->accept_connections ? 0 : 1;
}

inline static void
utp_napi_connection_destroy (utp_napi_connection_t *self) {
  UTP_NAPI_CALLBACK(self->on_close, {
    NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 0, NULL, NULL)
  })

  self->env = env;
  self->buf.base = NULL;
  self->buf.len = 0;

  napi_delete_reference(self->env, self->ctx);
  napi_delete_reference(self->env, self->on_read);
  napi_delete_reference(self->env, self->on_drain);
  napi_delete_reference(self->env, self->on_end);
  napi_delete_reference(self->env, self->on_error);
  napi_delete_reference(self->env, self->on_close);
  napi_delete_reference(self->env, self->realloc);
}

static uint64
on_utp_state_change (utp_callback_arguments *a) {
  utp_napi_connection_t *self = (utp_napi_connection_t *) utp_get_userdata(a->socket);

  switch (a->state) {
    case UTP_STATE_CONNECT: {
      UTP_NAPI_CALLBACK(self->on_connect, {
        NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 0, NULL, NULL)
      })
      break;
    }

    case UTP_STATE_WRITABLE: {
      if (utp_napi_connection_drain(self)) {
        UTP_NAPI_CALLBACK(self->on_drain, {
          NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 0, NULL, NULL)
        })
      }
      break;
    }

    case UTP_STATE_EOF: {
      if (self->recv_packet_size) {
        UTP_NAPI_CALLBACK(self->on_read, {
          napi_value ret;
          napi_value argv[1];
          napi_create_uint32(env, self->recv_packet_size, &(argv[0]));
          NAPI_MAKE_CALLBACK_AND_ALLOC(env, NULL, ctx, callback, 1, argv, ret, self->recv_packet_size)
          self->recv_packet_size = 0;
        })
      }
      UTP_NAPI_CALLBACK(self->on_end, {
        NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 0, NULL, NULL)
      })
      break;
    }

    case UTP_STATE_DESTROYING: {
      utp_napi_connection_destroy(self);
      break;
    }

    default: {
      printf("on_utp_statechange (unkown state: %i)\n", a->state);
      break;
    }
  }

  return 0;
}

static uint64
on_utp_accept (utp_callback_arguments *a) {
  utp_napi_t *self = (utp_napi_t *) utp_context_get_userdata(a->context);

  struct sockaddr addr;
  socklen_t addr_len = sizeof(addr);
  utp_getpeername(a->socket, &addr, &addr_len);

  int port;
  char ip[17];
  utp_napi_parse_address(&addr, ip, &port);

  self->next_connection->socket = a->socket;
  utp_set_userdata(a->socket, self->next_connection);

  UTP_NAPI_CALLBACK(self->on_connection, {
    napi_value argv[2];
    napi_create_uint32(env, port, &(argv[0]));
    napi_create_string_utf8(env, ip, NAPI_AUTO_LENGTH, &(argv[1]));
    napi_value next;
    NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 2, argv, &next) // will never throw due to the event being NTed in js
    utp_napi_connection_t *connection;
    size_t connection_size;
    napi_get_buffer_info(env, next, (void **) &connection, &connection_size);
    self->next_connection = connection;
  })

  return 0;
}

static uint64
on_utp_error (utp_callback_arguments *a) {
  utp_napi_connection_t *self = (utp_napi_connection_t *) utp_get_userdata(a->socket);

  UTP_NAPI_CALLBACK(self->on_error, {
    napi_value argv[1];
    napi_create_int32(env, a->error_code, &(argv[0]));
    NAPI_MAKE_CALLBACK(env, NULL, ctx, callback, 1, argv, NULL)
  })

  return 0;
}

static uint64
on_utp_read (utp_callback_arguments *a) {
  utp_napi_connection_t *self = (utp_napi_connection_t *) utp_get_userdata(a->socket);

  memcpy(self->buf.base + self->recv_packet_size, a->buf, a->len);
  self->recv_packet_size += a->len;

  if (self->recv_packet_size < self->min_recv_packet_size) {
    return 0;
  }

  UTP_NAPI_CALLBACK(self->on_read, {
    napi_value ret;
    napi_value argv[1];
    napi_create_uint32(env, self->recv_packet_size, &(argv[0]));
    NAPI_MAKE_CALLBACK_AND_ALLOC(env, NULL, ctx, callback, 1, argv, ret, self->recv_packet_size)
    self->recv_packet_size = 0;
  })

  return 0;
}

static uint64
on_utp_sendto (utp_callback_arguments *a) {
  utp_napi_t *self = (utp_napi_t *) utp_context_get_userdata(a->context);
  uv_buf_t buf = uv_buf_init((char *) a->buf, a->len);

  if (uv_udp_try_send(&(self->handle), &buf, 1, a->address) >= 0) return 0;

  char *cpy = (char *) malloc(sizeof(uv_udp_send_t) + a->len);

  buf.base = cpy + sizeof(uv_udp_send_t);
  memcpy(buf.base, a->buf, a->len);

  uv_udp_send((uv_udp_send_t *) cpy, &(self->handle), &buf, 1, a->address, on_sendto_free);

  return 0;
}

NAPI_METHOD(utp_napi_init) {
  NAPI_ARGV(9)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)

  self->closing = 0;
  self->pending_close = 2;
  self->env = env;
  napi_create_reference(env, argv[1], 1, &(self->ctx));

  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, next, 2)
  self->next_connection = next;

  uv_timer_t *timer = &(self->timer);
  timer->data = self;

  struct uv_loop_s *loop;
  napi_get_uv_event_loop(env, &loop);

  int err = uv_timer_init(loop, timer);
  if (err < 0) UTP_NAPI_THROW(err)

  NAPI_ARGV_BUFFER(buf, 3)
  self->buf.base = buf;
  self->buf.len = buf_len;

  uv_udp_t *handle = &(self->handle);
  handle->data = self;

  err = uv_udp_init(loop, handle);
  if (err < 0) UTP_NAPI_THROW(err)

  napi_create_reference(env, argv[4], 1, &(self->on_message));
  napi_create_reference(env, argv[5], 1, &(self->on_send));
  napi_create_reference(env, argv[6], 1, &(self->on_connection));
  napi_create_reference(env, argv[7], 1, &(self->on_close));
  napi_create_reference(env, argv[8], 1, &(self->realloc));

  self->utp = utp_init(2);
  utp_context_set_userdata(self->utp, self);

  utp_set_callback(self->utp, UTP_ON_STATE_CHANGE, &on_utp_state_change);
  utp_set_callback(self->utp, UTP_ON_READ, &on_utp_read);
  utp_set_callback(self->utp, UTP_ON_FIREWALL, &on_utp_firewall);
  utp_set_callback(self->utp, UTP_ON_ACCEPT, &on_utp_accept);
  utp_set_callback(self->utp, UTP_SENDTO, &on_utp_sendto);
  utp_set_callback(self->utp, UTP_ON_ERROR, &on_utp_error);

  self->accept_connections = 0;

  return NULL;
}

NAPI_METHOD(utp_napi_close) {
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)

  self->closing = 1;

  int err;

  err = uv_timer_stop(&(self->timer));
  if (err < 0) UTP_NAPI_THROW(err)

  err = uv_udp_recv_stop(&(self->handle));
  if (err < 0) UTP_NAPI_THROW(err)

  uv_close((uv_handle_t *) &(self->handle), on_uv_close);
  uv_close((uv_handle_t *) &(self->timer), on_uv_close);

  return NULL;
}

NAPI_METHOD(utp_napi_destroy) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  napi_value send_reqs = argv[1];

  self->buf.base = NULL;
  self->buf.len = 0;

  napi_delete_reference(env, self->ctx);
  napi_delete_reference(env, self->on_message);
  napi_delete_reference(env, self->on_send);
  napi_delete_reference(env, self->on_connection);
  napi_delete_reference(env, self->on_close);
  napi_delete_reference(env, self->realloc);

  NAPI_FOR_EACH(send_reqs, el) {
    NAPI_BUFFER_CAST(utp_napi_send_request_t *, send_req, el)
    napi_delete_reference(env, send_req->ctx);
  }

  utp_destroy(self->utp);
  self->utp = NULL;

  return NULL;
}

NAPI_METHOD(utp_napi_bind) {
  NAPI_ARGV(3)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  NAPI_ARGV_UINT32(port, 1)
  NAPI_ARGV_UTF8(ip, 17, 2)

  uv_udp_t *handle = &(self->handle);

  int err;
  struct sockaddr_in addr;

  err = uv_ip4_addr((char *) &ip, port, &addr);
  if (err < 0) UTP_NAPI_THROW(err)

  err = uv_udp_bind(handle, (const struct sockaddr*) &addr, 0);
  if (err < 0) UTP_NAPI_THROW(err)

  // TODO: We should close the handle here also if this fails
  err = uv_udp_recv_start(handle, on_uv_alloc, on_uv_read);
  if (err < 0) UTP_NAPI_THROW(err)

  // TODO: same as above
  err = uv_timer_start(&(self->timer), on_uv_interval, UTP_NAPI_TIMEOUT_INTERVAL, UTP_NAPI_TIMEOUT_INTERVAL);
  if (err < 0) UTP_NAPI_THROW(err)

  uv_unref((uv_handle_t *) &(self->timer));

  return NULL;
}

NAPI_METHOD(utp_napi_local_port) {
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)

  int err;
  struct sockaddr name;
  int name_len = sizeof(name);

  err = uv_udp_getsockname(&(self->handle), &name, &name_len);
  if (err < 0) UTP_NAPI_THROW(err)

  struct sockaddr_in *name_in = (struct sockaddr_in *) &name;
  int port = ntohs(name_in->sin_port);

  NAPI_RETURN_UINT32(port)
}

NAPI_METHOD(utp_napi_send_request_init) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_send_request_t *, send_req, 0)

  uv_udp_send_t *req = &(send_req->req);
  req->data = send_req;

  napi_create_reference(env, argv[1], 1, &(send_req->ctx));

  return NULL;
}

NAPI_METHOD(utp_napi_send) {
  NAPI_ARGV(7)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  NAPI_ARGV_BUFFER_CAST(utp_napi_send_request_t *, send_req, 1)
  NAPI_ARGV_BUFFER(buf, 2)
  NAPI_ARGV_UINT32(offset, 3)
  NAPI_ARGV_UINT32(len, 4)
  NAPI_ARGV_UINT32(port, 5)
  NAPI_ARGV_UTF8(ip, 17, 6)

  uv_udp_send_t *req = &(send_req->req);

  uv_buf_t bufs = {};
  bufs.base = buf + offset;
  bufs.len = len;

  struct sockaddr_in addr;
  int err;

  err = uv_ip4_addr((char *) &ip, port, &addr);
  if (err) UTP_NAPI_THROW(err)

  err = uv_udp_send(req, &(self->handle), &bufs, 1, (const struct sockaddr *) &addr, on_uv_send);
  if (err) UTP_NAPI_THROW(err)

  return NULL;
}

NAPI_METHOD(utp_napi_ref) {
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)

  uv_ref((uv_handle_t *) &(self->handle));

  return NULL;
}

NAPI_METHOD(utp_napi_unref) {
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)

  uv_unref((uv_handle_t *) &(self->handle));

  return NULL;
}

NAPI_METHOD(utp_napi_recv_buffer) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  NAPI_ARGV_INT32(size, 1)

  int err;
  NAPI_UV_THROWS(err, uv_recv_buffer_size((uv_handle_t *) &(self->handle), &size))

  NAPI_RETURN_INT32(size)
}

NAPI_METHOD(utp_napi_send_buffer) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  NAPI_ARGV_INT32(size, 1)

  int err;
  NAPI_UV_THROWS(err, uv_send_buffer_size((uv_handle_t *) &(self->handle), &size))

  NAPI_RETURN_INT32(size)
}

NAPI_METHOD(utp_napi_set_ttl) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  NAPI_ARGV_UINT32(ttl, 1)

  int err;
  NAPI_UV_THROWS(err, uv_udp_set_ttl(&(self->handle), ttl))

  return NULL;
}

NAPI_METHOD(utp_napi_connection_init) {
  NAPI_ARGV(10)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, self, 0)

  self->env = env;

  napi_create_reference(env, argv[1], 1, &(self->ctx));

  NAPI_ARGV_BUFFER(buf, 2)
  self->buf.base = buf;
  self->buf.len = buf_len;

  napi_create_reference(env, argv[3], 1, &(self->on_read));
  napi_create_reference(env, argv[4], 1, &(self->on_drain));
  napi_create_reference(env, argv[5], 1, &(self->on_end));
  napi_create_reference(env, argv[6], 1, &(self->on_error));
  napi_create_reference(env, argv[7], 1, &(self->on_close));
  napi_create_reference(env, argv[8], 1, &(self->on_connect));
  napi_create_reference(env, argv[9], 1, &(self->realloc));

  return NULL;
}

NAPI_METHOD(utp_napi_connection_on_close) {
  // To trigger a manual teardown if connect was never called
  // on a client connection
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, self, 0)
  utp_napi_connection_destroy(self);
  return NULL;
}

NAPI_METHOD(utp_napi_connection_write) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, self, 0)
  NAPI_ARGV_BUFFER(buf, 1)

  self->send_buffer_next = self->send_buffer;
  self->send_buffer_next->iov_base = buf;
  self->send_buffer_next->iov_len = buf_len;
  self->send_buffer_missing = 1;

  int drained = utp_napi_connection_drain(self);
  NAPI_RETURN_UINT32(drained)
}

NAPI_METHOD(utp_napi_connection_writev) {
  NAPI_ARGV(2)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, self, 0)

  napi_value bufs = argv[1];
  struct utp_iovec *next = self->send_buffer_next = self->send_buffer;

  NAPI_FOR_EACH(bufs, el) {
    NAPI_BUFFER(buf, el)

    next->iov_base = buf;
    next->iov_len = buf_len;
    next++;
  }

  self->send_buffer_missing = bufs_len;

  int drained = utp_napi_connection_drain(self);
  NAPI_RETURN_UINT32(drained)
}

NAPI_METHOD(utp_napi_connection_shutdown) {
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, self, 0)

  utp_shutdown(self->socket, SHUT_WR);

  return NULL;
}

NAPI_METHOD(utp_napi_connection_close) {
  NAPI_ARGV(1)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, self, 0)

  utp_close(self->socket);

  return NULL;
}

NAPI_METHOD(utp_napi_connect) {
  NAPI_ARGV(4)
  NAPI_ARGV_BUFFER_CAST(utp_napi_t *, self, 0)
  NAPI_ARGV_BUFFER_CAST(utp_napi_connection_t *, conn, 1)
  NAPI_ARGV_UINT32(port, 2)
  NAPI_ARGV_UTF8(ip, 17, 3)

  int err;
  struct sockaddr_in addr;

  // TODO: error handle
  conn->socket = utp_create_socket(self->utp);

  utp_set_userdata(conn->socket, conn);

  err = uv_ip4_addr((char *) &ip, port, &addr);
  if (err) UTP_NAPI_THROW(err)

  // TODO: error handle
  utp_connect(conn->socket, (struct sockaddr *) &addr, sizeof(struct sockaddr_in));

  return NULL;
}

NAPI_INIT() {
  NAPI_EXPORT_SIZEOF(utp_napi_t)
  NAPI_EXPORT_SIZEOF(utp_napi_send_request_t)
  NAPI_EXPORT_SIZEOF(utp_napi_connection_t)
  NAPI_EXPORT_OFFSETOF(utp_napi_t, accept_connections)
  NAPI_EXPORT_FUNCTION(utp_napi_init)
  NAPI_EXPORT_FUNCTION(utp_napi_bind)
  NAPI_EXPORT_FUNCTION(utp_napi_local_port)
  NAPI_EXPORT_FUNCTION(utp_napi_send_request_init)
  NAPI_EXPORT_FUNCTION(utp_napi_send)
  NAPI_EXPORT_FUNCTION(utp_napi_close)
  NAPI_EXPORT_FUNCTION(utp_napi_destroy)
  NAPI_EXPORT_FUNCTION(utp_napi_ref)
  NAPI_EXPORT_FUNCTION(utp_napi_unref)
  NAPI_EXPORT_FUNCTION(utp_napi_set_ttl)
  NAPI_EXPORT_FUNCTION(utp_napi_send_buffer)
  NAPI_EXPORT_FUNCTION(utp_napi_recv_buffer)
  NAPI_EXPORT_FUNCTION(utp_napi_connection_init)
  NAPI_EXPORT_FUNCTION(utp_napi_connection_write)
  NAPI_EXPORT_FUNCTION(utp_napi_connection_writev)
  NAPI_EXPORT_FUNCTION(utp_napi_connection_close)
  NAPI_EXPORT_FUNCTION(utp_napi_connection_shutdown)
  NAPI_EXPORT_FUNCTION(utp_napi_connection_on_close)
  NAPI_EXPORT_FUNCTION(utp_napi_connect)
}
