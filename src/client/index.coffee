request = require 'request'
Promise = require 'broken'

{newError} = require '../utils'

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
      json:   data ? true

    if @debug
      console.log '--REQUEST--'
      console.log opts

    new Promise (resolve, reject) =>
      request opts, (err, res) =>
        res.status       = res.statusCode
        res.responseText = res.body

        try
          res.data = JSON.parse res.body
        catch err
          res.data = null

        if @debug
          console.log '--RESPONSE--'
          console.log 'ERROR:', err if err?
          console.log res.toJSON()

        if err?
          console.log 'rejecting!'
          return reject newError opts, res

        resolve
          url:          opts.url
          req:          opts
          res:          res
          data:         res.data
          status:       res.status
          statusText:   res.statusText
          responseText: res.responseText
          headers:      res.headers
