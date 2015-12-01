exports.isFunction = (fn) -> typeof fn is 'function'
exports.isString   = (s)  -> typeof s  is 'string'

exports.newError = (data, res) ->
  if res.error?
    err = new Error res.error.message
    err.message = res.error.message
  else
    err = new Error 'Request failed'
    err.message = 'Request failed'

  err.req     = data
  err.res     = res
  res.data    = res.data
  err.status  = res.status
  err.type    = res.error.type
  err
