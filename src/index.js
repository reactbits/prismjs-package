import _ from 'lodash';
import Prism from './prism';

// language aliases
const aliases = {
  javascript: 'js',
  csharp: 'c#',
};

_.toPairs(aliases).forEach((p) => {
  const lang = Prism.languages[p[0]];
  if (!lang) return;
  const alt = p[1];
  if (_.isString(alt)) {
    Prism.languages[alt] = lang;
  } else if (_.isArray(alt)) {
    alt.forEach((a) => {
      Prism.languages[a] = lang;
    });
  }
});

function codeBlock(html, lang) {
  const className = `language-${lang}`;
  return `<pre class="${className}"><code>${html}</code></pre>`;
}

const defaultOptions = {
  wrap: true,
};

export default function highlight(code, lang, options = {}) {
  const grammar = Prism.languages[lang];
  if (grammar) {
    const opts = { ...defaultOptions, ...options };
    const html = Prism.highlight(code, grammar, lang);
    return opts.wrap ? codeBlock(html, lang) : html;
  }
  // TODO inteligent language detection
  return code;
}
