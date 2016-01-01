// TODO remove when prism will support bower packaging (there are discussions on github)
var _ = require("lodash");
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var git = require('gulp-git');
var header = require('gulp-header');
var wrapper = require('gulp-wrapper');
var runSequence = require('run-sequence');

var outdir = '.';

// task to build prism package
gulp.task("default", function() {
  return runSequence("clone", ["css", "js"], "test");
});

gulp.task("test", function() {
  var Prism = require('./prism.js');

  function highlight(code, lang) {
    var g = Prism.languages[lang];
    if (g) {
      return Prism.highlight(code, g, lang);
    }
    return code;
  }

  var s = highlight("fuction() {\n\tconsole.log('hi');\n}", "js");
  console.log(s);
});

gulp.task("clone", function(done) {
  if (fs.existsSync("prism")) {
		git.pull('origin', 'gh-pages', {
			cwd: path.join(__dirname, 'prism'),
		}, function(err) {
			if (err) throw err;
      done();
		});
  } else {
    git.clone("https://github.com/prismjs/prism", function(err) {
      if (err) throw err;
      done();
    });
  }
});

gulp.task("css", function() {
  // lets try okaidia.css
  return gulp.src("prism/themes/prism.css")
    .pipe(rename("prism.css"))
    .pipe(gulp.dest(outdir));
});

gulp.task("js", function() {
  var components = loadComponents();
  var langs = require("./languages.json");

  // TODO add plugins
  var langpath = components.languages.meta.path;
  var glob = [components.core.meta.path].concat(
      langs.map(function(t) {
        return replace(langpath, {id: t.id}) + ".js";
      })
  ).map(function(p) {
    return path.join("prism", p);
  });

  console.log(glob);

  var head = fs.readFileSync("./header.js", "utf8");
  var foot = fs.readFileSync("./footer.js", "utf8");

  return gulp.src(glob)
      .pipe(header('\n/* **********************************************\n' +
        '     Begin <%= file.relative %>\n' +
        '********************************************** */\n\n'))
      .pipe(concat('prism.js'))
      .pipe(wrapper({header: head, footer: foot}))
      .pipe(gulp.dest(outdir));
});

gulp.task("dump", function() {
  var langs = loadLanguages();
  var ids = langs.map(function(t){ return t.id; });
  fs.writeFileSync("languages.json", JSON.stringify(ids, null, 2));
});

// exclude languages that we won't use
var excludedLanguages = [];

function loadLanguages() {
  var components = loadComponents();

  var langs = _.pairs(components.languages)
    .map(function(p) {
      var obj = p[1];
      obj.id = p[0].toLowerCase();
      obj.deps = obj.require ? [obj.require] : [];
      return obj;
    })
    .filter(function(t) {
      return t.id != "meta" && excludedLanguages.indexOf(t.id) < 0;
    });

  // order languages by "require"
  langs = require('obj-toposort')(langs).filter(_.identity);

  return langs;
}

function loadComponents() {
  // make prism/components.js to be a module so we could require it
  var src = fs.readFileSync("prism/components.js", "utf8");
  src += "\nmodule.exports = components;\n";
  var out = "./prism-components.js";
  fs.writeFileSync(out, src, "utf8");
  var data = require(out);
  fs.unlinkSync(out);
  return data;
}

// replaces {id} tokens
function replace(format, data) {
  return format.replace(/{(\w+)}/g, function(m, name) {
    return data[name] ? data[name] : "";
  });
}
