Api       = require '../lib/api'
XhrClient = require '../lib/xhr-client'

describe 'Crowdstart.js', ->
  testPage = "http://localhost:#{process.env.PORT ? 3333}/fixtures"

  before ->
    yield browser.goto testPage

  describe 'Crowdstart.Api', ->
    it 'should instantiate', ->
      Api 'fakekey'

  describe 'Crowdstart.Client', ->
    it 'should instantiate', ->
      XhrClient 'fakekey'

  describe 'client#user.create', ->
    it 'should create users', ->
      res = yield browser.evaluate ->
        client.user.create
          firstName:       firstName
          lastName:        lastName
          email:           email
          password:        goodPass1
          passwordConfirm: goodPass1

      res.status.should.eq 200

    it 'should enforce email requirement', ->
      try
        yield browser.evaluate ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           firstName
            password:        goodPass1
            passwordConfirm: goodPass1
          # setTimeout cb, 100000

      catch err

      err.status.should.eq 400
      err.message.should.eq 'Email is not valid'

    it 'should not allow firstName to be blank', ->
      try
        res = yield browser.evaluate ->
          client.user.create
            firstName:       ''
            lastName:        lastName
            email:           randomEmail()
            password:        goodPass1
            passwordConfirm: goodPass1
      catch err

      err.status.should.eq 400
      err.message.should.eq 'First name cannot be blank'

    it 'should not allow firstName to be nil', ->
      try
        yield browser.evaluate ->
          client.user.create
            # firstName:       firstName
            lastName:        lastName
            email:           randomEmail()
            password:        goodPass1
            passwordConfirm: goodPass1
      catch err

      err.status.should.eq 400
      err.message.should.eq 'First name cannot be blank'

    it 'should enforce password match requirement', ->
      try
        yield browser.evaluate ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           randomEmail()
            password:        goodPass1
            passwordConfirm: goodPass2
      catch err

      err.status.should.eq 400
      err.message.should.equal 'Passwords need to match'

    it 'should enforce password min-length requirement', ->
      try
        yield browser.evaluate ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           randomEmail()
            password:        badPass1
            passwordConfirm: badPass1
      catch err

      err.status.should.eq 400
      err.message.should.eq 'Password needs to be atleast 6 characters'

  describe 'client#user.login', ->
    # test users are automatically enabled
    it 'should login valid users', ->
      res = yield browser.evaluate ->
        client.user.login
          email:    email
          password: goodPass1

    it 'should not login non-existant users', ->
      try
        yield browser.evaluate ->
          client.user.login
            email:    randomEmail()
            password: goodPass1
      catch err

      err.status.should.equal 401
      err.message.should.equal 'Email or password is incorrect'

    it 'should not allow login with invalid password', ->
      try
        yield browser.evaluate ->
          client.user.login
            email:    email
            password: goodPass2
      catch err

      err.status.should.eq 401
      err.message.should.eq 'Email or password is incorrect'

  describe 'client#user.account', ->
    it 'should retrieve logged in user data', ->
      res = yield browser.evaluate ->
          client.user.account()

      res.status.should.equal 200
      res.data.firstName.should.not.equal ''
      res.data.lastName.should.not.equal ''
      res.data.email.should.not.equal ''

  describe 'client#user.updateAccount', ->
    it 'should patch logged in user data', ->
      res = yield browser.evaluate ->
          client.user.updateAccount
            firstName: newFirstName

        res.status.should.equal 200
        res.data.firstName.should.not.equal ''
        res.data.lastName.should.not.equal ''
        res.data.email.should.not.equal ''

  describe 'client#util', ->
    it 'should get product', ->
      try
        res = yield browser.evaluate ->
          client.util.product 'sad-keanu-shirt'
      catch err

      res.status.should.equal 200
      res.data.price.should.equal 2500

    it 'should get coupon', ->
      res = yield browser.evaluate ->
        client.util.coupon 'SUCH-COUPON'

      res.status.should.equal 200
      res.data.amount.should.equal 500

  describe 'client#payment flows', ->
    it 'should 1 step charge payments', ->
      res = yield browser.evaluate ->
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
            items: [{
              productSlug: 'sad-keanu-shirt'
              quantity:    1
            }]
          payment:
            account:
              number: '4242424242424242'
              cvc:    '424'
              month:  '1'
              year:   '2020'

      res.status.should.eq 200
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

    it 'should 2 step authorize/capture payments', ->
      res = yield browser.evaluate ->
        client.payment.authorize
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
              cvc:    '424'
              month:  '1'
              year:   '2020'

      res.status.should.eq 200
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

      res = yield browser.evaluate (orderId) ->
        client.payment.capture
          orderId: orderId
      , order.id

      res.status.should.eq 200
      order2 = res.responseText
      order2.paymentStatus.should.equal 'paid'

    xit 'should get paypal paykey', ->
      res = yield browser.evaluate ->
        client.payment.paypal
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
            items: [{
              productSlug: 'sad-keanu-shirt'
              quantity:    1
            }]

      res.status.should.eq 200
      res.data.payKey.should.not.be.null
