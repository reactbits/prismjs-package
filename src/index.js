import Prism from '../prism';
import _ from 'lodash';

// language aliases
const aliases = {
	javascript: 'js',
	csharp: 'c#',
};

_.toPairs(aliases).forEach(p => {
	const lang = Prism.languages[p[0]];
	if (!lang) return;
	const alt = p[1];
	if (_.isString(alt)) {
		Prism.languages[alt] = lang;
	} else if (_.isArray(alt)) {
		alt.forEach(a => {
			Prism.languages[a] = lang;
		});
	}
});

function codeBlock(html, lang) {
	const className = `language-${lang}`;
	return `<pre class="${className}"><code>${html}</code></pre>`;
}

export function highlight(code, lang) {
	const grammar = Prism.languages[lang];
	if (grammar) {
		return codeBlock(Prism.highlight(code, grammar, lang));
	}
	// TODO inteligent language detection
	return code;
}

export default highlight;
