cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

project(node_datachannel VERSION 0.12.0)

# -Dnapi_build_version=8
add_definitions(-DNAPI_VERSION=8)

include_directories(${CMAKE_JS_INC})

set(CMAKE_BUILD_TYPE Release)

if(WIN32)
    set(OPENSSL_MSVC_STATIC_RT TRUE)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

if(CMAKE_HOST_SYSTEM_NAME STREQUAL "Android")
    set(CMAKE_C_FLAGS "-Wno-error=unused-but-set-variable -Wno-error=strict-prototypes")
endif()

set(OPENSSL_USE_STATIC_LIBS TRUE)
find_package(OpenSSL REQUIRED)

include(FetchContent)

# Fetch libdatachannel
FetchContent_Declare(
    libdatachannel
    GIT_REPOSITORY https://github.com/paullouisageneau/libdatachannel.git
    GIT_TAG "v0.21.2"
)

option(NO_MEDIA "Disable media transport support in libdatachannel" OFF)
option(NO_WEBSOCKET "Disable WebSocket support in libdatachannel" OFF)

FetchContent_GetProperties(libdatachannel)

if(NOT libdatachannel)
    FetchContent_Populate(libdatachannel)
    add_subdirectory(${libdatachannel_SOURCE_DIR} ${libdatachannel_BINARY_DIR} EXCLUDE_FROM_ALL)
endif()

add_library(${PROJECT_NAME} SHARED
    src/rtc-wrapper.cpp
    src/media-direction.cpp
    src/media-rtcpreceivingsession-wrapper.cpp
    src/media-track-wrapper.cpp
    src/media-audio-wrapper.cpp
    src/media-video-wrapper.cpp
    src/data-channel-wrapper.cpp
    src/peer-connection-wrapper.cpp
    src/thread-safe-callback.cpp
    src/web-socket-wrapper.cpp
    src/web-socket-server-wrapper.cpp
    src/main.cpp
    ${CMAKE_JS_SRC}
)

set_target_properties(${PROJECT_NAME} PROPERTIES CXX_STANDARD 17)
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api
    ${CMAKE_BINARY_DIR}/_deps/libdatachannel-src/include
    ${CMAKE_BINARY_DIR}/_deps/libdatachannel-src/deps/plog
)

set(LINK_LIBRARIES
    ${CMAKE_JS_LIB}
    datachannel-static
    plog::plog
)

if(APPLE)
#
elseif(CMAKE_HOST_SYSTEM_NAME STREQUAL "Android")
    list(APPEND LINK_LIBRARIES -static-libgcc)
elseif(UNIX)
    list(APPEND LINK_LIBRARIES -static-libgcc -static-libstdc++)
endif()

if(WIN32)
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MT")
    list(APPEND LINK_LIBRARIES crypt32.lib)
endif()

target_link_libraries(${PROJECT_NAME} PRIVATE ${LINK_LIBRARIES})
