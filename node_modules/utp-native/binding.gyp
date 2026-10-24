{
  "targets": [{
    "target_name": "utp_native",
    'dependencies': [
      'deps/libutp.gyp:libutp',
    ],
    "include_dirs": [
      "<!(node -e \"require('napi-macros')\")",
      "deps/libutp",
    ],
    "sources": [
      "./binding.cc",
    ],
    'xcode_settings': {
      'OTHER_CFLAGS': [
        '-O3',
      ]
    },
    'cflags': [
      '-O3',
    ],
    'conditions': [
      ['OS=="win"', {
        'link_settings': {
          'libraries': [
            '-lws2_32.lib'
          ]
        }
      }]
    ],
  }]
}
