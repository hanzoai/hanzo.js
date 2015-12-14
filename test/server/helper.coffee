chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

Api = require '../../lib'

before ->
  global.api = new Api
    debug:    false
    endpoint: 'https://api.staging.crowdstart.com'
    key:      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjIwLCJqdGkiOiJMbElLWHlvMjlkNCIsInN1YiI6IkVxVEdveHA1dTMifQ.vkJZwWWsH9GAWv6ZA6bFipJV6GmKr9nZXYwBNIvkUkaER-OFwj-dx0XT6Y5D8uoFIFnbWAMzcrOaWg5MHorvVQ'

  global.clone = (args...) ->
    args.unshift {}
    Object.assign.apply Object, args

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
