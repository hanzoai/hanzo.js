Client = require '../../lib/client/xhr'

describe 'Client (browser)', ->
  it 'should instantiate', ->
    Client 'fakekey'
