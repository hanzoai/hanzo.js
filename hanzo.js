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
              var key;
              key = void 0;
              if (bp.useCustomerToken) {
                key = _this.client.getCustomerToken()
              }
              return _this.client.request(bp, data, key).then(function (res) {
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
      Api.prototype.setCustomerToken = function (key) {
        return this.client.setCustomerToken(key)
      };
      Api.prototype.deleteCustomerToken = function () {
        return this.client.deleteCustomerToken()
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
    var updateParam;
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
    updateParam = function (url, key, value) {
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
    };
    exports.updateQuery = function (url, data) {
      var k, v;
      for (k in data) {
        v = data[k];
        url = updateParam(url, k, v)
      }
      return url
    }
  });
  // source: src/client/xhr.coffee
  require.define('./client/xhr', function (module, exports, __dirname, __filename) {
    var Xhr, XhrClient, cookie, isFunction, newError, ref, updateQuery;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
    cookie = require('js-cookie');
    ref = require('../utils'), isFunction = ref.isFunction, newError = ref.newError, updateQuery = ref.updateQuery;
    module.exports = XhrClient = function () {
      XhrClient.prototype.debug = false;
      XhrClient.prototype.endpoint = 'https://api.hanzo.io';
      XhrClient.prototype.sessionName = 'hnzo';
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
        this.getCustomerToken()
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
        return this.key || this.constructor.KEY
      };
      XhrClient.prototype.getCustomerToken = function () {
        var session;
        if ((session = cookie.getJSON(this.sessionName)) != null) {
          if (session.customerToken != null) {
            this.customerToken = session.customerToken
          }
        }
        return this.customerToken
      };
      XhrClient.prototype.setCustomerToken = function (key) {
        cookie.set(this.sessionName, { customerToken: key }, { expires: 7 * 24 * 3600 * 1000 });
        return this.customerToken = key
      };
      XhrClient.prototype.deleteCustomerToken = function () {
        cookie.set(this.sessionName, { customerToken: null }, { expires: 7 * 24 * 3600 * 1000 });
        return this.customerToken = null
      };
      XhrClient.prototype.getUrl = function (url, data, key) {
        if (isFunction(url)) {
          url = url.call(this, data)
        }
        return updateQuery(this.endpoint + url, { token: key })
      };
      XhrClient.prototype.request = function (blueprint, data, key) {
        var opts;
        if (key == null) {
          key = this.getKey()
        }
        opts = {
          url: this.getUrl(blueprint.url, data, key),
          method: blueprint.method
        };
        if (blueprint.method === 'GET') {
          opts.url = updateQuery(opts.url, opts.data)
        } else {
          opts.data = JSON.stringify(data)
        }
        if (this.debug) {
          void 0;
          void 0;
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
          method: 'GET',
          useCustomerToken: true
        },
        update: {
          url: '/account',
          method: 'PATCH',
          useCustomerToken: true
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
            this.setCustomerToken(res.data.token);
            return res
          }
        },
        logout: function () {
          return this.deleteCustomerToken()
        },
        reset: {
          url: '/account/reset',
          useCustomerToken: true
        },
        confirm: {
          url: function (x) {
            var ref2;
            return '/account/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          },
          useCustomerToken: true
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
    if (global.Hanzo == null) {
      global.Hanzo = {}
    }
    Api = require('./api');
    Client = require('./client/xhr');
    Api.CLIENT = Client;
    Api.BLUEPRINTS = require('./blueprints/browser');
    Hanzo.Api = Api;
    Hanzo.Client = Client;
    module.exports = Hanzo
  });
  require('./browser')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsImJsdWVwcmludHMvYnJvd3Nlci5jb2ZmZWUiLCJibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJpc0Z1bmN0aW9uIiwiaXNTdHJpbmciLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJjb25zdHJ1Y3RvciIsImFkZEJsdWVwcmludHMiLCJwcm90b3R5cGUiLCJhcGkiLCJicCIsImZuIiwibmFtZSIsIl90aGlzIiwibWV0aG9kIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJleHBlY3RzIiwiZGF0YSIsImNiIiwidXNlQ3VzdG9tZXJUb2tlbiIsImdldEN1c3RvbWVyVG9rZW4iLCJyZXF1ZXN0IiwidGhlbiIsInJlcyIsInJlZjEiLCJyZWYyIiwiZXJyb3IiLCJwcm9jZXNzIiwiY2FsbCIsImJvZHkiLCJjYWxsYmFjayIsInNldEtleSIsInNldEN1c3RvbWVyVG9rZW4iLCJkZWxldGVDdXN0b21lclRva2VuIiwic2V0U3RvcmUiLCJpZCIsInN0b3JlSWQiLCJ1cGRhdGVQYXJhbSIsInMiLCJzdGF0dXMiLCJzdGF0dXNDcmVhdGVkIiwic3RhdHVzTm9Db250ZW50IiwiZXJyIiwibWVzc2FnZSIsInJlZjMiLCJyZWY0IiwiRXJyb3IiLCJyZXEiLCJyZXNwb25zZVRleHQiLCJ0eXBlIiwidXJsIiwidmFsdWUiLCJoYXNoIiwicmUiLCJzZXBhcmF0b3IiLCJSZWdFeHAiLCJ0ZXN0IiwicmVwbGFjZSIsInNwbGl0IiwiaW5kZXhPZiIsInVwZGF0ZVF1ZXJ5IiwiWGhyIiwiWGhyQ2xpZW50IiwiY29va2llIiwiUHJvbWlzZSIsInNlc3Npb25OYW1lIiwic2V0RW5kcG9pbnQiLCJnZXRLZXkiLCJLRVkiLCJzZXNzaW9uIiwiZ2V0SlNPTiIsImN1c3RvbWVyVG9rZW4iLCJzZXQiLCJleHBpcmVzIiwiZ2V0VXJsIiwidG9rZW4iLCJibHVlcHJpbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiY29uc29sZSIsImxvZyIsInNlbmQiLCJwYXJzZSIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIm9iamVjdEFzc2lnbiIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwiZ2xvYmFsIiwib3B0aW9ucyIsImRlZmF1bHRzIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInJlc29sdmUiLCJyZWplY3QiLCJlIiwiaGVhZGVyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJsZW5ndGgiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInRvU3RyaW5nIiwiZ2V0WEhSIiwiX3VubG9hZEhhbmRsZXIiLCJfaGFuZGxlV2luZG93VW5sb2FkIiwiYmluZCIsIndpbmRvdyIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJnZXRSZXNwb25zZUhlYWRlciIsInJlc3BvbnNlVVJMIiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJhcmciLCJPYmplY3QiLCJyZXN1bHQiLCJyb3ciLCJpbmRleCIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJwdXNoIiwic3RyIiwibGVmdCIsInJpZ2h0IiwiaGFzT3duUHJvcGVydHkiLCJsaXN0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiVHlwZUVycm9yIiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJhcnJheSIsImkiLCJsZW4iLCJzdHJpbmciLCJjaGFyQXQiLCJvYmplY3QiLCJzZXRUaW1lb3V0IiwiYWxlcnQiLCJjb25maXJtIiwicHJvbXB0IiwicHJvcElzRW51bWVyYWJsZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwidG9PYmplY3QiLCJ2YWwiLCJ1bmRlZmluZWQiLCJhc3NpZ24iLCJ0YXJnZXQiLCJzb3VyY2UiLCJmcm9tIiwidG8iLCJzeW1ib2xzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwiUHJvbWlzZUluc3BlY3Rpb24iLCJzdXBwcmVzc1VuY2F1Z2h0UmVqZWN0aW9uRXJyb3IiLCJzdGF0ZSIsImlzRnVsZmlsbGVkIiwiaXNSZWplY3RlZCIsInJlZmxlY3QiLCJwcm9taXNlIiwic2V0dGxlIiwicHJvbWlzZXMiLCJhbGwiLCJtYXAiLCJ0IiwibiIsInkiLCJwIiwibyIsInIiLCJjIiwidSIsImYiLCJzcGxpY2UiLCJNdXRhdGlvbk9ic2VydmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJzZXRBdHRyaWJ1dGUiLCJzZXRJbW1lZGlhdGUiLCJzdGFjayIsImwiLCJhIiwidGltZW91dCIsIlpvdXNhbiIsInNvb24iLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwidXNlck1vZGVscyIsImdldCIsImFjY291bnQiLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJlbmFibGUiLCJ0b2tlbklkIiwibG9naW4iLCJsb2dvdXQiLCJyZXNldCIsImNoZWNrb3V0IiwiYXV0aG9yaXplIiwiY2FwdHVyZSIsIm9yZGVySWQiLCJjaGFyZ2UiLCJwYXlwYWwiLCJyZWZlcnJlciIsInNwIiwiY29kZSIsInNsdWciLCJza3UiLCJDbGllbnQiLCJIYW56byJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxVQUFULEVBQXFCQyxRQUFyQixFQUErQkMsUUFBL0IsRUFBeUNDLEdBQXpDLEVBQThDQyxRQUE5QyxDO0lBRUFELEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdFLEdBQUEsQ0FBSUYsUUFBdEUsRUFBZ0ZDLFFBQUEsR0FBV0MsR0FBQSxDQUFJRCxRQUEvRixFQUF5R0UsUUFBQSxHQUFXRCxHQUFBLENBQUlDLFFBQXhILEM7SUFFQUUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCUixHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2pDQSxHQUFBLENBQUlTLFVBQUosR0FBaUIsRUFBakIsQ0FEaUM7QUFBQSxNQUdqQ1QsR0FBQSxDQUFJVSxNQUFKLEdBQWEsSUFBYixDQUhpQztBQUFBLE1BS2pDLFNBQVNWLEdBQVQsQ0FBYVcsSUFBYixFQUFtQjtBQUFBLFFBQ2pCLElBQUlDLFVBQUosRUFBZ0JDLE1BQWhCLEVBQXdCQyxLQUF4QixFQUErQkMsUUFB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