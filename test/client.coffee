Client = require '../lib/client'

describe 'Client', ->
  it 'should instantiate', ->
    Client 'fakekey'
