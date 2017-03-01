hanzo = require '../'

describe 'blueprints', ->
  it 'should be created successfully', ->
    Object.keys(hanzo.blueprints).length.should.be.above 0
