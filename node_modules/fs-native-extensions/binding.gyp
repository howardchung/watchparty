{
  'targets': [{
    'target_name': 'fs_ext',
    'include_dirs': [
      '<!(node -e "require(\'napi-macros\')")'
    ],
    'sources': [
      './src/shared.c',
      './binding.c'
    ],
    'configurations': {
      'Debug': {
        'defines': ['DEBUG'],
      },
      'Release': {
        'defines': ['NDEBUG'],
      },
    },
    'conditions': [
      ['OS=="mac"', {
        'sources': [
          './src/mac.c'
        ],
      }],
      ['OS=="linux"', {
        'sources': [
          './src/linux.c'
        ],
      }],
      ['OS=="win"', {
        'sources': [
          './src/win.c'
        ],
      }, {
        'sources': [
          './src/posix.c',
        ],
      }],
    ],
  }]
}

