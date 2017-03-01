hanzo = require '../'

describe 'blueprints', ->
  it 'should be created successfully', ->
    Object.keys(hanzo.blueprints.browser).length.should.be.above 0
    Object.keys(hanzo.blueprints.server).length.should.be.above 0
    Object.keys(hanzo.blueprints.url).length.should.be.above 0
