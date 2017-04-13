import isFunction from 'es-is/function'

# Wrap a url function to provide store-prefixed URLs
export storePrefixed = sp = (u) ->
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
export byId = (name) ->
  switch name
    when 'coupon'
      sp (x) -> "/coupon/#{x.code ? x}"
    when 'collection'
      sp (x) -> "/collection/#{x.slug ? x}"
    when 'product'
      sp (x) -> "/product/#{x.id ? x.slug ? x}"
    when 'variant'
      sp (x) -> "/variant/#{x.id ? x.sku ? x}"
    when 'site'
      (x) -> "/site/#{x.id ? x.name ? x}"
    else
      (x) -> "/#{name}/#{x.id ? x}"
