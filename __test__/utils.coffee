{updateQuery} = (require '../').utils

describe 'utils', ->
  describe '#updateQuery', ->
    it 'should update query parameters for a given url', ->
      base = 'https://api.hanzo.io'

      url = updateQuery base, token: '123456'
      url.should.eq base + '?token=123456'

      url = updateQuery url, foo: 'bar'
      url.should.eq base + '?token=123456&foo=bar'
