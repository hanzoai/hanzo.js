chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

webdriver = require 'webdriverio'

getBrowser = ->
  logLevel = if process.env.VERBOSE == 'true' then 'verbose' else 'silent'

  caps =
    browserName:       process.env.BROWSER ? 'phantomjs'
    platform:          process.env.PLATFORM
    version:           process.env.VERSION
    deviceName:        process.env.DEVICE_NAME
    deviceOrientation: process.env.DEVICE_ORIENTATION

  if caps.browserName == 'phantomjs'
    if process.env.TRAVIS?
      caps['phantomjs.binary.path'] = '/usr/local/phantomjs-2.0.0/bin/phantomjs'
    # else
    #   caps['phantomjs.binary.path'] = (require 'phantomjs').path

    caps['phantomjs.cli.args'] = '''
      --web-security=false
      --ignore-ssl-errors=true
      --webdriver-loglevel=DEBUG
    '''.split '\n'

  if process.env.TRAVIS?
    { TRAVIS_BRANCH
      TRAVIS_BUILD_NUMBER
      TRAVIS_COMMIT
      TRAVIS_JOB_NUMBER
      TRAVIS_PULL_REQUEST
      TRAVIS_REPO_SLUG } = process.env

    # Annotate tests with travis info
    caps.name = TRAVIS_COMMIT
    caps.tags = [
      TRAVIS_BRANCH
      TRAVIS_BUILD_NUMBER
      TRAVIS_PULL_REQUEST
    ]

    caps['tunnel-identifier'] = TRAVIS_JOB_NUMBER

    if TRAVIS_BUILD_NUMBER
      caps.project = TRAVIS_REPO_SLUG?.replace /\s/, '/'
      caps.build   = "Travis (#{TRAVIS_BUILD_NUMBER}) for #{caps.project}"

  opts =
    desiredCapabilities: caps
    logLevel: logLevel

  webdriver.remote opts

before ->
  global.browser = getBrowser()
  yield browser.init().timeoutsAsyncScript(10000)

after ->
  yield browser.end()
