describe 'product', ->
  describe '.get', ->
    it 'should get product', ->
      try
        res = yield browser.evaluate ->
          api.product.get 'sad-keanu-shirt'
      catch err

      res.status.should.equal 200
      res.data.price.should.equal 2500
