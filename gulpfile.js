var fs = require('fs');
var q = require('q');
var EventEmitter = require('events').EventEmitter;
var gulp = require('gulp');
var rg = require('rangle-gulp');
var inject = require('gulp-inject');
var colors = require('colors');
var runSequence = require('run-sequence');
var angularFileSort = require('gulp-angular-filesort');
var watch = require('gulp-watch');
var bower = require('gulp-bower');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var del = require('del');
var through = require('through2');
var connect = require('gulp-connect');
var minifyCss = require('gulp-minify-html');
var minifyHtml = require('gulp-minify-css');
var minifyJs = require('gulp-uglify');
var beautify = require('gulp-jsbeautifier');
var lg = require('lazy-gulp');
var vutil = require('vinyl-utils');
var lgAngular = require('lg-angular-file-sort');

var styleGuide = ['src/style-guide/**/*'];
var sassFiles = ['src/scss/**/*.scss'];
var imgFiles = ['src/img/*'];
var htmlFiles = ['src/app/**/*html', 'src/index.html'];
var angularFiles = [
  'src/app/app.js',
  'src/app/components/**/*js',
  'src/app/core/**/*js',
  'src/app/sections/**/*js',
  '!src/app/**/*.test.js'
];

// =================================================================================
// Util
// =================================================================================

function setupAliases(aliases) {
  for (var k in aliases)
    for (var i = 0; i < aliases[k].length; i++)
      gulp.task(aliases[k][i], [k]);
}

// =================================================================================
// Rule Sets
// =================================================================================

// Rules associate file sets (globs) with specific pipelines, the watch and
// build tasks then utilize these rules to perform the appropriate operations
// on files when they are being prepared (when the build task is run) and when
// a file maching one of the sets changes. Any file which does not match one of
// the rules is ignored this is desireable since it provides a single location
// to describe file transformations and also helps to enforce proper project
// structure.

var bldRules = [
  {
    files: styleGuide,
    opts: { base: 'src' },
    description: []
  },
  {
    files: sassFiles,
    opts: { dest: 'css', recompileAll: true },
    description: [
      sass.bind(null, {
        errLogToConsole: true,
        includePaths: require('node-bourbon').includePaths
      })
    ]
  },
  {
    files: angularFiles,
    opts: { base: 'src' },
    description: [ lgAngular.updater('main') ]
  },
  {
    files: htmlFiles,
    opts: { base: 'src' },
    description: [ lgAngular.injector('main', angularFiles) ]
  },
  {
    files: ['src/bower_components/**/*'].concat(imgFiles),
    opts: { base: 'src' },
    description: []
  }
];


// =================================================================================
// Tasks
// =================================================================================

gulp.task('build', [ 'bower' ], lg.compile(bldRules, 'build', 'build'));

gulp.task('watch', [ 'build' ], lg.compile(bldRules, 'build', 'watch', { 
  post: [ connect.reload.bind(connect) ]
}));

gulp.task('server', function () {
  del.sync('build');
  fs.mkdirSync('build');
  runSequence('build', 'watch');
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('bower', bower);

var appFiles = ['src/app/**/*js'];
var testFiles = ['src/app/app.js', './src/app/**/*.js'];
var karmaFile = './testing/karma.conf.js';

var karmaConfig = {
  karmaConf: karmaFile,
  files: testFiles,
  vendor: [
    'src/bower_components/angular/angular.js',
    'src/bower_components/angular-mocks/angular-mocks.js',
    'src/bower_components/q/q.js',
    'src/bower_components/lodash/dist/lodash.js',
    'src/bower_components/koast-angular/dist/koast.js',
    'src/bower_components/ramda/ramda.js',
  ],
  showStack: true
};

gulp.task('karma', function () {
  vutil.collect(gulp.src(karmaConfig.files)
      .pipe(angularFileSort()))
    .then(function (files) {
      karmaConfig.files = files.map(function (file) {
        return file.path;
      });
      rg.karmaWatch(karmaConfig)();
    });
});

gulp.task('test', function () {
  vutil.collect(gulp.src(karmaConfig.files)
      .pipe(angularFileSort()))
    .then(function (files) {
      karmaConfig.files = files.map(function (file) {
        return file.path;
      });
      rg.karma(karmaConfig)();
    });
});


gulp.task('dev', ['server', 'karma']);

gulp.task('jshint', rg.jshint({
  files: appFiles
}));



gulp.task('beautify', function() {
  return gulp.src(appFiles, { base: '.' })
          .pipe(beautify({ config: '.jsbeautifyrc' }))
          .pipe(gulp.dest('.'));
});

gulp.task('lint', function () {
  return runSequence('jshint', 'beautify');
});


gulp.task('default', function () {
  console.log('***********************'.yellow);
  console.log(
    '  gulp server: Create build files (./build) and start a server which watches for changes'
    .yellow
  );
  console.log('  gulp test: run unit tests'.yellow);
  console.log('  gulp build: hint, lint, and minify files into ./dist '.yellow);
  console.log('***********************'.yellow);
});

// =================================================================================
// Aliases
// =================================================================================

var aliases = {
  'server': ['serve']
};

setupAliases(aliases);
