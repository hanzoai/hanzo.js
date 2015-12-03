NodeClient = require '../lib/client/node'

describe 'NodeClient', ->
  it 'should instantiate', ->
    new NodeClient 'fakekey'
