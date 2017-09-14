moment = require 'moment-timezone'

describe 'Api.referrer/Api.referrral', ->
  user = null
  referredUser = null
  refrFixture = null
  reflFixture = null
  referrer = null
  referral = null

  program =
    name: 'Sample Program'
    triggers: [0]
    actions: [
      {
        type:       'credit'
        amount:     1
        currency:   'points'
      }
    ]

  before ->
    user = yield api.account.create
      firstName:       'referrer' + firstName
      lastName:        'referrer' + lastName
      email:           'referrer' + email
      password:        goodPass1
      passwordConfirm: goodPass1

    referredUser = yield api.account.create
      firstName:       'referred' + firstName
      lastName:        'referred' + lastName
      email:           'referred' + email
      password:        goodPass1
      passwordConfirm: goodPass1

    refrFixture =
      userId: user.id
      orderId: 'orderId'
      program: program

    referrer = yield api.referrer.create refrFixture

    reflFixture =
      referrerId: referrer.id
      referrerUserId: user.id
      userId: referredUser.id
      orderId: 'referredOrderId'

    referral = yield api.referral.create reflFixture

  describe '.list referrer', ->
    it 'should list referrers', ->
      {count, models} = yield api.referrer.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.get referrer', ->
    it 'should get referrer', ->
      refr = yield api.referrer.get id: referrer.id
      refr.userId.should.equal refrFixture.userId
      refr.orderId.should.equal refrFixture.orderId
      refr.program.name.should.equal refrFixture.program.name
      refr.program.triggers.length.should.equal 1
      refr.program.actions.length.should.equal 1

  describe '.create, .delete referrer', ->
    it 'should create and delete referrers', ->
      refr = yield api.referrer.create refrFixture
      refr.userId.should.equal refrFixture.userId
      refr.orderId.should.equal refrFixture.orderId
      refr.program.name.should.equal refrFixture.program.name
      refr.program.triggers.length.should.equal 1
      refr.program.actions.length.should.equal 1

      res = null
      tryDelete = ->
        try
          res = yield api.referrer.delete id: refr.id
        catch err
          setTimeout tryDelete, 500

  describe '.update referrer', ->
    it 'should update referrers', ->
      refr = yield api.referrer.update id: referrer.id
      refr.id.should.eq referrer.id

  describe '.list referral', ->
    it 'should list referrals', ->
      {count, models} = yield api.referral.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe.skip '.get referral', ->
    it 'should get referral', ->
      refl = yield api.referral.get id: referral.id
      refl.userId.should.equal reflFixture.userId
      refl.orderId.should.equal reflFixture.orderId
      refl.referrer.id.should.equal reflFixture.referrerId
      refl.referrer.userId.should.equal reflFixture.referrerUserId

  describe.skip '.create, .delete referral', ->
    it 'should create and delete referrals', ->
      refl = yield api.referral.create reflFixture
      refl.userId.should.equal reflFixture.userId
      refl.orderId.should.equal reflFixture.orderId
      refl.referrerId.should.equal reflFixture.referrerId
      refl.referrerUserId.should.equal reflFixture.referrerUserId

      res = null
      tryDelete = ->
        try
          res = yield api.referral.delete id: refl.id
        catch err
          setTimeout tryDelete, 500

  describe '.update referral', ->
    it 'should update referrals', ->
      refl = yield api.referral.update id: referral.id
      refl.id.should.eq referral.id

  describe.skip 'Api.checkout.charge triggers referral', ->
    it 'should create a referral and transaction', ->
      order = yield api.checkout.charge
        user:
          id: referredUser.id
        order:
          shippingAddress:
            line1:        'line1'
            line2:        'line2'
            city:         'city'
            state:        'state'
            postalCode:   '11111'
            country:      'USA'
          currency: 'usd'
          items: [{
            productSlug: 'sad-keanu-shirt'
            quantity:    1
          }]
          referrerId: referrer.id
        payment:
          account:
            number: '4242424242424242'
            cvc:    '424'
            month:  '1'
            year:   '2020'

      refls = yield api.referrer.referrals id: referrer.id
      trans = yield api.referrer.transactions id: referrer.id

      refls.length.should.be.gt 0
      refl = refls[0]
      for refl in refls
        break if refl.orderId == order.id

      refl.userId.should.equal reflFixture.userId
      refl.orderId.should.equal order.id
      refl.referrerId.should.equal reflFixture.referrerId
      refl.referrerUserId.should.equal reflFixture.referrerUserId

      trans.length.should.equal 1
      tran = trans[0]
      tran.type.should.equal 'deposit'
      tran.amount.should.equal refrFixture.program.actions[0].amount
      tran.currency.should.equal refrFixture.program.actions[0].currency
