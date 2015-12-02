chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

require 'postmortem/register'

Nightmare = require 'joseph/nightmare'

testPage = "http://localhost:#{process.env.PORT ? 3333}/fixtures"

before ->
  global.browser = Nightmare
    show: process.env.VERBOSE is 'true'
  yield browser.goto testPage

after ->
  yield browser.end()
