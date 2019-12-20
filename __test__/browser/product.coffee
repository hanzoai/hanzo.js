describe 'Api.product (browser)', ->
  describe '.get', ->
    it 'should get product', ->
      p = yield api.product.get 'sad-keanu-shirt'
      p.price.should.eq 2500
