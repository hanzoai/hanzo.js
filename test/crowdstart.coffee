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

xdescribe 'client#user.create', ->
  it 'should create users', (done) ->
    p = client.user.create
      firstName: firstName
      lastName: lastName
      email: email
      password: goodPass1
      passwordConfirm: goodPass1

    p.then (res)->
      res.status.should.equal 200
      done()

  it 'should enforce email requirement', (done) ->
    p = client.user.create
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
    p = client.user.create
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
    p = client.user.create
      #firstName: firstName
      lastName: lastName
      email: randomEmail()
      password: goodPass1
      passwordConfirm: goodPass1

    p.then (res)->
      res.status.should.equal 200
      done()

  it 'should enforce password match requirement', (done) ->
    p = client.user.create
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
    p = client.user.create
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

xdescribe 'client#user.login', ->
  # test users are automatically enabled
  it 'should login valid users', (done) ->
    client.getToken().should.equal ''

    p = client.user.login
      email: email
      password: goodPass1

    p.then (res)->
      res.status.should.equal 200
      client.getToken().should.not.equal ''
      done()

  it 'should not login non-existant users', (done) ->
    p = client.user.login
      email: randomEmail()
      password: goodPass1

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 401
      res.responseText.error.message.should.equal 'Email or password is incorrect'
      done()

  it 'should not login non-existant users', (done) ->
    p = client.user.login
      email: email
      password: goodPass2

    p.catch (err)->
      res = client.lastResponse
      res.status.should.equal 401
      res.responseText.error.message.should.equal 'Email or password is incorrect'
      done()

xdescribe 'client#user.account', ->
  it 'should retieve logged in user data', (done)->
    p = client.user.account()
    p.then (res)->
      res.status.should.equal 200
      data = res.responseText
      data.firstName.should.equal firstName
      data.lastName.should.equal lastName
      data.email.should.equal email
      done()

xdescribe 'client#user.updateAccount', ->
  it 'should patch logged in user data', (done)->
    p = client.user.updateAccount
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

describe 'client#payment flows', ->
  xit 'should 1 step charge payments', (done) ->
    @timeout 10000

    p = client.payment.charge
      user:
        email:      email
        firstName:  firstName
        lastName:   lastName
      order:
        shippingAddress:
          line1:        'line1'
          line2:        'line2'
          city:         'city'
          state:        'state'
          postalCode:   '11111'
          country:      'USA'
        currency: 'usd'
        items:[{
          productSlug: 'sad-keanu-shirt'
          quantity: 1
        }]
      payment:
        account:
          number: '4242424242424242'
          cvc: '424'
          month: '1'
          year: '2020'

    p.then (res)->
      res.status.should.equal 200
      order = res.responseText

      order.userId.should.not.be.undefined
      order.shippingAddress.line1.should.equal 'line1'
      order.shippingAddress.line2.should.equal 'line2'
      order.shippingAddress.city.should.equal 'city'
      order.shippingAddress.state.should.equal 'state'
      order.shippingAddress.postalCode.should.equal '11111'
      order.shippingAddress.country.should.equal 'USA'
      order.currency.should.equal 'usd'
      order.total.should.equal 2500
      order.payments.length.should.equal 1
      order.status.should.equal 'open'
      order.paymentStatus.should.equal 'paid'
      order.items.length.should.equal 1
      order.items[0].productSlug.should.equal 'sad-keanu-shirt'
      order.items[0].quantity.should.equal 1

      done()

  it 'should 2 step authorize/capture payments', (done) ->
    @timeout 20000

    p = client.payment.authorize
      user:
        email:      email
        firstName:  firstName
        lastName:   lastName
      order:
        shippingAddress:
          line1:        'line1'
          line2:        'line2'
          city:         'city'
          state:        'state'
          postalCode:   '11111'
          country:      'USA'
        currency: 'usd'
        items:[{
          productSlug: 'sad-keanu-shirt'
          quantity: 1
        }]
      payment:
        account:
          number: '4242424242424242'
          cvc: '424'
          month: '1'
          year: '2020'

    p.then (res)->
      res.status.should.equal 200
      order = res.responseText

      order.userId.should.not.be.undefined
      order.shippingAddress.line1.should.equal 'line1'
      order.shippingAddress.line2.should.equal 'line2'
      order.shippingAddress.city.should.equal 'city'
      order.shippingAddress.state.should.equal 'state'
      order.shippingAddress.postalCode.should.equal '11111'
      order.shippingAddress.country.should.equal 'USA'
      order.currency.should.equal 'usd'
      order.total.should.equal 2500
      order.payments.length.should.equal 1
      order.status.should.equal 'open'
      order.paymentStatus.should.equal 'unpaid'
      order.items.length.should.equal 1
      order.items[0].productSlug.should.equal 'sad-keanu-shirt'
      order.items[0].quantity.should.equal 1

      p2 = client.payment.capture
        orderId: order.id

      p2.then (res)->
        res.status.should.equal 200
        order2 = res.responseText
        order2.paymentStatus.should.equal 'paid'

        done()


