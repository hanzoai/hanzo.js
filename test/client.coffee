Client = require '../lib/client'

describe 'Client', ->
  key = 'fakekey'
  client = new Client key: key

  it 'should instantiate with and without new', ->
    Client key: key

  it 'should use default endpoint', ->
    client.endpoint.should.eq 'https://api.crowdstart.com'
