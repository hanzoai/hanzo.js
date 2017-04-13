# Few status codes we use throughout code base
export statusOk        = (res) -> res.status is 200
export statusCreated   = (res) -> res.status is 201
export statusNoContent = (res) -> res.status is 204

# Allow method names to be minified
export GET   = 'GET'
export POST  = 'POST'
export PATCH = 'PATCH'

# Throw "fat" errors.
export newError = (data, res = {}, err) ->
  message = res.data?.error?.message ? 'Request failed'

  unless err?
    err = new Error message

  err.data         = res.data
  err.msg          = message
  err.req          = data
  err.responseText = res.data
  err.status       = res.status
  err.type         = res.data?.error?.type
  err

# Update param in query
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
export updateQuery = (url, data) ->
  return url if typeof data != 'object'

  for k,v of data
    url = updateParam url, k, v
  url
