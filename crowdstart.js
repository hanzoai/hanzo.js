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
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
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
  // define asynchrons module
  require.async = function (url, fn) {
    require.modules[url] = fn;
    while (cb = require.waiting[url].shift())
      cb(require(url))
  };
  // Load module asynchronously
  require.load = function (url, cb) {
    var script = document.createElement('script'), existing = document.getElementsByTagName('script')[0], callbacks = require.waiting[url] = require.waiting[url] || [];
    // we'll be called when asynchronously defined.
    callbacks.push(cb);
    // load module
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
      XMLHttpRequestPromise.Promise = Promise;
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
              e[n](), n++, n > 1024 && (e.splice(0, n), n = 0)
          }
          var e = [], n = 0, o = function () {
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
            e.push(t), e.length - n == 1 && o()
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
 * JavaScript Cookie v2.0.4
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
            value = encodeURIComponent(String(value));
            value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
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
              cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);
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
      return init()
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsIm5vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsImJsdWVwcmludHMvYnJvd3Nlci5jb2ZmZWUiLCJibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJpc0Z1bmN0aW9uIiwiaXNTdHJpbmciLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJjb25zdHJ1Y3RvciIsImFkZEJsdWVwcmludHMiLCJwcm90b3R5cGUiLCJhcGkiLCJicCIsImZuIiwibmFtZSIsIl90aGlzIiwibWV0aG9kIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJleHBlY3RzIiwiZGF0YSIsImNiIiwicmVxdWVzdCIsInRoZW4iLCJyZXMiLCJyZWYxIiwicmVmMiIsImVycm9yIiwicHJvY2VzcyIsImNhbGwiLCJib2R5IiwiY2FsbGJhY2siLCJzZXRLZXkiLCJzZXRVc2VyS2V5IiwiZGVsZXRlVXNlcktleSIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMyIsInJlZjQiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJ1cGRhdGVRdWVyeSIsInVybCIsInZhbHVlIiwiaGFzaCIsInJlIiwic2VwYXJhdG9yIiwiUmVnRXhwIiwidGVzdCIsInJlcGxhY2UiLCJzcGxpdCIsImluZGV4T2YiLCJYaHIiLCJYaHJDbGllbnQiLCJjb29raWUiLCJQcm9taXNlIiwic2Vzc2lvbk5hbWUiLCJzZXRFbmRwb2ludCIsImdldFVzZXJLZXkiLCJnZXRLZXkiLCJ1c2VyS2V5IiwiS0VZIiwic2Vzc2lvbiIsImdldEpTT04iLCJzZXQiLCJleHBpcmVzIiwiZ2V0VXJsIiwiYmx1ZXByaW50IiwiSlNPTiIsInN0cmluZ2lmeSIsImNvbnNvbGUiLCJsb2ciLCJzZW5kIiwicGFyc2UiLCJ4aHIiLCJQYXJzZUhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdFByb21pc2UiLCJvYmplY3RBc3NpZ24iLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsIm9wdGlvbnMiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJhc3luYyIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJyZXNvbHZlIiwicmVqZWN0IiwiZSIsImhlYWRlciIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwibGVuZ3RoIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJ0b1N0cmluZyIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImJpbmQiLCJ3aW5kb3ciLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJyZXNwb25zZVVSTCIsInJlYXNvbiIsImFib3J0IiwidHJpbSIsImZvckVhY2giLCJpc0FycmF5IiwiYXJnIiwiT2JqZWN0IiwicmVzdWx0Iiwicm93IiwiaW5kZXgiLCJzbGljZSIsInRvTG93ZXJDYXNlIiwicHVzaCIsInN0ciIsImxlZnQiLCJyaWdodCIsImhhc093blByb3BlcnR5IiwibGlzdCIsIml0ZXJhdG9yIiwiY29udGV4dCIsIlR5cGVFcnJvciIsImZvckVhY2hBcnJheSIsImZvckVhY2hTdHJpbmciLCJmb3JFYWNoT2JqZWN0IiwiYXJyYXkiLCJpIiwibGVuIiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0Iiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsInByb3BJc0VudW1lcmFibGUiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInRvT2JqZWN0IiwidmFsIiwidW5kZWZpbmVkIiwiYXNzaWduIiwidGFyZ2V0Iiwic291cmNlIiwiZnJvbSIsInRvIiwic3ltYm9scyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwicCIsIm8iLCJyIiwiYyIsInUiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwic2V0QXR0cmlidXRlIiwic2V0SW1tZWRpYXRlIiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiZ2xvYmFsIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIl9PbGRDb29raWVzIiwiQ29va2llcyIsIm5vQ29uZmxpY3QiLCJleHRlbmQiLCJpbml0IiwiY29udmVydGVyIiwicGF0aCIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ0b1VUQ1N0cmluZyIsImRvbWFpbiIsInNlY3VyZSIsImpvaW4iLCJjb29raWVzIiwicmRlY29kZSIsInBhcnRzIiwianNvbiIsImdldCIsInJlbW92ZSIsIndpdGhDb252ZXJ0ZXIiLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwidXNlck1vZGVscyIsImFjY291bnQiLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJlbmFibGUiLCJ0b2tlbklkIiwibG9naW4iLCJ0b2tlbiIsImxvZ291dCIsInJlc2V0IiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJjYXB0dXJlIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsInJlZmVycmVyIiwic3AiLCJjb2RlIiwic2x1ZyIsInNrdSIsIkNsaWVudCIsIkNyb3dkc3RhcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxVQUFULEVBQXFCQyxRQUFyQixFQUErQkMsUUFBL0IsRUFBeUNDLEdBQXpDLEVBQThDQyxRQUE5QyxDO0lBRUFELEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdFLEdBQUEsQ0FBSUYsUUFBdEUsRUFBZ0ZDLFFBQUEsR0FB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