request = require 'request'
Promise = require 'broken'

{isString, newError} = require '../utils'

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
    @userKey or @key or Client.KEY

  request: (url, data, method = 'POST', key = @getKey()) ->
    opts =
      url:    (@endpoint.replace /\/$/, '') + url + '?token=' + key
      method: method

    if (method is 'POST') or (method is 'PATCH')
      opts.json = data
    else
      opts.json = true

    if @debug
      console.log '--REQUEST--'
      console.log opts

    new Promise (resolve, reject) =>
      request opts, (err, res) =>
        res.status = res.statusCode
        res.data   = res.body

        if @debug
          console.log '--RESPONSE--'
          console.log res.toJSON()

        if err? or (res.status > 308) or res.data?.error?
          err = newError opts, res
          console.log 'ERROR:', err if @debug
          return reject err

        resolve
          url:          opts.url
          req:          opts
          res:          res
          data:         res.data
          responseText: res.data
          status:       res.status
          statusText:   res.statusText
          headers:      res.headers
