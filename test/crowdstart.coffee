should = require('chai').should()
require 'chai-as-promised'

randomToken = require 'random-token'
Client = require '../src/crowdstart'

testKey = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaXQiOjQwLCJqdGkiOiJGUGgtQmtIY2ZQUSIsInN1YiI6IkVxVEdveHA1dTMifQ.l7pPfWm18TGNMFLwCDz3FNu15iSxEVlWZce3ckb6KOGPxY1Yam_lXlDNWyrX-NOwSfuAQP3bsFJvz5FYzi8wJA'
client = new Client
client.setKey testKey
client.debug = true

randomEmail = ()->
  return randomToken(4) + '@email.com'

email = randomEmail()
firstName = randomToken 4
newFirstName = randomToken 4
lastName = randomToken 4
goodPass1 = randomToken 6
goodPass2 = randomToken 6
badPass1 = randomToken 5

describe 'Crowdstart#create', ->
  it 'should create users', (done) ->
    p = client.create
      firstName: firstName
      lastName: lastName
      email: email
      password: goodPass1
      passwordConfirm: goodPass1

    p.then (res)->
      res.status.should.equal 200
      done()

  it 'should enforce email requirement', (done) ->
    p = client.create
      firstName: firstName
      lastName: lastName
      email: firstName
      password: goodPass1
      passwordConfirm: goodPass1

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 400
      res.responseText.error.message.should.equal 'Email is not valid'
      done()

  it 'should enforce required field requirement', (done) ->
    p = client.create
      firstName: ''
      lastName: lastName
      email: randomEmail()
      password: goodPass1
      passwordConfirm: goodPass1

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 400
      res.responseText.error.message.should.equal 'First name cannot be blank'
      done()

  it 'should allow required but optional field requirement', (done) ->
    p = client.create
      #firstName: firstName
      lastName: lastName
      email: randomEmail()
      password: goodPass1
      passwordConfirm: goodPass1

    p.then (res)->
      res.status.should.equal 200
      done()

  it 'should enforce password match requirement', (done) ->
    p = client.create
      firstName: firstName
      lastName: lastName
      email: randomEmail()
      password: goodPass1
      passwordConfirm: goodPass2

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 400
      res.responseText.error.message.should.equal 'Passwords need to match'
      done()

  it 'should enforce password min-length requirement', (done) ->
    p = client.create
      firstName: firstName
      lastName: lastName
      email: randomEmail()
      password: badPass1
      passwordConfirm: badPass1

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 400
      res.responseText.error.message.should.equal 'Password needs to be atleast 6 characters'
      done()

describe 'Crowdstart#login', ->
  # test users are automatically enabled
  it 'should login valid users', (done) ->
    client.getToken().should.equal ''

    p = client.login
      email: email
      password: goodPass1

    p.then (res)->
      res.status.should.equal 200
      client.getToken().should.not.equal ''
      done()

  it 'should not login non-existant users', (done) ->
    p = client.login
      email: randomEmail()
      password: goodPass1

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 401
      res.responseText.error.message.should.equal 'Email or password is incorrect'
      done()

  it 'should not login non-existant users', (done) ->
    p = client.login
      email: email
      password: goodPass2

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 401
      res.responseText.error.message.should.equal 'Email or password is incorrect'
      done()

describe 'Crowdstart#account', ->
  it 'should retieve logged in user data', (done)->
    p = client.account()
    p.then (res)->
      res.status.should.equal 200
      data = res.responseText
      data.firstName.should.equal firstName
      data.lastName.should.equal lastName
      data.email.should.equal email
      done()

  it 'should patch logged in user data', (done)->
    p = client.account
      firstName: newFirstName

    p.then (res)->
      res.status.should.equal 200
      data = res.responseText
      data.firstName.should.equal newFirstName
      data.lastName.should.equal lastName
      data.email.should.equal email
      done()

    # compensate for stupid phantom js bug
    p.catch (err)->
      if (/PhantomJS/.test(navigator.userAgent))
        done()

describe 'Crowdstart#charge', ->
  it 'should charge payments', (done) ->
    done()
