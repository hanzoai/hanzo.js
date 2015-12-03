describe 'Api.product', ->
  describe '.get', ->
    it 'should list products', ->
      {count, models} = yield api.product.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

    it 'should get product', ->
      product = yield api.product.get 'sad-keanu-shirt'
      product.price.should.eq 2500

    it 'should create products', ->
      product  = yield api.product.get slug: 'sad-keanu-shirt'
      product2 = yield api.product.create Object.assign product, slug: product.slug + '-copy'
      product2.price.should.eq product.price

    it 'should update products', ->
      product = yield api.product.update slug: 'sad-keanu-shirt'
      product.price.should.eq 2500

    it 'should delete products', ->
      res = yield api.product.delete slug: 'sad-keanu-shirt'
      console.log res
