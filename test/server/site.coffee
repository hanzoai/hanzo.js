describe.skip 'Api.site', ->
  testSite =
    name:      "my-site"
    domain:    "my-domain.com"
    password:  "some pass"
    forceSsl:  false
    processingSettings:
      css:
        bundle: true, minify: true
      js:
        bundle: true, minify: true
      html:
        prettyUrls: true
        canonicalUrls: true
      images:
        optimize: true

  before ->
   model = yield api.site.create testSite

  describe '.create', ->
    it 'should create site', ->
      site  = yield api.site.get name: 'my-site'
      site2 = yield api.site.create Object.assign site, name: 'my-site-cop'
      site2.name.should.eq site.name

  describe '.get', ->
    it 'should get site', ->
      site = yield api.site.get 'my-site'
      site.name.should.eq 'my-site'

  describe '.list', ->
    it 'should list sites', ->
      {count, models} = yield api.site.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update site', ->
      site = yield api.site.update
        name: 'my-site'
        domain: 'my-site-domain2.com'

      site.domain.should.eq 'my-site-domain2.com'

  describe '.delete', ->
    it 'should delete site', ->
      yield api.site.delete name: 'my-site'
