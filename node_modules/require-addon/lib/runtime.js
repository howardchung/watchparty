module.exports =
  typeof Bare !== 'undefined'
    ? 'bare'
    : typeof process !== 'undefined'
      ? 'node'
      : 'unknown'
