chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

hanzo = require '../../'

before ->
  global.sleep = (time) ->
    new Promise (resolve, reject) ->
      setTimeout ->
        resolve()
      , time

  global.api = new hanzo.Api
    debug:    true
    # endpoint: 'https://api-dot-hanzo-staging.appspot.com'
    # key:      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTMyNTQ0MDAsImp0aSI6ImtnSTk4UFhYc2RBMEoiLCJGaXJzdE5hbWUiOiIiLCJMYXN0TmFtZSI6IiIsImFwcCI6IlN0b3JlIiwib3JnIjoic3VjaHRlZXMiLCJ0eXAiOiJhcGkiLCJ0c3QiOnRydWUsImJpdCI6MjR9.-kz2Y8MEm8cTHVWTtQP_YIqPUvdvmFy1W-zc3xJYY2s'

    endpoint: 'https://api-staging.hanzo.io'
    key:      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjI0LCJqdGkiOiI0Y251UEJWWGxVUSIsInN1YiI6IjhBVEVPa0VuU2wifQ.FhX_E4D70umPeOCpJ3TU740kyuTCyOnDar0nq_icBxQx9qJ3aGqIu-xTUz9C_AvpJ0CJKaAVql1a_T4fWTVojw'

    # z
    # endpoint: 'http://localhost:8080/api'
    # key:      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTI5OTAwNzQsImp0aSI6IjBNUkVJQWlvYXYiLCJhcHAiOiJTdG9yZSIsIm9yZyI6InN1Y2h0ZWVzIiwidHlwIjoiYXBpIiwidHN0Ijp0cnVlLCJiaXQiOjI0fQ.BQxRZRlnjt3tLGdxXhXZ-83-Q3A12KljgpJO0UZ241w'

    # d
    # endpoint: 'http://localhost:8080/api'
    # key:      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTMyNDQ0OTYsImp0aSI6IjBNUkVJQWlvYXYiLCJGaXJzdE5hbWUiOiIiLCJMYXN0TmFtZSI6IiIsImFwcCI6IlN0b3JlIiwib3JnIjoic3VjaHRlZXMiLCJ0eXAiOiJhcGkiLCJ0c3QiOnRydWUsImJpdCI6MjR9.OEZ6O5gKdxlLz9uMaYopuRnDG0fl0EBdRbT3Xz0v3RA'

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
