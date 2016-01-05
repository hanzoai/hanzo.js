(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, cb) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof cb == 'function') {
      require.load(file, cb);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  require.waiting = {};
  // define async module
  require.async = function (url, fn) {
    require.modules[url] = fn;
    var cb;
    while (cb = require.waiting[url].shift())
      cb(require(url))
  };
  // Load module async module
  require.load = function (url, cb) {
    var script = document.createElement('script'), existing = document.getElementsByTagName('script')[0], callbacks = require.waiting[url] = require.waiting[url] || [];
    // We'll be called when async module is defined.
    callbacks.push(cb);
    // Load module
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    existing.parentNode.insertBefore(script, existing)
  };
  // source: src/api.coffee
  require.define('./api', function (module, exports, __dirname, __filename) {
    var Api, isFunction, isString, newError, ref, statusOk;
    ref = require('./utils'), isFunction = ref.isFunction, isString = ref.isString, newError = ref.newError, statusOk = ref.statusOk;
    module.exports = Api = function () {
      Api.BLUEPRINTS = {};
      Api.CLIENT = null;
      function Api(opts) {
        var blueprints, client, debug, endpoint, k, key, v;
        if (opts == null) {
          opts = {}
        }
        if (!(this instanceof Api)) {
          return new Api(opts)
        }
        endpoint = opts.endpoint, debug = opts.debug, key = opts.key, client = opts.client, blueprints = opts.blueprints;
        this.debug = debug;
        if (blueprints == null) {
          blueprints = this.constructor.BLUEPRINTS
        }
        if (client) {
          this.client = client
        } else {
          this.client = new this.constructor.CLIENT({
            debug: debug,
            endpoint: endpoint,
            key: key
          })
        }
        for (k in blueprints) {
          v = blueprints[k];
          this.addBlueprints(k, v)
        }
      }
      Api.prototype.addBlueprints = function (api, blueprints) {
        var bp, fn, name;
        if (this[api] == null) {
          this[api] = {}
        }
        fn = function (_this) {
          return function (name, bp) {
            var method;
            if (isFunction(bp)) {
              return _this[api][name] = function () {
                return bp.apply(_this, arguments)
              }
            }
            if (bp.expects == null) {
              bp.expects = statusOk
            }
            if (bp.method == null) {
              bp.method = 'POST'
            }
            method = function (data, cb) {
              return _this.client.request(bp, data).then(function (res) {
                var ref1, ref2;
                if (((ref1 = res.data) != null ? ref1.error : void 0) != null) {
                  throw newError(data, res)
                }
                if (!bp.expects(res)) {
                  throw newError(data, res)
                }
                if (bp.process != null) {
                  bp.process.call(_this, res)
                }
                return (ref2 = res.data) != null ? ref2 : res.body
              }).callback(cb)
            };
            return _this[api][name] = method
          }
        }(this);
        for (name in blueprints) {
          bp = blueprints[name];
          fn(name, bp)
        }
      };
      Api.prototype.setKey = function (key) {
        return this.client.setKey(key)
      };
      Api.prototype.setUserKey = function (key) {
        return this.client.setUserKey(key)
      };
      Api.prototype.deleteUserKey = function () {
        return this.client.deleteUserKey()
      };
      Api.prototype.setStore = function (id) {
        this.storeId = id;
        return this.client.setStore(id)
      };
      return Api
    }()
  });
  // source: src/utils.coffee
  require.define('./utils', function (module, exports, __dirname, __filename) {
    exports.isFunction = function (fn) {
      return typeof fn === 'function'
    };
    exports.isString = function (s) {
      return typeof s === 'string'
    };
    exports.statusOk = function (res) {
      return res.status === 200
    };
    exports.statusCreated = function (res) {
      return res.status === 201
    };
    exports.statusNoContent = function (res) {
      return res.status === 204
    };
    exports.newError = function (data, res) {
      var err, message, ref, ref1, ref2, ref3, ref4;
      if (res == null) {
        res = {}
      }
      message = (ref = res != null ? (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0 : void 0) != null ? ref : 'Request failed';
      err = new Error(message);
      err.message = message;
      err.req = data;
      err.data = res.data;
      err.responseText = res.data;
      err.status = res.status;
      err.type = (ref3 = res.data) != null ? (ref4 = ref3.error) != null ? ref4.type : void 0 : void 0;
      return err
    };
    exports.updateQuery = function (url, key, value) {
      var hash, re, separator;
      re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi');
      if (re.test(url)) {
        if (value != null) {
          return url.replace(re, '$1' + key + '=' + value + '$2$3')
        } else {
          hash = url.split('#');
          url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
          if (hash[1] != null) {
            url += '#' + hash[1]
          }
          return url
        }
      } else {
        if (value != null) {
          separator = url.indexOf('?') !== -1 ? '&' : '?';
          hash = url.split('#');
          url = hash[0] + separator + key + '=' + value;
          if (hash[1] != null) {
            url += '#' + hash[1]
          }
          return url
        } else {
          return url
        }
      }
    }
  });
  // source: src/client/xhr.coffee
  require.define('./client/xhr', function (module, exports, __dirname, __filename) {
    var Xhr, XhrClient, cookie, isFunction, newError, ref, updateQuery;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
    cookie = require('js-cookie/src/js.cookie');
    ref = require('./utils'), isFunction = ref.isFunction, newError = ref.newError, updateQuery = ref.updateQuery;
    module.exports = XhrClient = function () {
      XhrClient.prototype.debug = false;
      XhrClient.prototype.endpoint = 'https://api.crowdstart.com';
      XhrClient.prototype.sessionName = 'crwdst';
      function XhrClient(opts) {
        if (opts == null) {
          opts = {}
        }
        if (!(this instanceof XhrClient)) {
          return new XhrClient(opts)
        }
        this.key = opts.key, this.debug = opts.debug;
        if (opts.endpoint) {
          this.setEndpoint(opts.endpoint)
        }
        this.getUserKey()
      }
      XhrClient.prototype.setEndpoint = function (endpoint) {
        return this.endpoint = endpoint.replace(/\/$/, '')
      };
      XhrClient.prototype.setStore = function (id) {
        return this.storeId = id
      };
      XhrClient.prototype.setKey = function (key) {
        return this.key = key
      };
      XhrClient.prototype.getKey = function () {
        return this.userKey || this.key || this.constructor.KEY
      };
      XhrClient.prototype.getUserKey = function () {
        var session;
        if ((session = cookie.getJSON(this.sessionName)) != null) {
          if (session.userKey != null) {
            this.userKey = session.userKey
          }
        }
        return this.userKey
      };
      XhrClient.prototype.setUserKey = function (key) {
        cookie.set(this.sessionName, { userKey: key }, { expires: 7 * 24 * 3600 * 1000 });
        return this.userKey = key
      };
      XhrClient.prototype.deleteUserKey = function () {
        cookie.set(this.sessionName, { userKey: null }, { expires: 7 * 24 * 3600 * 1000 });
        return this.userKey
      };
      XhrClient.prototype.getUrl = function (url, data, key) {
        if (isFunction(url)) {
          url = url.call(this, data)
        }
        return updateQuery(this.endpoint + url, 'token', key)
      };
      XhrClient.prototype.request = function (blueprint, data, key) {
        var opts;
        if (key == null) {
          key = this.getKey()
        }
        opts = {
          url: this.getUrl(blueprint.url, data, key),
          method: blueprint.method,
          data: JSON.stringify(data)
        };
        if (this.debug) {
          void 0;
          void 0
        }
        return new Xhr().send(opts).then(function (res) {
          if (this.debug) {
            void 0;
            void 0
          }
          res.data = res.responseText;
          return res
        })['catch'](function (res) {
          var err, error, ref1;
          try {
            res.data = (ref1 = res.responseText) != null ? ref1 : JSON.parse(res.xhr.responseText)
          } catch (error) {
            err = error
          }
          err = newError(data, res);
          if (this.debug) {
            void 0;
            void 0;
            void 0
          }
          throw err
        })
      };
      return XhrClient
    }()
  });
  // source: node_modules/xhr-promise-es6/lib/index.js
  require.define('xhr-promise-es6/lib', function (module, exports, __dirname, __filename) {
    /*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/xhr-promise/blob/master/LICENSE
 */
    var ParseHeaders, XMLHttpRequestPromise, objectAssign;
    ParseHeaders = require('parse-headers/parse-headers');
    objectAssign = require('object-assign');
    /*
 * Module to wrap an XMLHttpRequest in a promise.
 */
    module.exports = XMLHttpRequestPromise = function () {
      function XMLHttpRequestPromise() {
      }
      XMLHttpRequestPromise.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';
      XMLHttpRequestPromise.Promise = global.Promise;
      /*
   * XMLHttpRequestPromise.send(options) -> Promise
   * - options (Object): URL, method, data, etc.
   *
   * Create the XHR object and wire up event handlers to use a promise.
   */
      XMLHttpRequestPromise.prototype.send = function (options) {
        var defaults;
        if (options == null) {
          options = {}
        }
        defaults = {
          method: 'GET',
          data: null,
          headers: {},
          async: true,
          username: null,
          password: null
        };
        options = objectAssign({}, defaults, options);
        return new this.constructor.Promise(function (_this) {
          return function (resolve, reject) {
            var e, header, ref, value, xhr;
            if (!XMLHttpRequest) {
              _this._handleError('browser', reject, null, "browser doesn't support XMLHttpRequest");
              return
            }
            if (typeof options.url !== 'string' || options.url.length === 0) {
              _this._handleError('url', reject, null, 'URL is a required parameter');
              return
            }
            _this._xhr = xhr = new XMLHttpRequest;
            xhr.onload = function () {
              var responseText;
              _this._detachWindowUnload();
              try {
                responseText = _this._getResponseText()
              } catch (_error) {
                _this._handleError('parse', reject, null, 'invalid JSON response');
                return
              }
              return resolve({
                url: _this._getResponseUrl(),
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: responseText,
                headers: _this._getHeaders(),
                xhr: xhr
              })
            };
            xhr.onerror = function () {
              return _this._handleError('error', reject)
            };
            xhr.ontimeout = function () {
              return _this._handleError('timeout', reject)
            };
            xhr.onabort = function () {
              return _this._handleError('abort', reject)
            };
            _this._attachWindowUnload();
            xhr.open(options.method, options.url, options.async, options.username, options.password);
            if (options.data != null && !options.headers['Content-Type']) {
              options.headers['Content-Type'] = _this.constructor.DEFAULT_CONTENT_TYPE
            }
            ref = options.headers;
            for (header in ref) {
              value = ref[header];
              xhr.setRequestHeader(header, value)
            }
            try {
              return xhr.send(options.data)
            } catch (_error) {
              e = _error;
              return _this._handleError('send', reject, null, e.toString())
            }
          }
        }(this))
      };
      /*
   * XMLHttpRequestPromise.getXHR() -> XMLHttpRequest
   */
      XMLHttpRequestPromise.prototype.getXHR = function () {
        return this._xhr
      };
      /*
   * XMLHttpRequestPromise._attachWindowUnload()
   *
   * Fix for IE 9 and IE 10
   * Internet Explorer freezes when you close a webpage during an XHR request
   * https://support.microsoft.com/kb/2856746
   *
   */
      XMLHttpRequestPromise.prototype._attachWindowUnload = function () {
        this._unloadHandler = this._handleWindowUnload.bind(this);
        if (window.attachEvent) {
          return window.attachEvent('onunload', this._unloadHandler)
        }
      };
      /*
   * XMLHttpRequestPromise._detachWindowUnload()
   */
      XMLHttpRequestPromise.prototype._detachWindowUnload = function () {
        if (window.detachEvent) {
          return window.detachEvent('onunload', this._unloadHandler)
        }
      };
      /*
   * XMLHttpRequestPromise._getHeaders() -> Object
   */
      XMLHttpRequestPromise.prototype._getHeaders = function () {
        return ParseHeaders(this._xhr.getAllResponseHeaders())
      };
      /*
   * XMLHttpRequestPromise._getResponseText() -> Mixed
   *
   * Parses response text JSON if present.
   */
      XMLHttpRequestPromise.prototype._getResponseText = function () {
        var responseText;
        responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
        switch (this._xhr.getResponseHeader('Content-Type')) {
        case 'application/json':
        case 'text/javascript':
          responseText = JSON.parse(responseText + '')
        }
        return responseText
      };
      /*
   * XMLHttpRequestPromise._getResponseUrl() -> String
   *
   * Actual response URL after following redirects.
   */
      XMLHttpRequestPromise.prototype._getResponseUrl = function () {
        if (this._xhr.responseURL != null) {
          return this._xhr.responseURL
        }
        if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
          return this._xhr.getResponseHeader('X-Request-URL')
        }
        return ''
      };
      /*
   * XMLHttpRequestPromise._handleError(reason, reject, status, statusText)
   * - reason (String)
   * - reject (Function)
   * - status (String)
   * - statusText (String)
   */
      XMLHttpRequestPromise.prototype._handleError = function (reason, reject, status, statusText) {
        this._detachWindowUnload();
        return reject({
          reason: reason,
          status: status || this._xhr.status,
          statusText: statusText || this._xhr.statusText,
          xhr: this._xhr
        })
      };
      /*
   * XMLHttpRequestPromise._handleWindowUnload()
   */
      XMLHttpRequestPromise.prototype._handleWindowUnload = function () {
        return this._xhr.abort()
      };
      return XMLHttpRequestPromise
    }()
  });
  // source: node_modules/parse-headers/parse-headers.js
  require.define('parse-headers/parse-headers', function (module, exports, __dirname, __filename) {
    var trim = require('trim'), forEach = require('for-each'), isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]'
      };
    module.exports = function (headers) {
      if (!headers)
        return {};
      var result = {};
      forEach(trim(headers).split('\n'), function (row) {
        var index = row.indexOf(':'), key = trim(row.slice(0, index)).toLowerCase(), value = trim(row.slice(index + 1));
        if (typeof result[key] === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [
            result[key],
            value
          ]
        }
      });
      return result
    }
  });
  // source: node_modules/trim/index.js
  require.define('trim', function (module, exports, __dirname, __filename) {
    exports = module.exports = trim;
    function trim(str) {
      return str.replace(/^\s*|\s*$/g, '')
    }
    exports.left = function (str) {
      return str.replace(/^\s*/, '')
    };
    exports.right = function (str) {
      return str.replace(/\s*$/, '')
    }
  });
  // source: node_modules/for-each/index.js
  require.define('for-each', function (module, exports, __dirname, __filename) {
    var isFunction = require('is-function');
    module.exports = forEach;
    var toString = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function forEach(list, iterator, context) {
      if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
      }
      if (arguments.length < 3) {
        context = this
      }
      if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context);
      else if (typeof list === 'string')
        forEachString(list, iterator, context);
      else
        forEachObject(list, iterator, context)
    }
    function forEachArray(array, iterator, context) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
          iterator.call(context, array[i], i, array)
        }
      }
    }
    function forEachString(string, iterator, context) {
      for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
      }
    }
    function forEachObject(object, iterator, context) {
      for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
          iterator.call(context, object[k], k, object)
        }
      }
    }
  });
  // source: node_modules/is-function/index.js
  require.define('is-function', function (module, exports, __dirname, __filename) {
    module.exports = isFunction;
    var toString = Object.prototype.toString;
    function isFunction(fn) {
      var string = toString.call(fn);
      return string === '[object Function]' || typeof fn === 'function' && string !== '[object RegExp]' || typeof window !== 'undefined' && (fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt)
    }
    ;
  });
  // source: node_modules/object-assign/index.js
  require.define('object-assign', function (module, exports, __dirname, __filename) {
    /* eslint-disable no-unused-vars */
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined')
      }
      return Object(val)
    }
    module.exports = Object.assign || function (target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key]
          }
        }
        if (Object.getOwnPropertySymbols) {
          symbols = Object.getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]]
            }
          }
        }
      }
      return to
    }
  });
  // source: node_modules/broken/lib/index.js
  require.define('broken/lib', function (module, exports, __dirname, __filename) {
    // Generated by CoffeeScript 1.10.0
    var Promise, PromiseInspection;
    Promise = require('zousan/zousan-min');
    Promise.suppressUncaughtRejectionError = true;
    PromiseInspection = function () {
      function PromiseInspection(arg) {
        this.state = arg.state, this.value = arg.value, this.reason = arg.reason
      }
      PromiseInspection.prototype.isFulfilled = function () {
        return this.state === 'fulfilled'
      };
      PromiseInspection.prototype.isRejected = function () {
        return this.state === 'rejected'
      };
      return PromiseInspection
    }();
    Promise.reflect = function (promise) {
      return new Promise(function (resolve, reject) {
        return promise.then(function (value) {
          return resolve(new PromiseInspection({
            state: 'fulfilled',
            value: value
          }))
        })['catch'](function (err) {
          return resolve(new PromiseInspection({
            state: 'rejected',
            reason: err
          }))
        })
      })
    };
    Promise.settle = function (promises) {
      return Promise.all(promises.map(Promise.reflect))
    };
    Promise.prototype.callback = function (cb) {
      if (typeof cb === 'function') {
        this.then(function (value) {
          return cb(null, value)
        });
        this['catch'](function (error) {
          return cb(error, null)
        })
      }
      return this
    };
    module.exports = Promise  //# sourceMappingURL=index.js.map
  });
  // source: node_modules/zousan/zousan-min.js
  require.define('zousan/zousan-min', function (module, exports, __dirname, __filename) {
    !function (t) {
      'use strict';
      function e(t) {
        if (t) {
          var e = this;
          t(function (t) {
            e.resolve(t)
          }, function (t) {
            e.reject(t)
          })
        }
      }
      function n(t, e) {
        if ('function' == typeof t.y)
          try {
            var n = t.y.call(i, e);
            t.p.resolve(n)
          } catch (o) {
            t.p.reject(o)
          }
        else
          t.p.resolve(e)
      }
      function o(t, e) {
        if ('function' == typeof t.n)
          try {
            var n = t.n.call(i, e);
            t.p.resolve(n)
          } catch (o) {
            t.p.reject(o)
          }
        else
          t.p.reject(e)
      }
      var r, i, c = 'fulfilled', u = 'rejected', s = 'undefined', f = function () {
          function t() {
            for (; e.length - n;)
              e[n](), n++, n == o && (e.splice(0, o), n = 0)
          }
          var e = [], n = 0, o = 1024, r = function () {
              if (typeof MutationObserver !== s) {
                var e = document.createElement('div'), n = new MutationObserver(t);
                return n.observe(e, { attributes: !0 }), function () {
                  e.setAttribute('a', 0)
                }
              }
              return typeof setImmediate !== s ? function () {
                setImmediate(t)
              } : function () {
                setTimeout(t, 0)
              }
            }();
          return function (t) {
            e.push(t), e.length - n == 1 && r()
          }
        }();
      e.prototype = {
        resolve: function (t) {
          if (this.state === r) {
            if (t === this)
              return this.reject(new TypeError('Attempt to resolve promise with self'));
            var e = this;
            if (t && ('function' == typeof t || 'object' == typeof t))
              try {
                var o = !0, i = t.then;
                if ('function' == typeof i)
                  return void i.call(t, function (t) {
                    o && (o = !1, e.resolve(t))
                  }, function (t) {
                    o && (o = !1, e.reject(t))
                  })
              } catch (u) {
                return void (o && this.reject(u))
              }
            this.state = c, this.v = t, e.c && f(function () {
              for (var o = 0, r = e.c.length; r > o; o++)
                n(e.c[o], t)
            })
          }
        },
        reject: function (t) {
          if (this.state === r) {
            this.state = u, this.v = t;
            var n = this.c;
            n ? f(function () {
              for (var e = 0, r = n.length; r > e; e++)
                o(n[e], t)
            }) : e.suppressUncaughtRejectionError || void 0
          }
        },
        then: function (t, i) {
          var u = new e, s = {
              y: t,
              n: i,
              p: u
            };
          if (this.state === r)
            this.c ? this.c.push(s) : this.c = [s];
          else {
            var l = this.state, a = this.v;
            f(function () {
              l === c ? n(s, a) : o(s, a)
            })
          }
          return u
        },
        'catch': function (t) {
          return this.then(null, t)
        },
        'finally': function (t) {
          return this.then(t, t)
        },
        timeout: function (t, n) {
          n = n || 'Timeout';
          var o = this;
          return new e(function (e, r) {
            setTimeout(function () {
              r(Error(n))
            }, t), o.then(function (t) {
              e(t)
            }, function (t) {
              r(t)
            })
          })
        }
      }, e.resolve = function (t) {
        var n = new e;
        return n.resolve(t), n
      }, e.reject = function (t) {
        var n = new e;
        return n.reject(t), n
      }, e.all = function (t) {
        function n(n, c) {
          'function' != typeof n.then && (n = e.resolve(n)), n.then(function (e) {
            o[c] = e, r++, r == t.length && i.resolve(o)
          }, function (t) {
            i.reject(t)
          })
        }
        for (var o = [], r = 0, i = new e, c = 0; c < t.length; c++)
          n(t[c], c);
        return t.length || i.resolve(o), i
      }, typeof module != s && module.exports && (module.exports = e), t.Zousan = e, e.soon = f
    }('undefined' != typeof global ? global : this)
  });
  // source: node_modules/js-cookie/src/js.cookie.js
  require.define('js-cookie/src/js.cookie', function (module, exports, __dirname, __filename) {
    /*!
 * JavaScript Cookie v2.1.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
    (function (factory) {
      if (typeof define === 'function' && define.amd) {
        define(factory)
      } else if (typeof exports === 'object') {
        module.exports = factory()
      } else {
        var _OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
          window.Cookies = _OldCookies;
          return api
        }
      }
    }(function () {
      function extend() {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
          var attributes = arguments[i];
          for (var key in attributes) {
            result[key] = attributes[key]
          }
        }
        return result
      }
      function init(converter) {
        function api(key, value, attributes) {
          var result;
          // Write
          if (arguments.length > 1) {
            attributes = extend({ path: '/' }, api.defaults, attributes);
            if (typeof attributes.expires === 'number') {
              var expires = new Date;
              expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 86400000);
              attributes.expires = expires
            }
            try {
              result = JSON.stringify(value);
              if (/^[\{\[]/.test(result)) {
                value = result
              }
            } catch (e) {
            }
            if (!converter.write) {
              value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent)
            } else {
              value = converter.write(value, key)
            }
            key = encodeURIComponent(String(key));
            key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
            key = key.replace(/[\(\)]/g, escape);
            return document.cookie = [
              key,
              '=',
              value,
              attributes.expires && '; expires=' + attributes.expires.toUTCString(),
              // use expires attribute, max-age is not supported by IE
              attributes.path && '; path=' + attributes.path,
              attributes.domain && '; domain=' + attributes.domain,
              attributes.secure ? '; secure' : ''
            ].join('')
          }
          // Read
          if (!key) {
            result = {}
          }
          // To prevent the for loop in the first place assign an empty array
          // in case there are no cookies at all. Also prevents odd result when
          // calling "get()"
          var cookies = document.cookie ? document.cookie.split('; ') : [];
          var rdecode = /(%[0-9A-Z]{2})+/g;
          var i = 0;
          for (; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            var name = parts[0].replace(rdecode, decodeURIComponent);
            var cookie = parts.slice(1).join('=');
            if (cookie.charAt(0) === '"') {
              cookie = cookie.slice(1, -1)
            }
            try {
              cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);
              if (this.json) {
                try {
                  cookie = JSON.parse(cookie)
                } catch (e) {
                }
              }
              if (key === name) {
                result = cookie;
                break
              }
              if (!key) {
                result[name] = cookie
              }
            } catch (e) {
            }
          }
          return result
        }
        api.get = api.set = api;
        api.getJSON = function () {
          return api.apply({ json: true }, [].slice.call(arguments))
        };
        api.defaults = {};
        api.remove = function (key, attributes) {
          api(key, '', extend(attributes, { expires: -1 }))
        };
        api.withConverter = init;
        return api
      }
      return init(function () {
      })
    }))
  });
  // source: src/blueprints/browser.coffee
  require.define('./blueprints/browser', function (module, exports, __dirname, __filename) {
    var blueprints, byId, createBlueprint, fn, i, isFunction, len, model, models, ref, ref1, statusCreated, statusNoContent, statusOk, storePrefixed, userModels;
    ref = require('./utils'), isFunction = ref.isFunction, statusCreated = ref.statusCreated, statusNoContent = ref.statusNoContent, statusOk = ref.statusOk;
    ref1 = require('./blueprints/url'), byId = ref1.byId, storePrefixed = ref1.storePrefixed;
    createBlueprint = function (name) {
      var endpoint;
      endpoint = '/' + name;
      return {
        list: {
          url: endpoint,
          method: 'GET'
        },
        get: {
          url: byId(name),
          method: 'GET'
        }
      }
    };
    blueprints = {
      account: {
        get: {
          url: '/account',
          method: 'GET'
        },
        update: {
          url: '/account',
          method: 'PATCH'
        },
        exists: {
          url: function (x) {
            var ref2, ref3, ref4;
            return '/account/exists/' + ((ref2 = (ref3 = (ref4 = x.email) != null ? ref4 : x.username) != null ? ref3 : x.id) != null ? ref2 : x)
          },
          method: 'GET',
          process: function (res) {
            return res.data.exists
          }
        },
        create: {
          url: '/account/create',
          expects: statusCreated
        },
        enable: {
          url: function (x) {
            var ref2;
            return '/account/enable/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          }
        },
        login: {
          url: '/account/login',
          process: function (res) {
            this.setUserKey(res.data.token);
            return res
          }
        },
        logout: function () {
          return this.deleteUserKey()
        },
        reset: { url: '/account/reset' },
        confirm: {
          url: function (x) {
            var ref2;
            return '/account/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          }
        }
      },
      checkout: {
        authorize: { url: storePrefixed('/checkout/authorize') },
        capture: {
          url: storePrefixed(function (x) {
            var ref2;
            return '/checkout/capture/' + ((ref2 = x.orderId) != null ? ref2 : x)
          })
        },
        charge: { url: storePrefixed('/checkout/charge') },
        paypal: { url: storePrefixed('/checkout/paypal') }
      },
      referrer: {
        create: {
          url: '/referrer',
          expects: statusCreated
        }
      }
    };
    models = [
      'collection',
      'coupon',
      'product',
      'variant'
    ];
    userModels = [
      'order',
      'subscription'
    ];
    fn = function (model) {
      return blueprints[model] = createBlueprint(model)
    };
    for (i = 0, len = models.length; i < len; i++) {
      model = models[i];
      fn(model)
    }
    module.exports = blueprints
  });
  // source: src/blueprints/url.coffee
  require.define('./blueprints/url', function (module, exports, __dirname, __filename) {
    var isFunction, sp;
    isFunction = require('./utils').isFunction;
    exports.storePrefixed = sp = function (u) {
      return function (x) {
        var url;
        if (isFunction(u)) {
          url = u(x)
        } else {
          url = u
        }
        if (this.storeId != null) {
          return '/store/' + this.storeId + url
        } else {
          return url
        }
      }
    };
    exports.byId = function (name) {
      switch (name) {
      case 'coupon':
        return sp(function (x) {
          var ref;
          return '/coupon/' + ((ref = x.code) != null ? ref : x)
        });
      case 'collection':
        return sp(function (x) {
          var ref;
          return '/collection/' + ((ref = x.slug) != null ? ref : x)
        });
      case 'product':
        return sp(function (x) {
          var ref, ref1;
          return '/product/' + ((ref = (ref1 = x.id) != null ? ref1 : x.slug) != null ? ref : x)
        });
      case 'variant':
        return sp(function (x) {
          var ref, ref1;
          return '/variant/' + ((ref = (ref1 = x.id) != null ? ref1 : x.sku) != null ? ref : x)
        });
      case 'site':
        return function (x) {
          var ref, ref1;
          return '/site/' + ((ref = (ref1 = x.id) != null ? ref1 : x.name) != null ? ref : x)
        };
      default:
        return function (x) {
          var ref;
          return '/' + name + '/' + ((ref = x.id) != null ? ref : x)
        }
      }
    }
  });
  // source: src/browser.coffee
  require.define('./browser', function (module, exports, __dirname, __filename) {
    var Api, Client;
    if (global.Crowdstart == null) {
      global.Crowdstart = {}
    }
    Api = require('./api');
    Client = require('./client/xhr');
    Api.CLIENT = Client;
    Api.BLUEPRINTS = require('./blueprints/browser');
    Crowdstart.Api = Api;
    Crowdstart.Client = Client;
    module.exports = Crowdstart
  });
  require('./browser')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsIm5vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsImJsdWVwcmludHMvYnJvd3Nlci5jb2ZmZWUiLCJibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJpc0Z1bmN0aW9uIiwiaXNTdHJpbmciLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJjb25zdHJ1Y3RvciIsImFkZEJsdWVwcmludHMiLCJwcm90b3R5cGUiLCJhcGkiLCJicCIsImZuIiwibmFtZSIsIl90aGlzIiwibWV0aG9kIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJleHBlY3RzIiwiZGF0YSIsImNiIiwicmVxdWVzdCIsInRoZW4iLCJyZXMiLCJyZWYxIiwicmVmMiIsImVycm9yIiwicHJvY2VzcyIsImNhbGwiLCJib2R5IiwiY2FsbGJhY2siLCJzZXRLZXkiLCJzZXRVc2VyS2V5IiwiZGVsZXRlVXNlcktleSIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMyIsInJlZjQiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJ1cGRhdGVRdWVyeSIsInVybCIsInZhbHVlIiwiaGFzaCIsInJlIiwic2VwYXJhdG9yIiwiUmVnRXhwIiwidGVzdCIsInJlcGxhY2UiLCJzcGxpdCIsImluZGV4T2YiLCJYaHIiLCJYaHJDbGllbnQiLCJjb29raWUiLCJQcm9taXNlIiwic2Vzc2lvbk5hbWUiLCJzZXRFbmRwb2ludCIsImdldFVzZXJLZXkiLCJnZXRLZXkiLCJ1c2VyS2V5IiwiS0VZIiwic2Vzc2lvbiIsImdldEpTT04iLCJzZXQiLCJleHBpcmVzIiwiZ2V0VXJsIiwiYmx1ZXByaW50IiwiSlNPTiIsInN0cmluZ2lmeSIsImNvbnNvbGUiLCJsb2ciLCJzZW5kIiwicGFyc2UiLCJ4aHIiLCJQYXJzZUhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdFByb21pc2UiLCJvYmplY3RBc3NpZ24iLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsImdsb2JhbCIsIm9wdGlvbnMiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJhc3luYyIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJyZXNvbHZlIiwicmVqZWN0IiwiZSIsImhlYWRlciIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwibGVuZ3RoIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJ0b1N0cmluZyIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImJpbmQiLCJ3aW5kb3ciLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJyZXNwb25zZVVSTCIsInJlYXNvbiIsImFib3J0IiwidHJpbSIsImZvckVhY2giLCJpc0FycmF5IiwiYXJnIiwiT2JqZWN0IiwicmVzdWx0Iiwicm93IiwiaW5kZXgiLCJzbGljZSIsInRvTG93ZXJDYXNlIiwicHVzaCIsInN0ciIsImxlZnQiLCJyaWdodCIsImhhc093blByb3BlcnR5IiwibGlzdCIsIml0ZXJhdG9yIiwiY29udGV4dCIsIlR5cGVFcnJvciIsImZvckVhY2hBcnJheSIsImZvckVhY2hTdHJpbmciLCJmb3JFYWNoT2JqZWN0IiwiYXJyYXkiLCJpIiwibGVuIiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0Iiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsInByb3BJc0VudW1lcmFibGUiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInRvT2JqZWN0IiwidmFsIiwidW5kZWZpbmVkIiwiYXNzaWduIiwidGFyZ2V0Iiwic291cmNlIiwiZnJvbSIsInRvIiwic3ltYm9scyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwicCIsIm8iLCJyIiwiYyIsInUiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwic2V0QXR0cmlidXRlIiwic2V0SW1tZWRpYXRlIiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIl9PbGRDb29raWVzIiwiQ29va2llcyIsIm5vQ29uZmxpY3QiLCJleHRlbmQiLCJpbml0IiwiY29udmVydGVyIiwicGF0aCIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJ3cml0ZSIsImVuY29kZVVSSUNvbXBvbmVudCIsIlN0cmluZyIsImRlY29kZVVSSUNvbXBvbmVudCIsImVzY2FwZSIsInRvVVRDU3RyaW5nIiwiZG9tYWluIiwic2VjdXJlIiwiam9pbiIsImNvb2tpZXMiLCJyZGVjb2RlIiwicGFydHMiLCJyZWFkIiwianNvbiIsImdldCIsInJlbW92ZSIsIndpdGhDb252ZXJ0ZXIiLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwidXNlck1vZGVscyIsImFjY291bnQiLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJlbmFibGUiLCJ0b2tlbklkIiwibG9naW4iLCJ0b2tlbiIsImxvZ291dCIsInJlc2V0IiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJjYXB0dXJlIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsInJlZmVycmVyIiwic3AiLCJjb2RlIiwic2x1ZyIsInNrdSIsIkNsaWVudCIsIkNyb3dkc3RhcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLEdBQUosRUFBU0MsVUFBVCxFQUFxQkMsUUFBckIsRUFBK0JDLFFBQS9CLEVBQXlDQyxHQUF6QyxFQUE4Q0MsUUFBOUMsQztJQUVBRCxHQUFBLEdBQU1FLE9BQUEsQ0FBUSxTQUFSLENBQU4sRUFBMEJMLFVBQUEsR0FBYUcsR0FBQSxDQUFJSCxVQUEzQyxFQUF1REMsUUFBQSxHQUFXRSxHQUFBLENBQUlGLFFBQXRF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