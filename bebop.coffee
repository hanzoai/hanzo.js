fs        = require 'fs'
path      = require 'path'
exec      = require('executive').interactive
requisite = require 'requisite'

compileCoffee = (src) ->
  return unless /^src|src\/browser.coffee$/.test src

  requisite.bundle
    entry: 'src/browser.coffee'
    globalRequire: true
    compilers:
      jade: compileJade
  , (err, bundle) ->
    return console.error err if err?
    fs.writeFileSync 'crowdstart.js', bundle.toString(), 'utf8'
    console.log 'compiled crowdstart.js'

module.exports =
  port: 4242

  cwd: process.cwd()

  exclude: [
    /lib/
    /node_modules/
    /vendor/
  ]

  compilers:
    css: -> false
    coffee: compileCoffee
