require 'shortcake'

fs        = require 'fs'
requisite = require 'requisite'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', (cb) ->
  todo = 2
  done = (err) ->
    throw err if err?
    cb() if --todo is 0

  exec 'coffee -bcm -o lib/ src/', done

  requisite.bundle entry: 'src/browser.coffee', (err, bundle) ->
    return done err if err?

    # Strip out unnecessary api bits
    bundle.moduleCache['./blueprints/browser'].walkAst (node) ->
      if (node.type == 'ObjectExpression') and (Array.isArray node.properties)

        node.properties = node.properties.filter (prop) ->
          if prop?.key?.name == 'method' and prop?.value?.value == 'POST'
            return false
          if prop?.key?.name == 'expects' and prop?.value?.name == 'statusOk'
            return false
          true

      false

    fs.writeFile 'crowdstart.js', bundle.toString(), 'utf8', done

task 'build-min', 'build project', ['build'], ->
  exec 'uglifyjs crowdstart.js --compress --mangle --lint=false > crowdstart.min.js'

task 'static-server', 'Run static server for tests', (cb) ->
  connect = require 'connect'
  server = connect()
  server.use (require 'serve-static') './test/fixtures'

  port = process.env.PORT ? 3333
  console.log "Static server started at http://localhost:#{port}"
  server.listen port, cb

task 'test', 'Run tests', ['static-server'], (opts) ->
  bail     = true
  grep     = opts.grep             ? ''
  test     = opts.test             ? 'test/ test/browser/'
  verbose  = opts.verbose          ? ''
  coverage = opts.coverage        ? false

  bail    = '--bail' if bail
  grep    = "--grep #{opts.grep}" if grep
  verbose = 'DEBUG=nightmare VERBOSE=true' if verbose

  if coverage
    bin = 'istanbul cover _mocha --'
  else
    bin = 'mocha'

  try
    yield exec.interactive "NODE_ENV=test #{verbose}
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
  catch err
    process.exit 1
  process.exit 0

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
    return if running 'test'

    if /^src/.test filename
      invoke 'test'

    if /^test/.test filename
      invoke 'test', test: filename

task 'publish', 'publish project', ->
  exec.parallel '''
  git push
  git push --tags
  npm publish
  '''
