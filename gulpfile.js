var gulp = require('gulp');
var rg = require('rangle-gulp');
var colors = require('colors');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var appFiles =  ['src/app/app.js','src/app/**/*.js', '!./src/app/**/*.test.js'];
var styleGuideFiles = ['./src/style-guide/index.html', './src/style-guide/js/**/*.js', './src/style-guide/assets/**.*'];
var testFiles =  ['src/app/app.js','src/app/**/*.js'];
var karmaFile = './testing/karma.conf.js';
var karamConfig = {
  karmaConf : karmaFile,
  files : testFiles,
  vendor: [
    'src/bower_components/angular/angular.js',
    'src/bower_components/angular-mocks/angular-mocks.js',
    'src/bower_components/q/q.js',
    'src/bower_components/lodash/dist/lodash.js',
    'src/bower_components/koast-angular/dist/koast.js',
  ],
  showStack: true
};
gulp.task('dev',function(){
  rg.connectWatch({
    root : './src',
    livereload : true,
    glob : './src/**/*'
  });
  rg.karmaWatch(karamConfig)();
});

gulp.task('jshint',rg.jshint({
  files : appFiles
}));

gulp.task('beautify',rg.beautify({
  files : [appFiles[0]]
}));

gulp.task('build',function(){
  return runSequence('jshint','beautify');
});


gulp.task('test',rg.karma(karamConfig));


// Compile SASS for the style-guide
gulp.task('style-guide-sass', function(done) {
  gulp.src('./src/scss/style-guide.scss')
    .pipe(sass({
      includePaths: require('node-bourbon').includePaths
    }))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./src/css/'))
    .pipe(connect.reload())
    .on('end', done);
});


gulp.task('style-guide', ['style-guide-sass'], function() {
  // Start a server
  connect.server({
    root: 'src',
    port: 3000,
    livereload: true
  });
  console.log('[CONNECT] Listening on port 3000'.yellow.inverse);

  // Watch HTML files for changes
  console.log('[CONNECT] Watching files for live-reload'.blue);
  watch(styleGuideFiles)
    .pipe(connect.reload());

  // Watch HTML files for changes
  console.log('[CONNECT] Watching SASS files'.blue);
  gulp.watch('./src/scss/*.scss', ['style-guide-sass']);
});


gulp.task('default', function() {
  console.log('***********************'.yellow);
  console.log('  gulp dev:'.magenta, 'start a server in the  root folder and watch dev files'.yellow);
  console.log('  gulp test:'.magenta, 'run unit tests'.yellow);
  console.log('  gulp build:'.magenta, 'hint, lint, and minify files into ./dist '.yellow);
  console.log('  gulp style-guide:'.magenta, 'view/modify the style guide locally'.yellow);
  console.log('***********************'.yellow);
});