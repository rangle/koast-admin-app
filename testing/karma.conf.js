module.exports = function (config) {

  config.set({
    basePath: 'src/',
    frameworks: ['mocha', 'chai', 'sinon'],
    plugins: [ 'karma-phantomjs-launcher', 'karma-chrome-launcher', 'karma-sinon', 'karma-chai','karma-mocha' ],
    files: ['src/app/app.js', 'src/app/**/*.js'],
    exclude: ['bower_components/*'],
    reporters: ['progress'],
    port: 9999,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    browsers: ['PhantomJS'], // Alternatively: 'Chrome'
    captureTimeout: 6000,
    singleRun: true
  });
};
