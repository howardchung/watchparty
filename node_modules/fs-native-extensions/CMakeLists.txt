cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)
find_package(cmake-napi REQUIRED PATHS node_modules/cmake-napi)
find_package(cmake-npm REQUIRED PATHS node_modules/cmake-npm)

project(fs_native_extensions C)

fetch_package("github:libuv/libuv@1.51.0")

add_library(fs_native_extensions STATIC)

target_sources(
  fs_native_extensions
  INTERFACE
    include/fs-ext.h
  PRIVATE
    src/platform.h
    src/shared.c
)

target_include_directories(
  fs_native_extensions
  INTERFACE
    include
  PRIVATE
    $<TARGET_PROPERTY:uv,INTERFACE_INCLUDE_DIRECTORIES>
)

if(APPLE)
  target_sources(
    fs_native_extensions
    PRIVATE
      src/apple.c
  )
endif()

if(LINUX OR ANDROID)
  target_sources(
    fs_native_extensions
    PRIVATE
      src/linux.c
  )
endif()

if(WIN32)
  target_sources(
    fs_native_extensions
    PRIVATE
      src/win32.c
      src/win32/nt.h
  )
else()
  target_sources(
    fs_native_extensions
    PRIVATE
      src/posix.c
  )
endif()

add_bare_module(fs_native_extensions_bare)

target_sources(
  ${fs_native_extensions_bare}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${fs_native_extensions_bare}
  PRIVATE
    fs_native_extensions
)

if(WIN32)
  target_link_libraries(
    ${fs_native_extensions_bare}
    PUBLIC
      ntdll
  )
endif()

add_napi_module(fs_native_extensions_napi)

target_sources(
  ${fs_native_extensions_napi}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${fs_native_extensions_napi}
  PRIVATE
    fs_native_extensions
)

target_compile_definitions(
  ${fs_native_extensions_napi}
  PRIVATE
    NAPI_VERSION=9
)

resolve_node_module(bare-compat-napi compat)

target_include_directories(
  ${fs_native_extensions_napi}
  PRIVATE
    "${compat}/include"
)

if(WIN32)
  target_link_libraries(
    ${fs_native_extensions_napi}
    PUBLIC
      ntdll
  )
endif()
