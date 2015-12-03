describe 'Api.coupon', ->
  describe '.get', ->
    it 'should get coupon', ->
      coupon = yield api.coupon.get 'SUCH-COUPON'
      coupon.amount.should.equal 500
