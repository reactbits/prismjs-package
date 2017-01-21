'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = highlight;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _prism = require('./prism');

var _prism2 = _interopRequireDefault(_prism);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// language aliases
var aliases = {
  javascript: 'js',
  csharp: 'c#'
};

_lodash2.default.toPairs(aliases).forEach(function (p) {
  var lang = _prism2.default.languages[p[0]];
  if (!lang) return;
  var alt = p[1];
  if (_lodash2.default.isString(alt)) {
    _prism2.default.languages[alt] = lang;
  } else if (_lodash2.default.isArray(alt)) {
    alt.forEach(function (a) {
      _prism2.default.languages[a] = lang;
    });
  }
});

function codeBlock(html, lang) {
  var className = 'language-' + lang;
  return '<pre class="' + className + '"><code>' + html + '</code></pre>';
}

var defaultOptions = {
  wrap: true
};

function highlight(code, lang) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var grammar = _prism2.default.languages[lang];
  if (grammar) {
    var opts = _extends({}, defaultOptions, options);
    var html = _prism2.default.highlight(code, grammar, lang);
    return opts.wrap ? codeBlock(html, lang) : html;
  }
  // TODO inteligent language detection
  return code;
}