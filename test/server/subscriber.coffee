describe 'Api.subscriber', ->
  testSubscriber =
    email: 'tim@suchfan.com'
    metadata:
      name:     'Tim'
      question: 'Does this work?'

  id = null

  before ->
   {id} = yield api.subscriber.create testSubscriber

  describe '.create', ->
    it 'should create subscriber', ->
      obj = clone testSubscriber
      obj.email = 'tim2@suchfan.com'
      subscriber = yield api.subscriber.create obj
      subscriber.email.should.eq obj.email

  describe '.get', ->
    it 'should get subscriber', ->
      subscriber = yield api.subscriber.get id
      subscriber.email.should.eq 'tim@suchfan.com'

  describe '.list', ->
    it 'should list subscribers', ->
      {count, models} = yield api.subscriber.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update subscriber', ->
      obj = clone testSubscriber
      sub = yield api.subscriber.create obj
      newEmail = 'somenew@email.com'
      sub2 = yield api.subscriber.update
        id: sub.id
        email: newEmail
      sub2.email.should.eq newEmail

  describe '.delete', ->
    it 'should delete subscriber', ->
      obj = clone testSubscriber
      sub = yield api.subscriber.create obj
      yield api.subscriber.delete sub.id
      try
        yield api.subscriber.get sub.id
      catch err
      err.should.exist
