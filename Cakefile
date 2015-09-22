exec = require('executive').interactive

option '-g', '--grep [filter]', 'test filter'
option '-v', '--version [<newversion> | major | minor | patch | build]', 'new version'

task 'clean', 'clean project', (options) ->
  exec 'rm -rf lib'
  exec 'rm -rf .test'

task 'build', 'build project', (options) ->
  exec 'node_modules/.bin/coffee -bcm -o lib/ src/'
  exec 'node_modules/.bin/requisite src/index.coffee -g -o crowdstart.js'
  # exec 'node_modules/.bin/requisite src/index.coffee -m -o checkout.min.js'
  exec 'node_modules/.bin/requisite test/crowdstart.coffee -g -o ./.test/crowdstart.js'

task 'watch', 'watch for changes and recompile project', ->
  exec 'node_modules/.bin/coffee -bcmw -o lib/ src/'

task 'test', 'run tests', (options) ->
  test = options.test ? 'test/index.html'
  if options.grep?
    grep = "--grep #{options.grep}"
  else
    grep = ''

  exec "NODE_ENV=test ./node_modules/.bin/mocha-phantomjs
      --colors
      --reporter spec
      --timeout 5000
      --compilers coffee:coffee-script/register
      --require postmortem/register
      #{grep}
      #{test}"

task 'publish', 'publish project', (options) ->
  newVersion = options.version ? 'patch'

  exec """
  git push
  npm version #{newVersion}
  npm publish
  """.split '\n'
