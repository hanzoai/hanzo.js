describe 'Api.site', ->
  site   = null
  siteId = null

  before ->
    site =
      name:      'site-' + (randomToken 2)
      domain:    'domain.com'
      password:  'some pass'
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

  describe '.create', ->
    it 'should create site', ->
      site2 = yield api.site.create site
      site2.name.should.eq site.name
      siteId = site2.id

  describe '.get', ->
    it 'should get site by id', ->
      site2 = yield api.site.get siteId
      site2.name.should.eq site.name

    it 'should get site by name', ->
      site2 = yield api.site.get site.name
      site2.name.should.eq site.name

  describe '.list', ->
    it 'should list sites', ->
      {count, models} = yield api.site.list()
      models.length.should.be.gt 0
      count.should.be.gt 0

  describe '.update', ->
    it 'should update site', ->
      site2 = yield api.site.update
        name:   site.name
        domain: 'my-domain2.com'

      site2.domain.should.eq 'my-domain2.com'

  describe '.delete', ->
    it 'should delete site', ->
      yield api.site.delete site.name
