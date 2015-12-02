describe 'Api.coupon', ->
  describe '.get', ->
    it 'should get coupon', ->
      res = yield api.coupon.get 'SUCH-COUPON'

      res.status.should.equal 200
      res.data.amount.should.equal 500
