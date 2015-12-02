{
  isFunction
  statusCreated
  statusNoContent
  statusOk
} = require '../utils'

{byId, storePrefixed} = require './uri'

# Default blueprint for browser APIs
createBlueprint = (name) ->
    endpoint = "/#{name}"

    list:
      uri:    endpoint
      method: 'GET'
    get:
      uri:     byId name
      method:  'GET'
      expects: statusOk

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
      uri:     storePrefixed '/authorize'
      method:  'POST'
      expects: statusOk

    capture:
      uri:     storePrefixed (x) -> '/capture/' + x.orderId
      method:  'POST'
      expects: statusOk

    charge:
      uri:     storePrefixed '/charge'
      method:  'POST'
      expects: statusOk

    paypal:
      uri:     storePrefixed '/paypal/pay'
      method:  'POST'
      expects: statusOk

# Add model-specific APIs
models = [
  'coupon'
  'product'
  'referral'
  'referrer'
  'transaction'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

module.exports = blueprints
