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
        this.getUserKey();
        void 0
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsIm5vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsImJsdWVwcmludHMvYnJvd3Nlci5jb2ZmZWUiLCJibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJpc0Z1bmN0aW9uIiwiaXNTdHJpbmciLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJjb25zdHJ1Y3RvciIsImFkZEJsdWVwcmludHMiLCJwcm90b3R5cGUiLCJhcGkiLCJicCIsImZuIiwibmFtZSIsIl90aGlzIiwibWV0aG9kIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJleHBlY3RzIiwiZGF0YSIsImNiIiwicmVxdWVzdCIsInRoZW4iLCJyZXMiLCJyZWYxIiwicmVmMiIsImVycm9yIiwicHJvY2VzcyIsImNhbGwiLCJib2R5IiwiY2FsbGJhY2siLCJzZXRLZXkiLCJzZXRVc2VyS2V5IiwiZGVsZXRlVXNlcktleSIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMyIsInJlZjQiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJ1cGRhdGVRdWVyeSIsInVybCIsInZhbHVlIiwiaGFzaCIsInJlIiwic2VwYXJhdG9yIiwiUmVnRXhwIiwidGVzdCIsInJlcGxhY2UiLCJzcGxpdCIsImluZGV4T2YiLCJYaHIiLCJYaHJDbGllbnQiLCJjb29raWUiLCJQcm9taXNlIiwic2Vzc2lvbk5hbWUiLCJzZXRFbmRwb2ludCIsImdldFVzZXJLZXkiLCJjb25zb2xlIiwibG9nIiwiZ2V0S2V5IiwidXNlcktleSIsIktFWSIsInNlc3Npb24iLCJnZXRKU09OIiwic2V0IiwiZXhwaXJlcyIsImdldFVybCIsImJsdWVwcmludCIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kIiwicGFyc2UiLCJ4aHIiLCJQYXJzZUhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdFByb21pc2UiLCJvYmplY3RBc3NpZ24iLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsIm9wdGlvbnMiLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJhc3luYyIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJyZXNvbHZlIiwicmVqZWN0IiwiZSIsImhlYWRlciIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwibGVuZ3RoIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJ0b1N0cmluZyIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImJpbmQiLCJ3aW5kb3ciLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJyZXNwb25zZVVSTCIsInJlYXNvbiIsImFib3J0IiwidHJpbSIsImZvckVhY2giLCJpc0FycmF5IiwiYXJnIiwiT2JqZWN0IiwicmVzdWx0Iiwicm93IiwiaW5kZXgiLCJzbGljZSIsInRvTG93ZXJDYXNlIiwicHVzaCIsInN0ciIsImxlZnQiLCJyaWdodCIsImhhc093blByb3BlcnR5IiwibGlzdCIsIml0ZXJhdG9yIiwiY29udGV4dCIsIlR5cGVFcnJvciIsImZvckVhY2hBcnJheSIsImZvckVhY2hTdHJpbmciLCJmb3JFYWNoT2JqZWN0IiwiYXJyYXkiLCJpIiwibGVuIiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0Iiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsInByb3BJc0VudW1lcmFibGUiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInRvT2JqZWN0IiwidmFsIiwidW5kZWZpbmVkIiwiYXNzaWduIiwidGFyZ2V0Iiwic291cmNlIiwiZnJvbSIsInRvIiwic3ltYm9scyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwicCIsIm8iLCJyIiwiYyIsInUiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwic2V0QXR0cmlidXRlIiwic2V0SW1tZWRpYXRlIiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiZ2xvYmFsIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIl9PbGRDb29raWVzIiwiQ29va2llcyIsIm5vQ29uZmxpY3QiLCJleHRlbmQiLCJpbml0IiwiY29udmVydGVyIiwicGF0aCIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ0b1VUQ1N0cmluZyIsImRvbWFpbiIsInNlY3VyZSIsImpvaW4iLCJjb29raWVzIiwicmRlY29kZSIsInBhcnRzIiwianNvbiIsImdldCIsInJlbW92ZSIsIndpdGhDb252ZXJ0ZXIiLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwidXNlck1vZGVscyIsImFjY291bnQiLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJlbmFibGUiLCJ0b2tlbklkIiwibG9naW4iLCJ0b2tlbiIsImxvZ291dCIsInJlc2V0IiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJjYXB0dXJlIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsInJlZmVycmVyIiwic3AiLCJjb2RlIiwic2x1ZyIsInNrdSIsIkNsaWVudCIsIkNyb3dkc3RhcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxVQUFULEVBQXFCQyxRQUFyQixFQUErQkMsUUFBL0IsRUFBeUNDLEdBQXpDLEVBQThDQyxRQUE5QyxDO0lBRUFELEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdFLEdBQUEsQ0FBSUYsUUFBdEUsRUFBZ0ZDLFFBQUEsR0FB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