chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

Nightmare = require 'nightmare'

before ->
  global.browser = Nightmare()

after ->
  yield browser.end()

render = ({src, args}) ->
  """
  (function javascript () {
    var log = console.log;
    var ipc = __nightmare.ipc;
    var sliced = __nightmare.sliced;

    console.log = function() {
      ipc.send('log', sliced(arguments).map(String));
    }

    function done(err, response) {
      if (err) {
        var message = {
          name:    err.name,
          message: err.message,
          stack:   err.stack
        }
        ipc.send('error', JSON.stringify(message));
      } else {
        ipc.send('response', response);
      }

      console.log = log;
    }

    // Evaluate code
    try {
      var response = (#{src})(#{args})
    } catch (err) {
      return done(err)
    }

    // Handle Promises
    if (typeof response.then === 'function') {
      return response.then(function(value) {
        done(null, value)
      }).catch(function(err) {
        done(err)
      })
    }

    done(null, response)
  })()
  """

debug = (require 'debug') 'nightmare-evaluate-async'

evaluateAsync = (fn, args...) ->
  debug '.evaluateAsync() fn on the page'

  done = args.pop()

  unless typeof done is 'function'
    args.push done
    done = ->

  argsList = (JSON.stringify args).slice 1,-1
  js = render src: (String fn), args: argsList

  @child.once 'javascript', (errstr, result) ->
    if errstr?
      errmsg    = JSON.parse errstr
      err       = new Error errmsg.message
      err.name  = errmsg.name
      err.stack = errmsg.stack
      done err
    else
      done null, result

  @child.emit 'javascript', js
  @


Nightmare::evaluateAsync = (args...) ->
  debug 'queueing action "evaluateAsync"'
  @_queue.push [evaluateAsync, args]
  @
