describe 'Client (browser)', ->
  it 'should instantiate', ->
    yield browser.evaluate ->
      new Crowdstart.Client 'fakekey'

  it 'should use default endpoint', ->
    client = yield browser.evaluate ->
      client = new Crowdstart.Client 'fakekey'
      endpoint: client.endpoint

    client.endpoint.should.eq 'https://api.crowdstart.com'
