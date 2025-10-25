const { join } = require('path');

const isCI = process.env.CI === 'true' || process.env.CI === '1';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: join(__dirname, './coverage/compass'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
      ],
      check: {
        global: {
          statements: 85,
          branches: 75,
          functions: 85,
          lines: 85,
        },
      },
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    browsers: [isCI ? 'ChromeHeadlessNoSandbox' : 'ChromeHeadless'],
    singleRun: isCI,
    restartOnFileChange: true,
  });
};
