{isFunction} = require '../utils'

# Wrap a uri function to provide store-prefixed URLs
exports.storePrefixed = sp = (u) ->
  (x) ->
    if isFunction u
      uri = u x
    else
      uri = u

    if @storeId?
      "/store/#{@storeId}" + uri
    else
      uri

# Returns a URI for getting a single
exports.byId = (name) ->
  switch name
    when 'coupon'
      sp (x) -> "/coupon/#{x.code ? x}"
    when 'product'
      sp (x) -> "/product/#{x.id ? x.slug ? x}"
    else
      (x) -> "#{name}/#{x.id ? x}"
