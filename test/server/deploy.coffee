fs     = require 'mz/fs'
path   = require 'path'
crypto = require 'crypto'

describe 'Api.deploy', ->
  deploy = null
  site   = null

  before ->
    site =
      name:      'site-' + (randomToken 4)
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

    {id} = yield api.site.create site

    deploy =
      siteId: id
      files: {}

    # create digest for deploy
    basedir = path.join __dirname, '..', 'fixtures'
    files = yield fs.readdir basedir

    for file in files
      content = yield fs.readFile path.join basedir, file
      hash    = crypto.createHash 'sha1'
                      .update content
                      .digest 'hex'
      deploy.files[file] = hash

  describe '.create', ->
    it 'should create deploy', ->
      digest = yield api.deploy.create deploy
      console.log digest

  # describe '.get', ->
  #   it 'should get site by id', ->
  #     site2 = yield api.site.get siteId
  #     site2.name.should.eq site.name

  #   it 'should get site by name', ->
  #     site2 = yield api.site.get site.name
  #     site2.name.should.eq site.name

  # describe '.list', ->
  #   it 'should list sites', ->
  #     {count, models} = yield api.site.list()
  #     models.length.should.be.gt 0
  #     count.should.be.gt 0

  # describe '.update', ->
  #   it 'should update site', ->
  #     site2 = yield api.site.update
  #       name:   site.name
  #       domain: 'my-domain2.com'

  #     site2.domain.should.eq 'my-domain2.com'

  # describe '.delete', ->
  #   it 'should delete site', ->
  #     yield api.site.delete site.name
