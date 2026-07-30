#ifndef FS_EXT_PLATFORM_H
#define FS_EXT_PLATFORM_H

#include <stdint.h>
#include <uv.h>

#include "../include/fs-ext.h"

int
fs_ext__try_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type);

int
fs_ext__wait_for_lock(uv_os_fd_t fd, uint64_t offset, size_t length, fs_ext_lock_type_t type);

int
fs_ext__try_downgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext__wait_for_downgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext__try_upgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext__wait_for_upgrade_lock(uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext__unlock(uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext__trim(uv_os_fd_t fd, uint64_t offset, size_t length);

int
fs_ext__sparse(uv_os_fd_t fd);

int
fs_ext__swap(const char *from, const char *to);

int
fs_ext__get_attr(uv_os_fd_t fd, const char *name, uv_buf_t *value);

int
fs_ext__set_attr(uv_os_fd_t fd, const char *name, const uv_buf_t *value);

int
fs_ext__remove_attr(uv_os_fd_t fd, const char *name);

int
fs_ext__list_attrs(uv_os_fd_t fd, char **names, size_t *length);

#endif // FS_EXT_PLATFORM_H
