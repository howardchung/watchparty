'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _linkifyIt = require('linkify-it');

var _linkifyIt2 = _interopRequireDefault(_linkifyIt);

var _tlds = require('tlds');

var _tlds2 = _interopRequireDefault(_tlds);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var linkify = new _linkifyIt2.default();
linkify.tlds(_tlds2.default);

exports.default = function (text) {
  return linkify.match(text);
};