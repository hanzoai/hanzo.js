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
      expects: (x) -> (statusOk x) or (statusCreated x)

    createConfirm:
      url:     (x) -> "/account/create/confirm/#{x.tokenId ? x}"
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
      @setUserKey ''

    reset:
      url:     (x) -> "/account/reset?email=#{x.email ? x}"
      method:  'POST'
      expects: statusOk

    resetConfirm:
      url:     (x) -> "/account/reset/confirm/#{x.tokenId ? x}"
      method:  'POST'
      expects: statusOk

  # CHECKOUT
  checkout:
    authorize:
      url:     storePrefixed '/authorize'
      method:  'POST'
      expects: statusOk

    capture:
      url:     storePrefixed (x) -> "/capture/#{x.orderId ? x}"
      method:  'POST'
      expects: statusOk

    charge:
      url:     storePrefixed '/charge'
      method:  'POST'
      expects: statusOk

    paypal:
      url:     storePrefixed '/paypal/pay'
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
  'coupon'
  'collection'
  'product'
  'variant'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

module.exports = blueprints
