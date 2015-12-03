moment = require 'moment'

describe 'Api.collection', ->
  fixture =
    slug:        'such-tees-pack'
    name:        'Such tees pack'
    description: 'Much tees in one pack!'
    available: true
    published: true

  before ->
    yield api.collection.create fixture
    console.log 'added'

  describe '.list', ->
    it 'should list collections', ->
      {count, models} = yield api.collection.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.get', ->
    it 'should get collection', ->
      collection = yield api.collection.get slug: 'such-tees-pack'
      collection.name.should.eq 'Such tees pack'
      collection.available.should.eq true
      collection.published.should.eq true

  describe '.create, .delete', ->
    it 'should create and delete collections', ->
      collection = yield api.collection.create fixture
      collection.name.should.eq fixture.name
      collection.slug.should.eq fixture.slug
      collection.description.should.eq fixture.description
      collection.available.should.eq fixture.available
      collection.published.should.eq fixture.published

      res = null
      tryDelete = ->
        try
          res = yield api.collection.delete slug: collection.slug
        catch err
          setTimeout tryDelete, 500

      console.log res

  describe '.update', ->
    it 'should update collections', ->
      collection = yield api.collection.update slug: fixture.slug
      collection.slug.should.eq fixture.slug
