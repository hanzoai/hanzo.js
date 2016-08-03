promise = require 'broken'

sleep = (delay) ->
  new Promise (resolve, reject) ->
    setTimeout resolve, delay

describe.only 'Api.cart', ->
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
      cart.status.should.equal 'active'
      cart.items.length.should.equal 1
      cart.items[0].productSlug.should.equal 'sad-keanu-shirt'
      cart.items[0].quantity.should.equal 1

  describe '.get', ->
    it 'should get cart', ->
      cart = yield api.cart.get car.id
      cart.status.should.eq 'active'
      cart.items.length.should.equal 1
      cart.items[0].productSlug.should.equal 'sad-keanu-shirt'
      cart.items[0].quantity.should.equal 1

  describe '.set', ->
    it 'should set cart item', ->
      cart = yield api.cart.set
        id: car.id
        productSlug: 'sad-keanu-shirt'
        quantity: 2
      cart.status.should.eq 'active'
      cart.items.length.should.equal 1
      cart.items[0].productSlug.should.equal 'sad-keanu-shirt'
      cart.items[0].quantity.should.equal 2

  describe '.list', ->
    it 'should list carts', ->
      {count, models} = yield api.cart.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update carts', ->
      cart = yield api.cart.update
        id: car.id
        shippingAddress:
          line1: 'line1u'
      cart.shippingAddress.line1.should.equal 'line1u'
      cart.status.should.eq 'active'
      cart.items.length.should.equal 1

  describe '.delete', ->
    it 'should delete carts', ->
      yield api.cart.delete car.id
