describe 'Api.submission', ->
  testSubmission =
    email: 'tim@suchfan.com'
    metadata:
      name:     'Tim'
      question: 'Does this work?'

  id = null

  before ->
   {id} = yield api.submission.create testSubmission

  describe '.create', ->
    it 'should create submission', ->
      obj = clone testSubmission
      obj.email = 'tim2@suchfan.com'
      submission = yield api.submission.create obj
      submission.email.should.eq obj.email

  describe '.get', ->
    it 'should get submission', ->
      submission = yield api.submission.get id
      submission.email.should.eq 'tim@suchfan.com'

  describe '.list', ->
    it 'should list submissions', ->
      {count, models} = yield api.submission.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update submission', ->
      obj = clone testSubmission
      sub = yield api.submission.create obj
      newEmail = 'somenew@email.com'
      sub2 = yield api.submission.update
        id: sub.id
        email: newEmail
      sub2.email.should.eq newEmail

  describe '.delete', ->
    it 'should delete site', ->
      obj = clone testSubmission
      sub = yield api.submission.create obj
      yield api.site.delete obj.id
      try
        yield api.submission.get id
      catch err
      err.should.exist
