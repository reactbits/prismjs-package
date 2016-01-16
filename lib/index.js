'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.highlight = highlight;

var _prism = require('./prism');

var _prism2 = _interopRequireDefault(_prism);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

function highlight(code, lang) {
	var grammar = _prism2.default.languages[lang];
	if (grammar) {
		return codeBlock(_prism2.default.highlight(code, grammar, lang));
	}
	// TODO inteligent language detection
	return code;
}

exports.default = highlight;