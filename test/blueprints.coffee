describe 'blueprints', ->
  it 'should be created successfully', ->
    blueprints = require '../lib/blueprints'
    Object.keys(blueprints.browser).length.should.be.above 0
    Object.keys(blueprints.server).length.should.be.above 0
    Object.keys(blueprints.url).length.should.be.above 0
