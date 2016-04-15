describe 'Api.variant', ->
  variant = null

  before ->
    product = yield api.product.create
      slug:        'sad-keanu-shirt' + (randomToken 2)
      name:        'Sad Keanu T-shirt'
      price:        2500
      currency:     'USD'
      headline:    'Oh Keanu'
      description: 'Sad Keanu is sad.'
      options: [
        name:   'size'
        values: ['small', 'medium', 'large']
      ,
        name:   'color'
        values: ['dark', 'light']
      ]

    variant =
      productId: product.id
      sku:       'sad-keanu-shirt-' + (randomToken 2)
      name:      'Sad Keanu T-shirt (Medium)'
      price:     2000
      currency:  'USD'
      options: [
        name:  'size'
        value: 'medium'
      ,
        name:  'color'
        value: 'dark'
      ]

  describe '.create', ->
    it 'should create variants', ->
      p = yield api.variant.create variant
      p.price.should.eq variant.price
      variant.sku = p.sku

  describe '.get', ->
    it 'should get variant', ->
      p = yield api.variant.get variant.sku
      p.price.should.eq 2000

  describe '.list', ->
    it 'should list variants', ->
      {count, models} = yield api.variant.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update variants', ->
      p = yield api.variant.update sku: variant.sku, price: 3500
      p.price.should.eq 3500

  describe '.delete', ->
    it 'should delete variants', ->
      yield api.variant.delete variant.sku
