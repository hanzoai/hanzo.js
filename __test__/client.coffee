hanzo = require '../'

describe 'Client', ->
  key = 'fakekey'
  client = new hanzo.Client key: key

  it 'should use default endpoint', ->
    client.opts.endpoint.should.eq 'https://api.hanzo.io'
