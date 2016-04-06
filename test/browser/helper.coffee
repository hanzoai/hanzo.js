chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

require 'postmortem/register'

Nightmare = require 'joseph/nightmare'

before ->
  browser = Nightmare
    show: process.env.VERBOSE is 'true'
    # switches:
    #   'proxy-server':              'http://localhost:4010'
    #   'ignore-certificate-errors': true

  yield browser.goto 'http://localhost:3333/'
  global.browser = browser

after ->
  yield browser.end()
