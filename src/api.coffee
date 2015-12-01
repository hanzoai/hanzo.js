{isFunction, statusOk, statusCreated} = require './utils'

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

module.exports =
  # Default blueprint:
  #   method:  'POST'
  #   expects: statusOk

  # USER/ACCOUNT
  user:

    # data =
    #     email:          ...
    exists:
      uri:     (x) -> "/account/exists/#{x.email ? x.username ? x.id ? x}"
      method:  'GET'
      process: (res) -> res.data.exists

    # data =
    #     firstName:          ...
    #     lastName:           ...
    #     email:              ...
    #     password:           ...
    #     passwordConfirm:    ...
    create:
      uri:     '/account/create'
      # TODO: Make this expects: statusCreated

    # data =
    #     tokenId:            ...
    createConfirm:
      uri:     (x) -> '/account/create/confirm/' + x.tokenId

    # data =
    #     email:      ...
    #     password:   ...
    login:
      uri:     '/account/login'
      process: (res) ->
        @setToken res.data.token
        res

    logout: -> @setToken ''

    # data =
    #     email:  ...
    reset:
      uri:     (x) -> '/account/reset?email=' + x.email

    # data =
    #     tokenId:            ...
    #     password:           ...
    #     passwordConfirm:    ...
    resetConfirm:
      uri:     (x) -> '/account/reset/confirm/' + x.tokenId

    # no data required
    account:
      uri:     '/account'
      method:  'GET'

    # data should be a user object
    updateAccount:
      uri:     '/account'
      method:  'PATCH'

  # PAYMENT
  payment:
    # data =
    #     user:     user object
    #     order:    order object
    #     payment:  payment object
    authorize:
      uri:     storeUri '/authorize'

    # data =
    #     orderId:  order id of existing order
    capture: (data, success, fail) ->
      uri:     storeId (x) -> '/capture/' + x.orderId

    charge: (data, success, fail) ->
      uri:     storeId '/charge'

    paypal: (data, success, fail) ->
      uri: storeId '/paypal/pay'

    # data =
    #     userId:   id of user
    #     orderId:  id of order
    #     program:  program object
    newReferrer: ->
      uri: '/referrer'
      expects: statusCreated

  # UTILITY
  util:
    product:
      uri: storeId (x) -> '/product/' + x.id ? x
      method: 'GET'

    coupon: (code, success, fail) ->
      uri: storeId (x) -> '/coupon/' + x.id ? x
      method: 'GET'
