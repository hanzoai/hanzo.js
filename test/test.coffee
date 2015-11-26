describe 'Crowdstart.js', ->
  testPage = "http://localhost:#{process.env.PORT ? 3333}/fixtures"

  before ->
    yield browser.goto testPage

  describe 'client#user.create', ->
    it 'should create users', ->
      res = yield browser.evaluateAsync ->
        client.user.create
          firstName:       firstName
          lastName:        lastName
          email:           email
          password:        goodPass1
          passwordConfirm: goodPass1

      res.status.should.eq 200

    it 'should enforce email requirement', ->
      try
        yield browser.evaluateAsync ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           firstName
            password:        goodPass1
            passwordConfirm: goodPass1
      catch err

      String(err).should.equal 'Error: User Create Failed'

      # res.status.should.equal 400
      # res.responseText.error.message.should.equal 'Email is not valid'

    it 'should enforce required field requirement', ->
      try
        yield browser.evaluateAsync ->
          client.user.create
            firstName:       ''
            lastName:        lastName
            email:           randomEmail()
            password:        goodPass1
            passwordConfirm: goodPass1
      catch err

      String(err).should.equal 'Error: User Create Failed'
      # value.status.should.equal 400
      # value.responseText.error.message.should.equal 'First name cannot be blank'

    it 'should require email, firstName, lastName', ->
      try
        yield browser.evaluateAsync ->
          client.user.create
            # firstName:       firstName
            lastName:        lastName
            email:           randomEmail()
            password:        goodPass1
            passwordConfirm: goodPass1
      catch err
      String(err).should.equal 'Error: User Create Failed'

      # value.status.should.equal 400
      # value.responseText.error.message.should.equal 'First name cannot be blank'

    it 'should enforce password match requirement', ->
      try
        yield browser.evaluateAsync ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           randomEmail()
            password:        goodPass1
            passwordConfirm: goodPass2
      catch err
      String(err).should.equal 'Error: User Create Failed'

      # value.status.should.equal 400
      # value.responseText.error.message.should.equal 'Passwords need to match'

    it 'should enforce password min-length requirement', ->
      try
        yield browser.evaluateAsync ->
          client.user.create
            firstName:       firstName
            lastName:        lastName
            email:           randomEmail()
            password:        badPass1
            passwordConfirm: badPass1
      catch err
      String(err).should.equal 'Error: User Create Failed'

    #   value.status.should.equal 400
    #   value.responseText.error.message.should.equal 'Password needs to be atleast 6 characters'

  describe 'client#user.login', ->
    # test users are automatically enabled
    it 'should login valid users', ->
      res = yield browser.evaluateAsync ->
        client.user.login
          email:    email
          password: goodPass1

    it 'should not login non-existant users', ->
      try
        yield browser.evaluateAsync ->
          client.user.login
            email:    randomEmail()
            password: goodPass1
      catch err

      String(err).should.equal 'Error: User Login Failed'

    #   value.status.should.equal 401
    #   value.responseText.error.message.should.equal 'Email or password is incorrect'

    it 'should not allow login with invalid password', ->
      try
        yield browser.evaluateAsync ->
          client.user.login
            email:    email
            password: goodPass2
      catch err

      String(err).should.equal 'Error: User Login Failed'

    #   value.status.should.equal 401
    #   value.responseText.error.message.should.equal 'Email or password is incorrect'

  describe 'client#user.account', ->
    it 'should retieve logged in user data', ->
      res = yield browser.evaluateAsync ->
          client.user.account()

      res.status.should.equal 200
      data = res.responseText
      data.firstName.should.not.equal ''
      data.lastName.should.not.equal ''
      data.email.should.not.equal ''

  describe 'client#user.updateAccount', ->
    it 'should patch logged in user data', ->
      res = yield browser.evaluateAsync ->
          client.user.updateAccount
            firstName: newFirstName

        res.status.should.equal 200
        data = res.responseText
        data.firstName.should.not.equal ''
        data.lastName.should.not.equal ''
        data.email.should.not.equal ''

  # describe 'client#util', ->
    # it 'should get product', ->
    #   {value} = yield browser
    #     .evaluateAsync (done) ->
    #       client.util.product 'sad-keanu-shirt'
    #       .then (res) ->
    #         done res
    #       .catch (err) ->
    #         done client.lastResponse

    #   value.status.should.equal 200
    #   data = value.responseText
    #   data.price.should.equal 2500

    # it 'should get coupon', ->
    #   {value} = yield browser
    #     .evaluateAsync (done) ->
    #       client.util.coupon 'SUCH-COUPON'
    #       .then (res) ->
    #         done res
    #       .catch (err) ->
    #         done client.lastResponse

    #   value.status.should.equal 200
    #   data = value.responseText
    #   data.amount.should.equal 5

  # describe 'client#payment flows', ->
    # it 'should 1 step charge payments', ->
    #   {value} = yield browser
    #     .evaluateAsync (done) ->
    #       client.payment.charge
    #         user:
    #           email:      email
    #           firstName:  firstName
    #           lastName:   lastName
    #         order:
    #           shippingAddress:
    #             line1:        'line1'
    #             line2:        'line2'
    #             city:         'city'
    #             state:        'state'
    #             postalCode:   '11111'
    #             country:      'USA'
    #           currency: 'usd'
    #           items: [{
    #             productSlug: 'sad-keanu-shirt'
    #             quantity:    1
    #           }]
    #         payment:
    #           account:
    #             number: '4242424242424242'
    #             cvc:    '424'
    #             month:  '1'
    #             year:   '2020'

    #       .then (res) ->
    #         done res
    #       .catch (err) ->
    #         done client.lastResponse

    #   value.status.should.equal 200
    #   order = value.responseText

    #   order.userId.should.not.be.undefined
    #   order.shippingAddress.line1.should.equal 'line1'
    #   order.shippingAddress.line2.should.equal 'line2'
    #   order.shippingAddress.city.should.equal 'city'
    #   order.shippingAddress.state.should.equal 'state'
    #   order.shippingAddress.postalCode.should.equal '11111'
    #   order.shippingAddress.country.should.equal 'USA'
    #   order.currency.should.equal 'usd'
    #   order.total.should.equal 2500
    #   order.payments.length.should.equal 1
    #   order.status.should.equal 'open'
    #   order.paymentStatus.should.equal 'paid'
    #   order.items.length.should.equal 1
    #   order.items[0].productSlug.should.equal 'sad-keanu-shirt'
    #   order.items[0].quantity.should.equal 1

    # xit 'should 2 step authorize/capture payments', ->
    #   browser
    #     .evaluateAsync (done) ->
    #       p = client.payment.authorize
    #         user:
    #           email:      email
    #           firstName:  firstName
    #           lastName:   lastName
    #         order:
    #           shippingAddress:
    #             line1:        'line1'
    #             line2:        'line2'
    #             city:         'city'
    #             state:        'state'
    #             postalCode:   '11111'
    #             country:      'USA'
    #           currency: 'usd'
    #           items:[{
    #             productSlug: 'sad-keanu-shirt'
    #             quantity: 1
    #           }]
    #         payment:
    #           account:
    #             number: '4242424242424242'
    #             cvc:    '424'
    #             month:  '1'
    #             year:   '2020'

    #       p.then (res)->
    #         res.status.should.equal 200
    #         order = res.responseText

    #         order.userId.should.not.be.undefined
    #         order.shippingAddress.line1.should.equal 'line1'
    #         order.shippingAddress.line2.should.equal 'line2'
    #         order.shippingAddress.city.should.equal 'city'
    #         order.shippingAddress.state.should.equal 'state'
    #         order.shippingAddress.postalCode.should.equal '11111'
    #         order.shippingAddress.country.should.equal 'USA'
    #         order.currency.should.equal 'usd'
    #         order.total.should.equal 2500
    #         order.payments.length.should.equal 1
    #         order.status.should.equal 'open'
    #         order.paymentStatus.should.equal 'unpaid'
    #         order.items.length.should.equal 1
    #         order.items[0].productSlug.should.equal 'sad-keanu-shirt'
    #         order.items[0].quantity.should.equal 1

    #         p2 = client.payment.capture
    #           orderId: order.id

    #         p2.then (res)->
    #           res.status.should.equal 200
    #           order2 = res.responseText
    #           order2.paymentStatus.should.equal 'paid'

    # xit 'should get paypal paykey', ->
    #   browser
    #     .evaluateAsync (done) ->
    #       p = client.payment.paypal
    #         user:
    #           email:      email
    #           firstName:  firstName
    #           lastName:   lastName
    #         order:
    #           shippingAddress:
    #             line1:        'line1'
    #             line2:        'line2'
    #             city:         'city'
    #             state:        'state'
    #             postalCode:   '11111'
    #             country:      'USA'
    #           currency: 'usd'
    #           items: [{
    #             productSlug: 'sad-keanu-shirt'
    #             quantity:    1
    #           }]

    #       p.then (res) ->
    #         res.status.should.equal 200
    #         data = res.responseText
    #         data.payKey.should.not.be.null
