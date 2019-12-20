moment = require 'moment-timezone'
expect = require('chai').expect

rfc3339 = 'YYYY-MM-DDTHH:mm:ssZ'

describe 'Api.library', ->
  describe '.shopjs', ->
    it 'should get everything', ->
      res = yield api.library.shopjs {}

      res.countries.length.should.equal 247
      res.shippingRates.storeId.should.not.be.undefined
      res.shippingRates.geoRates.length.should.equal 2
      res.taxRates.storeId.should.not.be.undefined
      res.taxRates.geoRates.length.should.equal 2

    it 'should get nothing', ->
      res = yield api.library.shopjs
        hasCountries: true
        hasTaxRates: true
        hasShippingRates: true
        lastChecked: moment('3000-01-01').format rfc3339

      expect(res.countries).to.not.exist
      expect(res.shippingRates).to.not.exist
      expect(res.taxRates).to.not.exist

    it 'should get out of date', ->
      res = yield api.library.shopjs
        hasCountries: true
        hasTaxRates: true
        hasShippingRates: true
        lastChecked: moment('2017-01-01').format rfc3339

      res.countries.length.should.equal 247
      res.shippingRates.storeId.should.not.be.undefined
      res.shippingRates.geoRates.length.should.equal 2
      res.taxRates.storeId.should.not.be.undefined
      res.taxRates.geoRates.length.should.equal 2

    it 'should get out of date', ->
      try
        res = yield api.library.shopjs
          storeId: '123'
      catch err

      err.status.should.eq 404
