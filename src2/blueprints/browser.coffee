import isFunction from 'es-is/function'

import {
  GET
  POST
  PATCH
  statusCreated
  statusNoContent
  statusOk
} from '../utils'

import {byId, storePrefixed} from './url'

# Only list, get methods of a few models are supported with a publishable key,
# so only these methods are exposed in the browser.
createBlueprint = (name) ->
  endpoint = "/#{name}"

  list:
    url:     endpoint
    method:  GET
    expects: statusOk
  get:
    url:     byId name
    method:  GET
    expects: statusOk

blueprints =
  # LIBRARY
  library:
    shopjs:
      url:  '/library/shopjs'
      method: POST
      expects: statusOk

  # ACCOUNT
  account:
    get:
      url:     '/account'
      method:  GET
      expects: statusOk
      useCustomerToken: true

    update:
      url:     '/account'
      method:  PATCH
      expects: statusOk
      useCustomerToken: true

    exists:
      url:     (x) -> "/account/exists/#{x.email ? x.username ? x.id ? x}"
      method:  GET
      expects: statusOk
      process: (res) -> res.data.exists

    create:
      url:     '/account/create'
      method:  POST
      expects: statusCreated

    enable:
      url:     (x) -> "/account/enable/#{x.tokenId ? x}"
      method:  POST
      expects: statusOk

    login:
      url:     '/account/login'
      method:  POST
      expects: statusOk
      process: (res) ->
        @setCustomerToken res.data.token
        res

    logout: ->
      @deleteCustomerToken()

    reset:
      url:     '/account/reset'
      method:  POST
      expects: statusOk
      useCustomerToken: true

    updateOrder:
      url:     (x) -> "/account/order/#{x.orderId ? x.id ? x}"
      method:  PATCH
      expects: statusOk
      useCustomerToken: true

    confirm:
      url:     (x) -> "/account/confirm/#{x.tokenId ? x}"
      method:  POST
      expects: statusOk
      useCustomerToken: true

    paymentMethod:
      url:     (x) -> "/account/paymentmethod/#{x.type}"
      method:  POST
      expects: statusCreated
      useCustomerToken: true

  # CART
  cart:
    create:
      url:      '/cart'
      method:   POST
      expects:  statusCreated
    update:
      url:      (x) -> "/cart/#{x.id ? x}"
      method:   PATCH
      expects:  statusOk
    discard:
      url:      (x) -> "/cart/#{x.id ? x}/discard"
      method:   POST
      expects:  statusOk
    set:
      url:      (x) -> "/cart/#{x.id ? x}/set"
      method:   POST
      expects:  statusOk

  # REVIEWS
  review:
    create:
      url:      '/review'
      method:   POST
      expects:  statusCreated
    get:
      url:      (x)-> "/review/#{x.id ? x}"
      method:   GET
      expects:  statusOk

  # CHECKOUT
  checkout:
    authorize:
      url:     storePrefixed '/checkout/authorize'
      method:  POST
      expects: statusOk

    capture:
      url:     storePrefixed (x) -> "/checkout/capture/#{x.orderId ? x}"
      method:  POST
      expects: statusOk

    charge:
      url:     storePrefixed '/checkout/charge'
      method:  POST
      expects: statusOk

    paypal:
      url:     storePrefixed '/checkout/paypal'
      method:  POST
      expects: statusOk

  # REFERRER
  referrer:
    create:
      url:     '/referrer'
      method:  POST
      expects: statusCreated

    get:
      url:     (x) -> "/referrer/#{x.id ? x}"
      method:  GET
      expects: statusOk

  # MARKETING
  marketing:
    create:
      url:     '/marketing'
      method:  POST
      expects: statusCreated

    # get:
    #   url:     (x) -> "/referrer/#{x.id ? x}"
    #   method:  GET
    #   expects: statusOk

# MODELS
models = [
  'collection'
  'coupon'
  'product'
  'variant'
  'movie'
  'watchlist'

  'copy'
  'media'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

# MARKETING MODELS
marketingModels = [
  'adcampaign'
  'adconfig'
  'adset'
  'ad'
]

for model in marketingModels
  do (model) ->
    blueprints[model] = createBlueprint "marketing/#{model}"

export default blueprints
