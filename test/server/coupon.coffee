moment = require 'moment'

describe 'Api.coupon', ->
  testCoupon =
    code:      "such-test-coupon"
    name:      "Such Test Coupon"
    type:      "flat"
    startDate: new Date()
    endDate:   moment(new Date()).add(1, 'month')
    once:      true
    enabled:   true
    amount:    500

  describe '.list', ->
    it 'should list coupons', ->
      {count, models} = yield api.coupon.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.get', ->
    it 'should get coupon', ->
      coupon = yield api.coupon.get 'such-coupon'
      coupon.amount.should.equal 500

  describe '.create, .delete', ->
    it 'should create and delete coupons', ->
      coupon = yield api.coupon.create testCoupon
      coupon.amount.should.eq testCoupon.amount

      res = null
      tryDelete = ->
        try
          res = yield api.coupon.delete code: coupon.code
        catch err
          setTimeout tryDelete, 500

  describe '.update', ->
    it 'should update coupons', ->
      coupon = yield api.coupon.update code: 'SUCH-COUPON'
      coupon.amount.should.eq 500
