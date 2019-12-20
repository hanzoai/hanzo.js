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

  describe '.create', ->
    it 'should create products', ->
      p = yield api.product.create product
      p.price.should.eq product.price
      product.slug = p.slug

  describe '.get', ->
    it 'should get product', ->
      p = yield api.product.get product.slug
      p.price.should.eq 2500

  describe '.list', ->
    it 'should list products', ->
      {count, models} = yield api.product.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update products', ->
      p = yield api.product.update slug: product.slug, price: 3500
      p.price.should.eq 3500

  describe '.delete', ->
    it 'should delete products', ->
      yield api.product.delete product.slug

  describe 'cache invalidation', ->
    it 'should invalidate product', ->
      product2 =
        slug: 'happy-keanu-shirt'
        price: 4000
      yield api.product.create product2
      yield api.product.update slug: 'happy-keanu-shirt', price: 5000
      p = yield api.product.get slug: 'happy-keanu-shirt'
      p.price.should.eq 5000
