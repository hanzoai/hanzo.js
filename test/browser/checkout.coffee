describe 'Api.checkout (browser)', ->
  describe '.charge', ->
    it 'should 1 step charge payments', ->
      order = yield browser.evaluate ->
        api.checkout.charge
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

  describe '.authorize', ->
    it 'should authorize payment', ->
      order = yield browser.evaluate ->
        api.checkout.authorize
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

  describe '.capture', ->
    it 'should capture payment', ->
      order = yield browser.evaluate ->
        api.checkout.authorize
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

      order2 = yield browser.evaluate (orderId) ->
        api.checkout.capture
          orderId: orderId
      , order.id

      order2.paymentStatus.should.equal 'paid'

  describe '.paypal', ->
    xit 'should get paypal paykey', ->
      order = yield browser.evaluate ->
        api.checkout.paypal
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

      order.payKey.should.not.be.null
