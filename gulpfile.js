var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var gulp = require('gulp');
var rg = require('rangle-gulp');
var inject = require('gulp-inject');
var colors = require('colors');
var runSequence = require('run-sequence');
var angularFileSort = require('gulp-angular-filesort');
var watch = require('gulp-watch');
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var del = require('del');
var cp = require('ncp').ncp;
var through = require('through2');
var connect = require('gulp-connect');

var sassFiles = ['src/app/**/*sass', 'src/app/**/*scss'];
var htmlFiles = ['src/app/**/*html', 'src/index.html'];
var angularFiles = [
  'src/app/app.js',
  'src/app/services/*.js',
  'src/app/**/*-directive.js',
  'src/app/**/*-controller.js',
  '!src/app/**/*.test.js'
];

//Rules associate file sets (globs) with specific pipelines, the watch and
//build tasks then utilize these rules to perform the appropriate operations on
//files when they are being prepared (when the build task is run) and when a
//file maching one of the sets changes. Any file which does not match one of
//the rules is ignored this is desireable since it provides a single location
//to describe file transformations and also helps to enforce proper project
//structure.

var rules = [
  new Rule({
    files: sassFiles,
    description: [
      sass.bind(null, {errLogToConsole:true}),
      gulp.dest.bind(gulp,('build')),
      connect.reload.bind(connect)
    ]
  }),
  new Rule({ 
    files: angularFiles, 
    description: [ 
      updateDepStream,
      gulp.dest.bind(gulp, 'build') 
    ] 
  }),
  new Rule({ 
    files: htmlFiles, 
    description: [ 
      genDepInjectStream,
      gulp.dest.bind(gulp, 'build') 
    ] 
  })
];

// =================================================================================
// Custom Streams
// =================================================================================

var depChange = new EventEmitter();

//Passive stream which updates angular depedencies

function updateDepStream () {
  return through.obj(function(file, enc, cb) {
    depChange.emit('changed');
    var injector = inject (
      gulp.src(angularFiles).pipe(angularFileSort()), 
      { relative: true }
    );
    gulp.src(htmlFiles, { base: 'src' } )
      .pipe(through.obj(function(file, enc, cb) {
        this.push(file);
        cb();
      }
      ))
      .pipe(injector)
      .pipe(gulp.dest('build'));
    this.push(file);
    cb();
  });
};

//Generate a dynamic dependency injector which listens for changes

function genDepInjectStream () {
  var injector = inject (
    gulp.src(angularFiles).pipe(angularFileSort()), 
    { relative: true }
  );
  depChange.on('changed', function() {
    injector.end();
    injector = inject (
      gulp.src(angularFiles).pipe(angularFileSort()), 
      { relative: true }
    );
  });

  return through.obj(function(file, enc, cb) {
    var stream = this;
    injector.write(file);
    injector.once('data', function flush(file) {
      stream.push(file);
      cb();
    });
  });
};


// =================================================================================
// Util
// =================================================================================

//Convenience class for declaratively crafting pipelines 

function Rule(opts) {
  for(var k in opts) 
    this[k] = opts[k];

  this.createPipeline = function() {
    var pipeline = this.description.map(function(f) { return f(); });
    pipeline.reduce(function(a,b) { return a.pipe(b) });
    return pipeline[0];
  }
};

function setupAliases(aliases) {
  for(var k in aliases)
    for(var i=0;i<aliases[k].length;i++)
      gulp.task(aliases[k][i], [k]);
};

// =================================================================================
// Tasks
// =================================================================================

gulp.task('build', function () {
  rules.forEach(function(rule) {
    gulp.src(rule.files, { base: 'src' })
      .pipe(rule.createPipeline());
  });
});

gulp.task('watch', function (done) {
  rules.forEach(function(rule) {
    watch(rule.files, { base: 'src' })
      .pipe(rule.createPipeline())
      .pipe(connect.reload());
  });
  done();
});

gulp.task('prepare_bower', function (done) {
  bower().on('end', function () {
    fs.symlinkSync(__dirname + '/src/bower_components', 'build/bower_components');
    done();
  });
});

gulp.task('server', function () {
  del.sync('build');
  fs.mkdirSync('build');
  runSequence('prepare_bower', 'build', 'watch');
  connect.server({
    root: 'build',
    livereload: true
  });
});

var appFiles = ['src/app/app.js', 'src/app/**/*.js', '!./src/app/**/*.test.js'];
var testFiles = ['./src/app/**/*.test.js'];
var karmaFile = './testing/karma.conf.js';

var karamConfig = {
  karmaConf: karmaFile,
  files: testFiles,
  vendor: [
    'src/bower_components/angular/angular.js',
    'src/bower_components/angular-mocks/angular-mocks.js',
    'src/bower_components/q/q.js',
    'src/bower_components/lodash/dist/lodash.js',
    'src/bower_components/koast-angular/dist/koast.js',
  ],
  showStack: true
};

gulp.task('karma', function() {
  rg.karmaWatch(karamConfig)();
});

gulp.task('dev', [ 'server', 'karma' ]);

gulp.task('jshint', rg.jshint({
  files: appFiles
}));

gulp.task('beautify', rg.beautify({
  files: [appFiles[0]]
}));

//Run this before comitting

gulp.task('lint', function () {
  return runSequence('jshint', 'beautify');
});

gulp.task('default', function () {
  console.log('***********************'.yellow);
  console.log(
    '  gulp server: Create build files (./build) and start a server which watches for changes'.yellow
  );
  console.log('  gulp test: run unit tests'.yellow);
  console.log('  gulp build: hint, lint, and minify files into ./dist '.yellow);
  console.log('***********************'.yellow);
});

// =================================================================================
// Aliases
// =================================================================================

var aliases = {
  'server': ['serve' ]
};

setupAliases(aliases);
