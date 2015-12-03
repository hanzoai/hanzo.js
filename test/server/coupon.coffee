describe 'Api.coupon', ->
  describe '.get', ->
    it 'should get coupon', ->
      {status, data} = yield api.coupon.get 'SUCH-COUPON'

      status.should.equal 200
      data.amount.should.equal 500
