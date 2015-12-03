{isFunction} = require '../utils'

# Wrap a url function to provide store-prefixed URLs
exports.storePrefixed = sp = (u) ->
  (x) ->
    if isFunction u
      url = u x
    else
      url = u

    if @storeId?
      "/store/#{@storeId}" + url
    else
      url

# Returns a URL for getting a single
exports.byId = (name) ->
  switch name
    when 'coupon'
      sp (x) -> "/coupon/#{x.code ? x}"
    when 'product'
      sp (x) -> "/product/#{x.id ? x.slug ? x}"
    when 'variant'
      sp (x) -> "/product/#{x.id ? x.sku ? x}"
    else
      (x) -> "#{name}/#{x.id ? x}"
