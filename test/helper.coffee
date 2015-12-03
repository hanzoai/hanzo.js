chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

{Api} = require '../lib'

before ->
  testKey = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjI0LCJqdGkiOiJuNnZ4TlhRRllHcyIsInN1YiI6IkVxVEdveHA1dTMifQ.7rwAI6GK0bPAd_WH9X-qBOw-hgUlrpHnZvSxrxDn0uWDS3CIENUXPG1O15LKK2oDV1ncmeqqdP_eCOXLPrj9zA'

  global.api = Api
    debug: true
    endpoint: 'https://api.staging.crowdstart.com'
    key: testKey

  global.randomToken = (n) ->
    Math.random().toString(36).replace(/[^a-z0-9A-Z]+/g, '').substr 0, n

  global.randomEmail = ->
    randomToken(4) + '@email.com'

  global.email        = randomEmail()
  global.firstName    = randomToken 4
  global.newFirstName = randomToken 4
  global.lastName     = randomToken 4
  global.goodPass1    = randomToken 6
  global.goodPass2    = randomToken 6
  global.badPass1     = randomToken 5
