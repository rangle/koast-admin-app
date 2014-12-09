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
// Custom Streams
// =================================================================================

var depChange = new EventEmitter();

// Streams with side effects

function passiveStreamGenerator(func) {
  return function() {
    return through.obj(function(file, enc, cb) {
      this.push(file);
      cb();
      if(func)
        func();
    });
  };
}

// Passive stream which updates angular depedencies

var updateDepStream =  passiveStreamGenerator(function() {
    depChange.emit('changed');
    var injector = inject (
      gulp.src(angularFiles).pipe(plumber()).pipe(angularFileSort()),
      { relative: true }
    );
    gulp.src(htmlFiles, { base: 'src' } )
      .pipe(injector)
      .pipe(gulp.dest('build'));
});

//Generate a dynamic dependency injector which listens for changes

function genDepInjectStream () {
  var injector = inject (
    gulp.src(angularFiles).pipe(plumber()).pipe(angularFileSort()),
    { relative: true }
  );
  depChange.on('changed', function() {
    injector.end();
    injector = inject (
      gulp.src(angularFiles).pipe(plumber()).pipe(angularFileSort()),

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
}

// =================================================================================
// Util
// =================================================================================

//Convenience class for declaratively crafting pipelines

function Rule(opts) {
  for(var k in opts)
    this[k] = opts[k];

  this.opts = this.opts || {};
  this.createPipeline = function() {
    if(!this.description || !this.description.length) {
      return passiveStreamGenerator()();
    }
    var pipeline = this.description.map(function(f) { return f(); });
    pipeline.reduce(function(a,b) { return a.pipe(b); });
    return pipeline[0];
  };
}

function buildRuleSet(rules, dest) {
  rules.forEach(function(rule) {
    gulp.src(rule.files, rule.opts)
        .pipe(rule.createPipeline())
        .pipe(gulp.dest(rule.opts.dest ? dest + '/' + rule.opts.dest : dest));
  });
}

function setupAliases(aliases) {
  for(var k in aliases)
    for(var i=0;i<aliases[k].length;i++)
      gulp.task(aliases[k][i], [k]);
}

// Returns a promise which resolves to an array containing all files output by
// the given stream


function collect(stream) {
  var p = q.defer();
  var result = [];
  stream
    .on('data', function(file) {
      result.push(file);
    })
    .on('end', function() {
      p.resolve(result);
    });
  return p.promise;
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
  new Rule({
    files: styleGuide,
    opts: { base: 'src' },
    description: []
  }),
  new Rule({
    files: sassFiles,
    opts: { dest: 'css', recompileAll: true },
    description: [
      sass.bind(null, {
        errLogToConsole:true,
        includePaths: require('node-bourbon').includePaths
      })
    ]
  }),
  new Rule({
    files: angularFiles,
    opts: { base: 'src' },
    description: [
      updateDepStream
    ]
  }),
  new Rule({
    files: htmlFiles,
    opts: { base: 'src' },
    description: [ genDepInjectStream ]
  }),
  new Rule({
    files: ['src/bower_components/**/*'].concat(imgFiles),
    opts: { base: 'src' },
    description: []
  })
];

var distRules = [
  new Rule({
    files: sassFiles,
    opts: { dest: 'css' },
    description: [
      sass.bind(null, { includePaths: require('node-bourbon').includePaths }),
      minifyCss
    ]
  }),
  new Rule({
    files: angularFiles,
    opts: { base: 'src' },
    description: [ minifyJs ]
  }),
  new Rule({
    files: htmlFiles,
    opts: { base: 'src' },
    description: [
      inject.bind(null,
        gulp.src(angularFiles).pipe(plumber()).pipe(angularFileSort()),
        { relative: true }
      ),
      minifyHtml
    ]
  }),
  new Rule({
    files: ['src/bower_components/**/*'].concat(imgFiles),
    opts: { base: 'src' },
    description: []
  })
];

// =================================================================================
// Tasks
// =================================================================================

gulp.task('build', [ 'prepare_bower' ], function () {
  del.sync('build');
  buildRuleSet(bldRules, 'build');
});

gulp.task('dist', function () {
  del.sync('dist');
  buildRuleSet(distRules, 'dist');
});

gulp.task('watch', function (done) {
  bldRules.forEach(function(rule) {
    watch(rule.files, rule.opts)
      .pipe(through.obj(function(file, enc, cb) {
        if(rule.opts.recompileAll) {
          var mstream = this;
          var fstream = gulp.src(rule.files, rule.opts);
          fstream.on('data', function(f) { mstream.push(f); });
          fstream.on('end', function() { cb(); });
        } else {
            this.push(file);
            cb();
        }
      }))
      .pipe(rule.createPipeline())
      .pipe(gulp.dest(rule.opts.dest ? 'build/' + rule.opts.dest : 'build'))
      .pipe(connect.reload());
  });
});

gulp.task('prepare_bower', function () {
  return bower();
});

gulp.task('server', function () {
  del.sync('build');
  fs.mkdirSync('build');
  runSequence('build', 'watch');
  connect.server({
    root: 'build',
    livereload: true
  });
});

var appFiles = ['src/app/app.js', 'src/app/**/*.js', '!./src/app/**/*.test.js'];
var testFiles = ['src/app/app.js','./src/app/**/*.js'];
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
  ],
  showStack: true
};

gulp.task('karma', function() {
  collect(gulp.src(karmaConfig.files)
    .pipe(angularFileSort()))
    .then(function(files) {
       karmaConfig.files = files.map(function(file) {
          return file.path;
        });
       rg.karmaWatch(karmaConfig)();
  });
});

gulp.task('dev', [ 'server', 'karma' ]);

gulp.task('test',rg.karma(karmaConfig));

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
