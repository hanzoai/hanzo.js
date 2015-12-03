describe 'Api.product (browser)', ->
  describe '.get', ->
    it 'should get product', ->
      product = yield browser.evaluate ->
          api.product.get 'sad-keanu-shirt'
      product.price.should.equal 2500
