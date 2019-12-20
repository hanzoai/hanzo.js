describe 'Client (browser)', ->
  it 'should instantiate', ->
    yield browser.evaluate ->
      new Hanzo.Client 'fakekey'

  it 'should use default endpoint', ->
    client = yield browser.evaluate ->
      client = new Hanzo.Client 'fakekey'
      endpoint: client.endpoint

    client.endpoint.should.eq 'https://api.hanzo.io'
