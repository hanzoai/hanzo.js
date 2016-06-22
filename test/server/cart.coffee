promise = require 'broken'

sleep = (delay) ->
  new Promise (resolve, reject) ->
    setTimeout resolve, delay

describe 'Api.cart', ->
  fixture = null
  car = null

  before ->
    fixture =
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

  describe '.create', ->
    it 'should create carts', ->
      car = cart = yield api.cart.create fixture
      cart.shippingAddress.line1.should.equal 'line1'
      cart.shippingAddress.line2.should.equal 'line2'
      cart.shippingAddress.city.should.equal 'city'
      cart.shippingAddress.state.should.equal 'state'
      cart.shippingAddress.postalCode.should.equal '11111'
      cart.shippingAddress.country.should.equal 'USA'
      cart.currency.should.equal 'usd'
      cart.total.should.equal 2500
      cart.status.should.equal 'open'
      cart.paymentStatus.should.equal 'unpaid'
      cart.items.length.should.equal 1
      cart.items[0].productSlug.should.equal 'sad-keanu-shirt'
      cart.items[0].quantity.should.equal 1

  describe '.get', ->
    it 'should get cart', ->
      cart = yield api.cart.get ord.id
      cart.total.should.eq 2500

  describe '.list', ->
    it 'should list carts', ->
      {count, models} = yield api.cart.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update carts', ->
      cart = yield api.cart.update
        id: ord.id
        shippingAddress:
          line1: 'line1u'
      cart.shippingAddress.line1.should.equal 'line1u'

  describe '.delete', ->
    it 'should delete carts', ->
      yield api.cart.delete ord.id

  describe '.refund', ->
    it 'should partial and fully refund', ->
      cart = yield api.checkout.charge
        user:
          email:      email
          firstName:  firstName
          lastName:   lastName
        cart:
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


      yield sleep 100

      refundedcart = yield api.cart.refund
        id: cart.id
        amount: 100

      refundedcart.id.should.equal cart.id
      refundedcart.refunded.should.equal 100
      refundedcart.status.should.equal 'open'
      refundedcart.paymentStatus.should.equal 'paid'

      yield sleep 100

      refundedcart2 = yield api.cart.refund
        id: cart.id
        amount: 2400

      refundedcart2.id.should.equal cart.id
      refundedcart2.refunded.should.equal 2500
      refundedcart2.status.should.equal 'cancelled'
      refundedcart2.paymentStatus.should.equal 'refunded'
