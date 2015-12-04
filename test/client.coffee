NodeClient = require '../lib/client/node'

describe 'Client', ->
  it 'should instantiate', ->
    client = new NodeClient 'fakekey'

  it 'should use default endpoint', ->
    client = new NodeClient 'fakekey'
    client.endpoint.should.eq 'https://api.crowdstart.com'
