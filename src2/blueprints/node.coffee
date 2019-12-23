import isFunction from 'es-is/function'

# Start with browser-based APIs.
import blueprints from './browser'
import deploy     from './deploy'

import {
  statusCreated
  statusNoContent
  statusOk
} from  '../utils'

import {byId} from './url'

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
  'review'
  'site'
  'subscriber'
  'subscription'
  'transaction'
  'token'
  'user'
  'variant'
]

for model in models
  blueprints[model] = createBlueprint model

cart            = createBlueprint 'cart'
cart.set        = blueprints.cart.set
cart.discard    = blueprints.cart.discard
blueprints.cart = cart

blueprints.referrer.referrals =
  url:     (x) -> "/referrer/#{x.id ? x}/referrals"
  method:  'GET'
  expects: statusOk

blueprints.referrer.transactions =
  url:     (x) -> "/referrer/#{x.id ? x}/transactions"
  method:  'GET'
  expects: statusOk

blueprints.order.refund =
  url:     (x) -> "/order/#{x.id ? x}/refund"
  method:  'POST'
  expects: statusOk

blueprints.deploy = deploy

export default blueprints
