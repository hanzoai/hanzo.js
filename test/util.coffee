webdriver = require 'webdriverio'

exports.getBrowser = ->
  caps =
    browserName:       process.env.BROWSER ? 'phantomjs'
    platform:          process.env.PLATFORM
    version:           process.env.VERSION
    deviceName:        process.env.DEVICE_NAME
    deviceOrientation: process.env.DEVICE_ORIENTATION

  if caps.browserName == 'phantomjs'
    # caps['phantomjs.binary.path'] = './node_modules/.bin/phantomjs'
    caps['phantomjs.cli.jargs']   = '--web-security=false'

  logLevel = if process.env.VERBOSE == 'true' then 'verbose' else 'silent'

  opts =
    desiredCapabilities: caps
    logLevel: logLevel

  if process.env.TRAVIS?
    { BROWSERSTACK_KEY
      BROWSERSTACK_USERNAME
      TRAVIS_BRANCH
      TRAVIS_BUILD_NUMBER
      TRAVIS_COMMIT
      TRAVIS_JOB_NUMBER
      TRAVIS_PULL_REQUEST
      TRAVIS_REPO_SLUG } = process.env

    # annotate tests with travis info
    caps.name = TRAVIS_COMMIT
    caps.tags = [
      TRAVIS_BRANCH
      TRAVIS_BUILD_NUMBER
      TRAVIS_PULL_REQUEST
    ]

    # caps['tunnel-identifier'] = TRAVIS_JOB_NUMBER

    if TRAVIS_BUILD_NUMBER
      caps.project = TRAVIS_REPO_SLUG?.replace /\s/, '/'
      caps.build   = "Travis (#{TRAVIS_BUILD_NUMBER}) for #{caps.project}"

  webdriver.remote opts
