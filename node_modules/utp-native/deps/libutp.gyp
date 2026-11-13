{
  # 'variables': {
  #   'libutp_target_type%': 'static_library',
  # },
  'target_defaults': {
    'defines': [
      'POSIX'
    ],
  },
  'targets': [
    {
      'target_name': 'libutp',
      'type': 'static_library',
      'sources': [
        'libutp/utp_internal.cpp',
        'libutp/utp_utils.cpp',
        'libutp/utp_hash.cpp',
        'libutp/utp_callbacks.cpp',
        'libutp/utp_api.cpp',
        'libutp/utp_packedsockaddr.cpp',
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'CLANG_CXX_LANGUAGE_STANDARD': 'c++98',
            'OTHER_CFLAGS': [
              '-O3',
            ],
          },
        }],
      ],
      'cflags': [
        '-O3',
      ],
    },
  ],
}
