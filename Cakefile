require 'shortcake'

fs = require 'mz/fs'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  exec 'node_modules/.bin/coffee -bcm -o lib/ src/'
  exec 'node_modules/.bin/requisite src/index.coffee -g -o crowdstart.js'

task 'build-min', 'build project', ->
  invoke 'build', ->
    exec 'node_modules/.bin/requisite src/index.coffee -m -o checkout.min.js'

task 'watch', 'watch for changes and recompile project', ->
  exec 'node_modules/.bin/coffee -bcmw -o lib/ src/'

task 'selenium-install', 'Install selenium standalone', (cb) ->
  files = [
    './node_modules/selenium-standalone/.selenium/selenium-server'
    './node_modules/selenium-standalone/.selenium/chromedriver'
  ]
  found = yield Promise.all (fs.exists f for f in files)
  return if found.every (fileExists) -> fileExists

  exec 'node_modules/.bin/selenium-standalone install', cb

task 'static-server', 'Run static server for tests', (cb) ->
  connect = require 'connect'
  server = connect()
  server.use (require 'serve-static') './test'

  port = process.env.PORT ? 3333
  console.log "Static server started at http://localhost:#{port}"
  server.listen port, cb

task 'test', 'Run tests', ['selenium-install', 'static-server'], (opts) ->
  browserName      = opts.browser          ? 'phantomjs'
  externalSelenium = opts.externalSelenium ? false
  grep             = opts.grep             ? ''
  test             = opts.test             ? 'test/'
  verbose          = opts.verbose          ? false

  grep = "--grep #{opts.grep}" if grep

  runTest = (cb) ->
    exec "NODE_ENV=test
          BROWSER=#{browserName}
          VERBOSE=#{verbose}
          node_modules/.bin/mocha
          --colors
          --reporter spec
          --timeout 90000
          --compilers coffee:coffee-script/register
          --require co-mocha
          --require postmortem/register
          #{grep}
          #{test}
          test/", cb

  if externalSelenium
    runTest (err) ->
      process.exit 1 if err?
      process.exit 0

  selenium = require 'selenium-standalone'
  selenium.start (err, child) ->
    throw err if err?

    runTest (err) ->
      child.kill()
      process.exit 1 if err?
      process.exit 0

task 'publish', 'publish project', (options) ->
  newVersion = options.version ? 'patch'

  exec """
  git push
  npm version #{newVersion}
  npm publish
  """.split '\n'
