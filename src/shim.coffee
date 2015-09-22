promise = require 'bluebird'
xhr = require 'xhr-promise'

promise.new = (fn)->
  return new promise fn

module.exports =
  xhr: (data)->
    x = new xhr()
    return x.send.apply x, arguments
  promise: promise

#requires bind polyfill
