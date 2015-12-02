{isFunction, statusOk, statusCreated, statusNoContent} = require './utils'

storeUri = (u) ->
  (x) ->
    if isFunction u
      uri = u x
    else
      uri = u

    if @storeId?
      "/store/#{@storeId}" + uri
    else
      uri

blueprints =
  # ACCOUNT
  account:
    get:
      uri:     '/account'
      method:  'GET'
      expects: statusOk

    update:
      uri:     '/account'
      method:  'PATCH'
      expects: statusOk

    exists:
      uri:     (x) -> "/account/exists/#{x.email ? x.username ? x.id ? x}"
      method:  'GET'
      expects: statusOk
      process: (res) -> res.data.exists

    create:
      uri:     '/account/create'
      method:  'POST'
      expects: statusOk  # TODO: Make this statusCreated

    enable:
      uri:     (x) -> '/account/create/confirm/' + x.tokenId
      method:  'POST'
      expects: statusOk

    login:
      uri:     '/account/login'
      method:  'POST'
      expects: statusOk
      process: (res) ->
        @setUserKey res.data.token
        res

    logout: ->
      @setUserKey ''

    reset:
      uri:     (x) -> '/account/reset?email=' + x.email
      method:  'POST'
      expects: statusOk

    confirm:
      uri:     (x) -> '/account/reset/confirm/' + x.tokenId
      method:  'POST'
      expects: statusOk

  # PAYMENT
  payment:
    authorize:
      uri:     storeUri '/authorize'
      method:  'POST'
      expects: statusOk

    capture:
      uri:     storeUri (x) -> '/capture/' + x.orderId
      method:  'POST'
      expects: statusOk

    charge:
      uri:     storeUri '/charge'
      method:  'POST'
      expects: statusOk

    paypal:
      uri:     storeUri '/paypal/pay'
      method:  'POST'
      expects: statusOk

models = [
  'coupon'
  'product'
  'referral'
  'referrer'
  'subscriber'
  'transaction'
  'user'
]

for name in models
  do (name) ->
    endpoint = "/#{name}"

    blueprints[name] =
      list:
        uri:    endpoint
        method: 'GET'
      get:
        uri:     (x) -> "#{endpoint}/#{x.id ? x}"
        method:  'GET'
        expects: statusOk
      create:
        uri:     endpoint
        method:  'POST'
        expects: statusCreated
      update:
        uri:     (x) -> "#{endpoint}/#{x.id ? x}"
        method:  'PATCH'
        expects: statusOk
      delete:
        uri:     (x) -> "#{endpoint}/#{x.id ? x}"
        method:  'DELETE'
        expects: statusNoContent

for k, v of blueprints.coupon
  blueprints.coupon[k].uri = storeUri (x) -> "/coupon/#{x.code ? x}"

for k, v of blueprints.product
  blueprints.product[k].uri = storeUri (x) -> "/product/#{x.id ? x.slug ? x}"

module.exports = blueprints
