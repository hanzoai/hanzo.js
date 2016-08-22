describe 'Api.account', ->
  describe '.create', ->
    it 'should create users', ->
      user = yield api.account.create
        firstName:       firstName
        lastName:        lastName
        email:           email
        password:        goodPass1
        passwordConfirm: goodPass1

      user.firstName.should.not.eq ''

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
        yield api.account.create
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
