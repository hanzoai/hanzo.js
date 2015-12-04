XhrClient = require '../../lib/client/xhr'

describe 'XhrClient (browser)', ->
  it 'should instantiate', ->
    client = new XhrClient 'fakekey'
    client.endpoint.should.eq 'https://api.crowdstart.com'

  it 'should use default endpoint', ->
    client = new XhrClient 'fakekey'
    client.endpoint.should.eq 'https://api.crowdstart.com'
