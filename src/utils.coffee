# Helpers
exports.isFunction = (fn) -> typeof fn is 'function'
exports.isString   = (s)  -> typeof s  is 'string'

# Few status codes we use throughout code base
exports.statusOk        = (res) -> res.status is 200
exports.statusCreated   = (res) -> res.status is 201
exports.statusNoContent = (res) -> res.status is 204

# Throw "fat" errors.
exports.newError = (data, res = {}) ->
  message = res?.data?.error?.message ? 'Request failed'

  err = new Error message
  err.message = message

  err.req          = data
  err.data         = res.data
  err.responseText = res.data
  err.status       = res.status
  err.type         = res.data?.error?.type
  err

updateParam = (url, key, value) ->
  re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi')

  if re.test url
    if value?
      url.replace re, '$1' + key + '=' + value + '$2$3'
    else
      hash = url.split '#'
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '')
      url += '#' + hash[1] if hash[1]?
      url
  else
    if value?
      separator = if url.indexOf('?') != -1 then '&' else '?'
      hash = url.split '#'
      url = hash[0] + separator + key + '=' + value
      url += '#' + hash[1] if hash[1]?
      url
    else
      url

# Update query on url
exports.updateQuery = (url, data) ->
  for k,v of data
    url = updateParam url, k, v
  url
