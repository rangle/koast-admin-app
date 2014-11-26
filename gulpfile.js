var gulp = require('gulp');
var rg = require('rangle-gulp');
var colors = require('colors');
var runSequence = require('run-sequence');

var appFiles =  ['src/app/**/*.js', '!./src/app/**/*.test.js'];
var testFiles =  ['./src/app/**/*.test.js'];
var karmaFile = './testing/karma.conf.js';
var karamConfig = {
  karmaConf : karmaFile,
  files : testFiles,
  vendor: [
    'src/bower_components/angular/angular.js',
    'src/bower_components/angular-mocks/angular-mocks.js',
    'src/bower_components/q/q.js'
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

gulp.task('default', function() {
  console.log('***********************'.yellow);
  console.log('  gulp dev: start a server in the  root folder and watch dev files'.yellow);
  console.log('  gulp test: run unit tests'.yellow);
  console.log('  gulp build: hint, lint, and minify files into ./dist '.yellow);
  console.log('***********************'.yellow);
});