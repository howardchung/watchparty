const constants = require('./constants')

const symbols = {
  [constants.EQ]: '=',
  [constants.LT]: '<',
  [constants.LTE]: '<=',
  [constants.GT]: '>',
  [constants.GTE]: '>='
}

module.exports = class Comparator {
  constructor (operator, version) {
    this.operator = operator
    this.version = version
  }

  test (version) {
    const result = version.compare(this.version)

    switch (this.operator) {
      case constants.LT: return result < 0
      case constants.LTE: return result <= 0
      case constants.GT: return result > 0
      case constants.GTE: return result >= 0
      default: return result === 0
    }
  }

  toString () {
    return symbols[this.operator] + this.version
  }
}
