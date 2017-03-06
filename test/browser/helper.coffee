chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

require 'postmortem/register'

Nightmare = require 'nightmare'

before ->
  browser = Nightmare
    show: process.env.VERBOSE is 'true'
    # switches:
    #   'proxy-server':              'http://localhost:4010'
    #   'ignore-certificate-errors': true

  yield browser.goto 'http://localhost:3333/'
  global.browser = browser

  global.randomToken = (n) ->
    Math.random().toString(36).replace(/[^a-z0-9A-Z]+/g, '').substr 0, n

  global.randomEmail = ->
    randomToken(4) + '@email.com'

  global.email        = global.randomEmail()
  global.firstName    = randomToken 4
  global.newFirstName = randomToken 4
  global.lastName     = randomToken 4
  global.goodPass1    = randomToken 6
  global.goodPass2    = randomToken 6
  global.badPass1     = randomToken 5

  yield browser.evaluate (email, firstName, newFirstName, lastName, goodPass1, goodPass2, badPass1) ->
    window.email        = email
    window.firstName    = firstName
    window.newFirstName = newFirstName
    window.lastName     = lastName
    window.goodPass1    = goodPass1
    window.goodPass2    = goodPass2
    window.badPass1     = badPass1
  , email, firstName, newFirstName, lastName, goodPass1, goodPass2, badPass1

after ->
  yield browser.end()
