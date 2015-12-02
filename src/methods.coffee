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

  # USER/ACCOUNT
  user:

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
        @setToken res.data.token
        res

    logout: -> @setToken ''

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

    # no data required
    account:
      uri:     '/account'
      method:  'GET'
      expects: statusOk

    # data should be a user object
    updateAccount:
      uri:     '/account'
      method:  'PATCH'
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

    # data =
    #     userId:   id of user
    #     orderId:  id of order
    #     program:  program object
    newReferrer: ->
      uri:     '/referrer'
      method:  'POST'
      expects: statusCreated

  # UTILITY
  util:
    product:
      uri:     storeUri (x) -> '/product/' + x.id ? x
      method:  'GET'
      expects: statusOk

    coupon: (code, success, fail) ->
      uri:     storeUri (x) -> '/coupon/' + x.id ? x
      method:  'GET'
      expects: statusOk
