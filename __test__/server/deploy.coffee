fs     = require 'mz/fs'
path   = require 'path'
crypto = require 'crypto'

describe.skip 'Api.deploy', ->
  basedir = path.join __dirname, '..', 'tmp'
  deploy  = null
  digest  = null
  site    = null

  after ->
    yield fs.unlink path.join basedir, 'index.html'
    yield fs.rmdir basedir
    yield api.site.delete site.id

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

    site = yield api.site.create site

    digest =
      siteId: site.id
      files: {}

    # create digest for deploy
    try
      yield fs.mkdir basedir
    catch
    yield fs.writeFile (path.join basedir, 'index.html'), randomToken 999
    files = yield fs.readdir basedir

    for file in files
      content = yield fs.readFile path.join basedir, file
      hash    = crypto.createHash 'sha1'
                      .update content
                      .digest 'hex'
      digest.files[file] = hash

  describe '.create', ->
    it 'should create deploy', ->
      deploy = yield api.deploy.create digest
      deploy.required.should.eql (v for k,v of digest.files)
      deploy.siteId.should.eq digest.siteId

  describe '.upload', ->
    it 'should upload file required for deploy', ->
      for file of digest.files
        yield api.deploy.upload
          siteId:       digest.siteId
          deployId:     deploy.id
          path:         file
          absolutePath: path.join basedir, file

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
