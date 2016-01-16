'use strict';
// TODO remove when prism will support bower packaging (there are discussions on github)
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const git = require('gulp-git');
const header = require('gulp-header');
const wrapper = require('gulp-wrapper');
const runSequence = require('run-sequence');

// replaces {id} tokens
function replace(format, data) {
	return format.replace(/{(\w+)}/g, function (m, name) {
		return data[name] ? data[name] : '';
	});
}

function loadComponents() {
	// make prism/components.js to be a module so we could require it
	let src = fs.readFileSync('prism/components.js', 'utf8');
	src += '\nmodule.exports = components;\n';
	const out = './prism-components.js';
	fs.writeFileSync(out, src, 'utf8');
	const data = require(out);
	fs.unlinkSync(out);
	return data;
}

// exclude languages that we won't use
const excludedLanguages = [];

function loadLanguages() {
	const components = loadComponents();

	const langs = _.toPairs(components.languages)
		.map(function (p) {
			const obj = p[1];
			obj.id = p[0].toLowerCase();
			obj.deps = obj.require ? [obj.require] : [];
			return obj;
		})
		.filter(function (t) {
			return t.id !== 'meta' && excludedLanguages.indexOf(t.id) < 0;
		});

  // order languages by "require"
	return require('obj-toposort')(langs).filter(_.identity);
}

// task to build prism package
gulp.task('default', function () {
	return runSequence('pull', ['css', 'js'], 'test');
});

gulp.task('test', function () {
	const Prism = require('./src/prism.js');

	function highlight(code, lang) {
		const g = Prism.languages[lang];
		if (g) {
			return Prism.highlight(code, g, lang);
		}
		return code;
	}

	const s = highlight('fuction() {\n\tconsole.log("hi");\n}', 'js');
	console.log(s);
});

gulp.task('pull', function (done) {
	if (fs.existsSync('prism')) {
		git.pull('origin', 'gh-pages', {
			cwd: path.join(__dirname, 'prism'),
		}, function (err) {
			if (err) throw err;
			done();
		});
	} else {
		git.clone('https://github.com/prismjs/prism', function (err) {
			if (err) throw err;
			done();
		});
	}
});

gulp.task('css', function () {
	// lets try okaidia.css
	return gulp.src('prism/themes/*.css')
		.pipe(gulp.dest('./themes'));
});

gulp.task('js', function () {
	const components = loadComponents();
	const langs = require('./languages.json');

	// TODO add plugins
	const langpath = components.languages.meta.path;
	const glob = [components.core.meta.path].concat(
		langs.map(function (lang) {
			return replace(langpath, { id: lang }) + '.js';
		})
	).map(function (p) {
		return path.join('prism', p);
	});

	console.log(glob);

	const head = fs.readFileSync('./header.js', 'utf8');
	const foot = fs.readFileSync('./footer.js', 'utf8');
	const banner =
		'\n/* **********************************************\n' +
		'     Begin <%= file.relative %>\n' +
		'********************************************** */\n\n';

	return gulp.src(glob)
		.pipe(header(banner))
		.pipe(concat('prism.js'))
		.pipe(wrapper({ header: head, footer: foot }))
		.pipe(gulp.dest('./src'));
});

gulp.task('dump', function () {
	const langs = loadLanguages();
	const ids = langs.map(function (t) { return t.id; });
	fs.writeFileSync('languages.json', JSON.stringify(ids, null, 2));
});
