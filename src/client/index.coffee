request = require 'request'
broken  = require 'broken'

module.exports = class Client
  debug:    false
  endpoint: 'https://api.crowdstart.com'

  constructor: ({@key, @endpoint, @debug} = {}) ->
    return new Client @key unless @ instanceof Client

  setKey: (key) ->
    @key = key

  setUserKey: (key) ->
    @userKey = key

  getKey: ->
    @userKey or @key

  request: (uri, data, method = 'POST', key = @getKey()) ->
    opts =
      url:    (@endpoint.replace /\/$/, '') + uri + '?token=' + key
      method: method
      json:   data

    if @debug
      console.log('REQUEST:', opts)

    new Promise (resolve, reject) ->
      request opts, (err, res, body) ->
        if err?
          reject
            req:    opts
            res:    res
            data:   res
            status: res.statusCode
        else
          resolve
            req:    req
            res:    res
            data:   res.json
            status: res.statusCode
