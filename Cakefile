require 'shortcake'

use 'cake-bundle'
use 'cake-outdated'
use 'cake-publish'
use 'cake-version'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'
option '-l', '--local',             'use local server for testing'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  b = new Bundle
    compilers:
      coffee:
        version: 1

  yield b.write
    entry:     'src/browser.coffee'
    external:  false
    format:    'web'
    minify:    true
    sourceMap: false

  # Build es lib for bundlers
  yield b.write
    entry:  'src/browser.coffee'
    format: 'es'

  # Build commonjs lib
  yield b.write
    entry:    'src/index.coffee'
    format:   'cjs'
    commonjs: true

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
