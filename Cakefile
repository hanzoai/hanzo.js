require 'shortcake'

use 'cake-version'
use 'cake-publish'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'
option '-l', '--local',             'use local server for testing'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  # exec 'coffee -bcm -o lib/ src/'

  # plugins = [
  #   json()
  #   coffee()
  #   nodeResolve
  #     browser: true
  #     extensions: ['.js', '.coffee']
  #     module:  true
  #     preferBuiltins: true
  #   commonjs
  #     extensions: ['.js', '.coffee']
  #     sourceMap: true
  #     exclude: 'node_modules/request/**'
  #   globals()
  #   builtins()
  # ]

  # # Browser (single file)
  # bundle = yield rollup.rollup
  #   entry:   'src/browser.coffee'
  #   plugins:  plugins

  # analyzer.init limit: 1
  # console.log yield analyzer.formatted bundle

  # yield bundle.write
  #   format:     'iife'
  #   dest:       'hanzo.js'
  #   moduleName: 'Hanzo'
  #   sourceMap:  false

  # # CommonJS && ES Module for browser
  # deps = Object.keys pkg.dependencies

  # bundle = yield rollup.rollup
  #   entry:    'src/browser.coffee'
  #   external: deps
  #   plugins:  plugins

  # bundle.write
  #   format:     'cjs'
  #   dest:       pkg.browser
  #   moduleName: pkg.name
  #   sourceMap:  true

  # bundle.write
  #   format:    'es'
  #   dest:      pkg.module
  #   sourceMap: true

  # # Node version
  # bundle = yield rollup.rollup
  #   entry:    'src/index.coffee'
  #   external: deps
  #   plugins:  plugins

  # bundle.write
  #   format:         'cjs'
  #   dest:           pkg.main
  #   moduleName:     pkg.name
  #   sourceMap:      true

  # todo = 2
  # done = (err) ->
  #   throw err if err?
  #   cb() if --todo is 0

  # exec 'coffee -bcm -o lib/ src/', done

  # opts =
  #   entry:      'src/browser.coffee'
  #   stripDebug: true

  # requisite.bundle opts, (err, bundle) ->
  #   return done err if err?

  #   # Strip out unnecessary api bits
  #   bundle.moduleCache['./blueprints/browser'].walkAst (node) ->
  #     if (node.type == 'ObjectExpression') and (Array.isArray node.properties)

  #       node.properties = node.properties.filter (prop) ->
  #         if prop?.key?.name == 'method' and prop?.value?.value == 'POST'
  #           return false
  #         if prop?.key?.name == 'expects' and prop?.value?.name == 'statusOk'
  #           return false
  #         true

  #     false

  #   fs.writeFile 'hanzo.js', (bundle.toString opts), 'utf8', done
  handroll = require 'handroll'

  bundle = yield handroll.bundle
    entry:    'src/index.coffee'
    commonjs: true
  bundle.write format: 'cjs'

  bundle = yield handroll.bundle
    entry:    'src/browser.coffee'
  bundle.write format: 'es'

  bundle = yield handroll.bundle
    entry:    'src/browser.coffee'
    external: false

  bundle.write format: 'web'

task 'build:min', 'build project', ['build'], ->
  exec 'uglifyjs hanzo.js > hanzo.min.js'

server = do require 'connect'

task 'static-server', 'Run static server for tests', (cb) ->
  port = process.env.PORT ? 3333

  server.use (require 'serve-static') './test/fixtures'
  server = require('http').createServer(server).listen port, cb

task 'test', 'Run tests', ['build', 'static-server'], (opts) ->
  bail     = opts.bail     ? true
  coverage = opts.coverage ? false
  grep     = opts.grep     ? ''
  test     = opts.test     ? 'test/ test/server/ test/browser/'
  verbose  = opts.verbose  ? ''
  endpoint = opts.endpoint ? ''

  bail    = '--bail' if bail
  grep    = "--grep #{opts.grep}" if grep
  verbose = 'DEBUG=nightmare VERBOSE=true HANZO_DEBUG=1' if verbose

  if coverage
    bin = 'istanbul --print=none cover _mocha --'
  else
    bin = 'mocha'

  {status} = yield exec.interactive "NODE_ENV=test HANZO_KEY='' HANZO_ENDPOINT='' #{verbose}
        #{bin}
        --colors
        --reporter spec
        --timeout 10000000
        --compilers coffee:coffee-script/register
        --require co-mocha
        --require postmortem/register
        #{bail}
        #{grep}
        #{test}"

  server.close()
  process.exit status

task 'test-ci', 'Run tests', (opts) ->
  invoke 'test', bail: true, coverage: true

task 'coverage', 'Process coverage statistics', ->
  exec '''
    cat ./coverage/lcov.info | coveralls
    cat ./coverage/coverage.json | codecov
    rm -rf coverage/
    '''

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'

task 'watch:test', 'watch for changes and re-run tests', ->
  invoke 'watch'

  require('vigil').watch __dirname, (filename, stats) ->
    if /^src/.test filename
      invoke 'test'

    if /^test/.test filename
      invoke 'test', test: filename
