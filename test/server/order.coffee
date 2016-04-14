describe 'Api.order', ->
  fixture = null
  ord = null

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
    it 'should create orders', ->
      ord = order = yield api.order.create fixture
      order.shippingAddress.line1.should.equal 'line1'
      order.shippingAddress.line2.should.equal 'line2'
      order.shippingAddress.city.should.equal 'city'
      order.shippingAddress.state.should.equal 'state'
      order.shippingAddress.postalCode.should.equal '11111'
      order.shippingAddress.country.should.equal 'USA'
      order.currency.should.equal 'usd'
      order.total.should.equal 2500
      order.status.should.equal 'open'
      order.paymentStatus.should.equal 'unpaid'
      order.items.length.should.equal 1
      order.items[0].productSlug.should.equal 'sad-keanu-shirt'
      order.items[0].quantity.should.equal 1

  describe '.get', ->
    it 'should get order', ->
      order = yield api.order.get ord.id
      order.total.should.eq 2500

  describe '.list', ->
    it 'should list orders', ->
      {count, models} = yield api.order.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update orders', ->
      order = yield api.order.update
        id: ord.id
        shippingAddress:
          line1: 'line1u'
      order.shippingAddress.line1.should.equal 'line1u'

  describe '.delete', ->
    it 'should delete orders', ->
      yield api.order.delete ord.id
