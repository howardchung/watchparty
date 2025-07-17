cmake_minimum_required(VERSION 3.25)

project(fs_native_extensions C)

include(bare)

bare_target(target)

add_bare_module(fs_native_extensions)

target_sources(
  fs_native_extensions
  INTERFACE
    include/fs-ext.h
  PRIVATE
    binding.c
    src/shared.c
)

if(NOT target MATCHES "win32")
  target_sources(
    fs_native_extensions
    PRIVATE
      src/posix.c
  )
endif()

if(target MATCHES "darwin|ios")
  target_sources(
    fs_native_extensions
    PRIVATE
      src/mac.c
  )
endif()

if(target MATCHES "linux|android")
  target_sources(
    fs_native_extensions
    PRIVATE
      src/linux.c
  )
endif()

if(target MATCHES "win32")
  target_sources(
    fs_native_extensions
    PRIVATE
      src/win.c
  )
endif()
