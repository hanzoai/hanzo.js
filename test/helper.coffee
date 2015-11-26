chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

Nightmare = require 'nightmare'
(require 'nightmare-evaluate-async') Nightmare

before ->
  global.browser = Nightmare
    show: process.env.VERBOSE == 'true'

after ->
  yield browser.end()
