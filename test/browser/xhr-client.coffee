Client = require '../../lib/client/xhr'

describe 'Client (xhr)', ->
  it 'should instantiate', ->
    Client 'fakekey'
