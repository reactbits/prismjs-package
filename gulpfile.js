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

var prism_outdir = '.';

// task to build prism package
gulp.task("default", function() {
  return runSequence("clone", ["css", "js"]);
});

gulp.task("clone", function(done) {
  if (fs.existsSync("prism")) {
    done();
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
    .pipe(gulp.dest(prism_outdir));
});

gulp.task("js", function() {
  // make prism/components.js to be a module so we could require it
  var src = fs.readFileSync("prism/components.js", "utf8");
  src += "\nmodule.exports = components;\n";
  var out = "./prism-components.js";
  fs.writeFileSync(out, src, "utf8");
  var components = require(out);
  fs.unlinkSync(out);

  // replaces {id} tokens
  function replace(format, data) {
    return format.replace(/{(\w+)}/g, function(m, name) {
      return data[name] ? data[name] : "";
    });
  }

  // exclude languages that we won't use
  var excludedLanguages = [];

  // TODO add plugins
  var glob = [components.core.meta.path]
  .concat(
    _.pairs(components.languages)
      .filter(function(p) {
        var k = p[0].toLowerCase();
        return k != "meta" && excludedLanguages.indexOf(k) < 0;
      })
      .map(function(p) {
        return replace(components.languages.meta.path, {
          id: p[0]
        }) + ".js";
      })
  ).map(function(p) {
    return path.join("prism", p);
  });

  var exportFooter = fs.readFileSync('./footer.js');

  return gulp.src(glob)
      .pipe(header('\n/* **********************************************\n' +
        '     Begin <%= file.relative %>\n' +
        '********************************************** */\n\n'))
      .pipe(concat('prism.js'))
      .pipe(wrapper({
        // wrap prism code into function
        header: "var prism = function (self, window) {\n",
        footer: "\n\nreturn Prism;\n};\n\n" + exportFooter
      }))
      .pipe(gulp.dest(prism_outdir));
});
