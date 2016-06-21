describe 'Api.account (browser)', ->
  describe '.create', ->
    it 'should create users', ->
      user = yield browser.evaluate ->
        api.account.create
          firstName:       firstName
          lastName:        lastName
          email:           email
          password:        goodPass1
          passwordConfirm: goodPass1
      user.firstName.should.not.eq ''

    it 'should enforce email requirement', ->
      try
        yield browser.evaluate ->
          api.account.create
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
        yield browser.evaluate ->
          api.account.create
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
        yield browser.evaluate ->
          api.account.create
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
        yield browser.evaluate ->
          api.account.create
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
        yield browser.evaluate ->
          api.account.create
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
      res = yield browser.evaluate ->
        api.account.login
          email:    email
          password: goodPass1
      res.token.should.not.eq ''

    it 'should not login non-existant users', ->
      try
        yield browser.evaluate ->
          api.account.login
            email:    randomEmail()
            password: goodPass1
      catch err

      err.status.should.equal 401
      err.message.should.equal 'Email or password is incorrect'

    it 'should not allow login with invalid password', ->
      try
        yield browser.evaluate ->
          api.account.login
            email:    email
            password: goodPass2
      catch err

      err.status.should.eq 401
      err.message.should.eq 'Email or password is incorrect'

  describe '.get', ->
    it 'should retrieve logged in user data', ->
      user = yield browser.evaluate () ->
        api.account.get()

      user.firstName.should.not.equal firstName
      user.lastName.should.not.equal lastName
      user.email.should.not.equal email

  describe '.update', ->
    it 'should patch logged in user data', ->
      user = yield browser.evaluate ->
        api.account.update
          firstName: newFirstName

      user.firstName.should.not.equal newFirstName
      user.lastName.should.not.equal lastName
      user.email.should.not.equal email

    it 'should patch logged in user password', ->
      user = yield browser.evaluate ->
        api.account.update
          password:         goodPass2
          passwordConfirm:  goodPass2

      res = yield browser.evaluate ->
        api.account.login
          email:    email
          password: goodPass2

      res.token.should.not.eq ''

