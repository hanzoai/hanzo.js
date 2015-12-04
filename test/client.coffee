Client = require '../lib/client'

describe 'Client', ->
  it 'should instantiate', ->
    client = new Client 'fakekey'

  it 'should use default endpoint', ->
    client = new Client 'fakekey'
    client.endpoint.should.eq 'https://api.crowdstart.com'
