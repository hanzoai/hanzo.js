describe 'Api.account', ->
  describe '.create', ->
    it 'should create users', ->
      {status} = yield api.account.create
        firstName:       firstName
        lastName:        lastName
        email:           email
        password:        goodPass1
        passwordConfirm: goodPass1

      status.should.eq 201

    it 'should enforce email requirement', ->
      try
        yield api.account.create
          firstName:       firstName
          lastName:        lastName
          email:           firstName
          password:        goodPass1
          passwordConfirm: goodPass1

      catch err

      err.status.should.eq 400
      err.message.should.eq 'Email is not valid'

    it 'should not allow firstName to be blank', ->
      try
        res = yield api.account.create
          firstName:       ''
          lastName:        lastName
          email:           randomEmail()
          password:        goodPass1
          passwordConfirm: goodPass1
      catch err

      err.status.should.eq 400
      err.message.should.eq 'First name cannot be blank'

    it 'should not allow firstName to be nil', ->
      try
        yield api.account.create
          # firstName:       firstName
          lastName:        lastName
          email:           randomEmail()
          password:        goodPass1
          passwordConfirm: goodPass1
      catch err

      err.status.should.eq 400
      err.message.should.eq 'First name cannot be blank'

    it 'should enforce password match requirement', ->
      try
        yield api.account.create
          firstName:       firstName
          lastName:        lastName
          email:           randomEmail()
          password:        goodPass1
          passwordConfirm: goodPass2
      catch err

      err.status.should.eq 400
      err.message.should.equal 'Passwords need to match'

    it 'should enforce password min-length requirement', ->
      try
        yield api.account.create
          firstName:       firstName
          lastName:        lastName
          email:           randomEmail()
          password:        badPass1
          passwordConfirm: badPass1
      catch err

      err.status.should.eq 400
      err.message.should.eq 'Password needs to be atleast 6 characters'

  describe '.login', ->
    # test users are automatically enabled
    it 'should login valid users', ->
      res = yield api.account.login
        email:    email
        password: goodPass1

    it 'should not login non-existant users', ->
      try
        yield api.account.login
          email:    randomEmail()
          password: goodPass1
      catch err

      err.status.should.equal 401
      err.message.should.equal 'Email or password is incorrect'

    it 'should not allow login with invalid password', ->
      try
        yield api.account.login
          email:    email
          password: goodPass2
      catch err

      err.status.should.eq 401
      err.message.should.eq 'Email or password is incorrect'

  describe '.get', ->
    it 'should retrieve logged in user data', ->
      {data, status} = yield api.account.get()

      status.should.equal 200
      data.firstName.should.not.equal ''
      data.lastName.should.not.equal ''
      data.email.should.not.equal ''

  describe '.update', ->
    it 'should patch logged in user data', ->
      {data, status} = yield api.account.update
        firstName: newFirstName

      status.should.equal 200
      data.firstName.should.not.equal ''
      data.lastName.should.not.equal ''
      data.email.should.not.equal ''
