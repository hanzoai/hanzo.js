{
  isFunction
  statusCreated
  statusNoContent
  statusOk
} = require '../utils'

{byId, storePrefixed} = require './url'

# Only list, get methods of a few models are supported with a publishable key,
# so only these methods are exposed in the browser.
createBlueprint = (name) ->
  endpoint = "/#{name}"

  list:
    url:     endpoint
    method:  'GET'
    expects: statusOk
  get:
    url:     byId name
    method:  'GET'
    expects: statusOk

blueprints =
  # ACCOUNT
  account:
    get:
      url:     '/account'
      method:  'GET'
      expects: statusOk

    update:
      url:     '/account'
      method:  'PATCH'
      expects: statusOk

    exists:
      url:     (x) -> "/account/exists/#{x.email ? x.username ? x.id ? x}"
      method:  'GET'
      expects: statusOk
      process: (res) -> res.data.exists

    create:
      url:     '/account/create'
      method:  'POST'
      expects: statusCreated

    enable:
      url:     (x) -> "/account/enable/#{x.tokenId ? x}"
      method:  'POST'
      expects: statusOk

    login:
      url:     '/account/login'
      method:  'POST'
      expects: statusOk
      process: (res) ->
        @setUserKey res.data.token
        res

    logout: ->
      @deleteUserKey()

    reset:
      url:     '/account/reset'
      method:  'POST'
      expects: statusOk

    confirm:
      url:     (x) -> "/account/confirm/#{x.tokenId ? x}"
      method:  'POST'
      expects: statusOk

  # CHECKOUT
  checkout:
    authorize:
      url:     storePrefixed '/checkout/authorize'
      method:  'POST'
      expects: statusOk

    capture:
      url:     storePrefixed (x) -> "/checkout/capture/#{x.orderId ? x}"
      method:  'POST'
      expects: statusOk

    charge:
      url:     storePrefixed '/checkout/charge'
      method:  'POST'
      expects: statusOk

    paypal:
      url:     storePrefixed '/checkout/paypal'
      method:  'POST'
      expects: statusOk

  # REFERRER
  referrer:
    create:
      url:     '/referrer'
      method:  'POST'
      expects: statusCreated

# MODELS
models = [
  'collection'
  'coupon'
  'product'
  'variant'
]

userModels = [
  'order'
  'subscription'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

module.exports = blueprints
