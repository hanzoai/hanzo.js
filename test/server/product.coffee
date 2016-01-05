describe 'Api.product', ->
  product = null

  before ->
    product =
      slug:        'sad-keanu-shirt' + (randomToken 2)
      name:        'Sad Keanu T-shirt'
      price:        2500
      currency:     'USD'
      headline:    'Oh Keanu'
      description: 'Sad Keanu is sad.'
      options: [
        name:   'size'
        values: ['sadness']
      ]

  describe '.get', ->
    it 'should create products', ->
      p = yield api.product.create product
      p.price.should.eq product.price

    it 'should get product', ->
      p = yield api.product.get product.slug
      p.price.should.eq 2500

    it 'should list products', ->
      {count, models} = yield api.product.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

    it 'should update products', ->
      p = yield api.product.update slug: 'sad-keanu-shirt', price: 3500
      p.price.should.eq 3500

    it 'should delete products', ->
      yield api.product.delete product.slug
