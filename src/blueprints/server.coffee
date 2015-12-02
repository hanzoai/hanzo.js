{
  isFunction
  statusCreated
  statusNoContent
  statusOk
} = require '../utils'

{byId} = require './uri'

# Default blueprint for server APIs
createBlueprint = (name) ->
    endpoint = "/#{name}"

    uri = byId name

    list:
      uri:    endpoint
      method: 'GET'
    get:
      uri:     uri
      method:  'GET'
      expects: statusOk
    create:
      uri:     endpoint
      method:  'POST'
      expects: statusCreated
    update:
      uri:     uri
      method:  'PATCH'
      expects: statusOk
    delete:
      uri:     uri
      method:  'DELETE'
      expects: statusNoContent

# Start with browser-based APIs.
blueprints = require './browser'

# Add model-specific APIs
models = [
  'collection'
  'coupon'
  'order'
  'product'
  'referral'
  'referrer'
  'subscriber'
  'transaction'
  'user'
  'variant'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

# Extend existing payment APIs
blueprints.payment = Object.assign blueprints.payment, createBlueprint 'payment'

module.exports = blueprints
