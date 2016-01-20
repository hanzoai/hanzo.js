chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

Api = require '../../lib'

before ->
  global.api = new Api
    debug:    false
    endpoint: 'https://api-dot-hanzo-staging.appspot.com'
    key:      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTMyNTQ0MDAsImp0aSI6ImtnSTk4UFhYc2RBMEoiLCJGaXJzdE5hbWUiOiIiLCJMYXN0TmFtZSI6IiIsImFwcCI6IlN0b3JlIiwib3JnIjoic3VjaHRlZXMiLCJ0eXAiOiJhcGkiLCJ0c3QiOnRydWUsImJpdCI6MjR9.-kz2Y8MEm8cTHVWTtQP_YIqPUvdvmFy1W-zc3xJYY2s'

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
