describe 'Api.product', ->
  describe '.get', ->
    it 'should get product', ->
      {status, data} = yield api.product.get 'sad-keanu-shirt'
      status.should.equal 200
      data.price.should.equal 2500
