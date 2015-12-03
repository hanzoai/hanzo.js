describe 'Api.product', ->
  describe '.get', ->
    it 'should get product', ->
      product = yield api.product.get 'sad-keanu-shirt'
      product.price.should.equal 2500
