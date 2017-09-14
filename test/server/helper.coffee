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

    # endpoint: 'https://api-staging.hanzo.io'
    # key:      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjI0LCJqdGkiOiJhajNhTUpPcUlfWSIsInN1YiI6IkVxVEdveHA1dTMifQ.dwz3XXRPSHzhFIXYIW-GrU1ovf1alEvRN9syqRKlfAwapXwVxp5Twort3ibaDd6V-yQtLHfziy2PHNin1VfZ4A'

    endpoint: 'https://api.hanzo.io'
    key:      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjQ1MDM2MTcwNzU2NzUxNzIsImp0aSI6InlJVFF2NTZwWXBVIiwic3ViIjoiRXFUR294cDV1MyJ9.TM_aCV2SCSLbRVMgezSCLr0UvkcXhpupCfDWC8bvkzaMuqGv6N-g4DnTNtUJNk_70nO6gA0seCpEvuMSkerSsw'

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
