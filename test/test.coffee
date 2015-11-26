should = require('chai').should()
require 'chai-as-promised'

{getBrowser} = require './util'

randomToken = require 'random-token'

describe "Crowdstart.js (#{process.env.BROWSER})", ->
  testPage = "http://localhost:#{process.env.PORT ? 3333}/fixtures/index.html"
  browser  = null

  before ->
    yield browser = getBrowser()
      .init()
      .timeoutsAsyncScript(10000)
      .url testPage

  after ->
    yield browser.end()

  describe 'client#user.create', ->
    it 'should create users', ->
      {value} = yield browser
        .executeAsync (done) ->
          done()
        .executeAsync (done) ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           email
            password:        goodPass1
            passwordConfirm: goodPass1
          .then (res) ->
            done res
          .catch (err) ->
            done err

      value.status.should.equal 200

    it 'should enforce email requirement', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.create
            firstName: firstName
            lastName: lastName
            email: firstName
            password: goodPass1
            passwordConfirm: goodPass1
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 400
      value.responseText.error.message.should.equal 'Email is not valid'

    it 'should enforce required field requirement', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.create
            firstName: ''
            lastName: lastName
            email: randomEmail()
            password: goodPass1
            passwordConfirm: goodPass1
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 400
      value.responseText.error.message.should.equal 'First name cannot be blank'

    it 'should allow required but optional field requirement', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.create
            # firstName: firstName
            lastName: lastName
            email: randomEmail()
            password: goodPass1
            passwordConfirm: goodPass1
          .then (res) ->
            done res
          .catch (err) ->
            done client.lastResponse

      value.status.should.equal 400
      value.responseText.error.message.should.equal 'First name cannot be blank'

    it 'should enforce password match requirement', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.create
            firstName: firstName
            lastName: lastName
            email: randomEmail()
            password: goodPass1
            passwordConfirm: goodPass2
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 400
      value.responseText.error.message.should.equal 'Passwords need to match'

    it 'should enforce password min-length requirement', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.create
            firstName: firstName
            lastName: lastName
            email: randomEmail()
            password: badPass1
            passwordConfirm: badPass1
          .then (res) ->
            done res
          .catch (err) ->
            done client.lastResponse

      value.status.should.equal 400
      value.responseText.error.message.should.equal 'Password needs to be atleast 6 characters'

  describe 'client#user.login', ->
    # test users are automatically enabled
    it 'should login valid users', ->
      {value} = yield browser
        .executeAsync (done) ->
          oldToken = client.getToken()

          client.user.login
            email: email
            password: goodPass1
          .then (res) ->
            done
              res: res
              oldToken: oldToken
              token: client.getToken()
          .catch (err) ->
            done client.lastResponse

      value.res.status.should.equal 200
      value.oldToken.should.equal ''
      value.token.should.not.equal ''

    it 'should not login non-existant users', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.login
            email: randomEmail()
            password: goodPass1
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 401
      value.responseText.error.message.should.equal 'Email or password is incorrect'

    it 'should not login non-existant users', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.login
            email: email
            password: goodPass2
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 401
      value.responseText.error.message.should.equal 'Email or password is incorrect'

  describe 'client#user.account', ->
    it 'should retieve logged in user data', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.account()
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 200
      data = value.responseText
      data.firstName.should.not.equal ''
      data.lastName.should.not.equal ''
      data.email.should.not.equal ''

  describe 'client#user.updateAccount', ->
    it 'should patch logged in user data', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.user.updateAccount
            firstName: newFirstName
          .then (res) ->
            done res
          # compensate for stupid phantom js bug
          .catch (err) ->
            done client.lastResponse

        value.status.should.equal 200
        data = value.responseText
        data.firstName.should.not.equal ''
        data.lastName.should.not.equal ''
        data.email.should.not.equal ''

  describe 'client#util', ->
    it 'should get product', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.util.product 'sad-keanu-shirt'
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 200
      data = value.responseText
      data.price.should.equal 2500

    it 'should get coupon', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.util.coupon 'SUCH-COUPON'
          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 200
      data = value.responseText
      data.amount.should.equal 5

  describe 'client#payment flows', ->
    it 'should 1 step charge payments', ->
      {value} = yield browser
        .executeAsync (done) ->
          client.payment.charge
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

          .then (res)->
            done res
          .catch (err)->
            done client.lastResponse

      value.status.should.equal 200
      order = value.responseText

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

    xit 'should 2 step authorize/capture payments', ->
      browser
        .executeAsync (done) ->
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

    xit 'should get paypal paykey', ->
      browser
        .executeAsync (done) ->
          p = client.payment.paypal
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

          p.then (res) ->
            res.status.should.equal 200
            data = res.responseText
            data.payKey.should.not.be.null
