chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

require 'postmortem/register'

Nightmare = require 'joseph/nightmare'

before ->
  global.browser = Nightmare
    show: process.env.VERBOSE is 'true'

after ->
  yield browser.end()
