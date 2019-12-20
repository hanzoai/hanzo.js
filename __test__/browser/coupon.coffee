describe 'Api.coupon (browser)', ->
  describe '.get', ->
    it 'should get coupon', ->
      coupon = yield browser.evaluate ->
        api.coupon.get 'SUCH-COUPON'

      coupon.amount.should.equal 500
