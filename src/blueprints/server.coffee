{
  isFunction
  statusCreated
  statusNoContent
  statusOk
} = require '../utils'

{byId} = require './url'

# Start with browser-based APIs.
blueprints = require './browser'

# Complete RESTful API available with secret key, so all methods are
# exposed in server environment.
createBlueprint = (name) ->
  endpoint = "/#{name}"

  url = byId name

  list:
    url:    endpoint
    method: 'GET'
  get:
    url:     url
    method:  'GET'
    expects: statusOk
  create:
    url:     endpoint
    method:  'POST'
    expects: statusCreated
  update:
    url:     url
    method:  'PATCH'
    expects: statusOk
  delete:
    url:     url
    method:  'DELETE'
    expects: statusNoContent

# MODELS
models = [
  'collection'
  'coupon'
  'order'
  'payment'
  'product'
  'referral'
  'referrer'
  'site'
  'subscriber'
  'transaction'
  'user'
  'variant'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

module.exports = blueprints
