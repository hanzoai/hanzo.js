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
  account:
    # no data required
    get:
      uri:     '/account'
      method:  'GET'
      expects: statusOk

    # data should be a user object
    update:
      uri:     '/account'
      method:  'PATCH'
      expects: statusOk

    # data =
    #     email:          ...
    exists:
      uri:     (x) -> "/account/exists/#{x.email ? x.username ? x.id ? x}"
      method:  'GET'
      expects: statusOk
      process: (res) -> res.data.exists

    # data =
    #     firstName:          ...
    #     lastName:           ...
    #     email:              ...
    #     password:           ...
    #     passwordConfirm:    ...
    create:
      uri:     '/account/create'
      method:  'POST'
      expects: statusOk  # TODO: Make this statusCreated

    # data =
    #     tokenId:            ...
    createConfirm:
      uri:     (x) -> '/account/create/confirm/' + x.tokenId
      method:  'POST'
      expects: statusOk

    # data =
    #     email:      ...
    #     password:   ...
    login:
      uri:     '/account/login'
      method:  'POST'
      expects: statusOk
      process: (res) ->
        @setUserKey res.data.token
        res

    logout: -> @setUserKey ''

    # data =
    #     email:  ...
    reset:
      uri:     (x) -> '/account/reset?email=' + x.email
      method:  'POST'
      expects: statusOk

    # data =
    #     tokenId:            ...
    #     password:           ...
    #     passwordConfirm:    ...
    resetConfirm:
      uri:     (x) -> '/account/reset/confirm/' + x.tokenId
      method:  'POST'
      expects: statusOk

  # PAYMENT
  payment:
    # data =
    #     user:     user object
    #     order:    order object
    #     payment:  payment object
    authorize:
      uri:     storeUri '/authorize'
      method:  'POST'
      expects: statusOk

    # data =
    #     orderId:  order id of existing order
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
  blueprints.product[k].uri = storeUri (x) -> "/coupon/#{x.code ? x}"

for k, v of blueprints.product
  blueprints.product[k].uri = storeUri (x) -> "/product/#{x.id ? x.slug ? x}"

module.exports = blueprints
