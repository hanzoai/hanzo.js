chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

Nightmare = require 'jospeh/nightmare'

before ->
  global.browser = Nightmare
    show: process.env.VERBOSE is 'true'

after ->
  yield browser.end()
