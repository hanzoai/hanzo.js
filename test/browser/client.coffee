XhrClient = require '../../lib/client/xhr'

describe 'XhrClient (browser)', ->
  it 'should instantiate', ->
    new XhrClient 'fakekey'
