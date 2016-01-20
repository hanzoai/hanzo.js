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
              if (bp.userCustomerToken) {
                key = _this.getCustomerToken()
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsIm5vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsImJsdWVwcmludHMvYnJvd3Nlci5jb2ZmZWUiLCJibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJpc0Z1bmN0aW9uIiwiaXNTdHJpbmciLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJjb25zdHJ1Y3RvciIsImFkZEJsdWVwcmludHMiLCJwcm90b3R5cGUiLCJhcGkiLCJicCIsImZuIiwibmFtZSIsIl90aGlzIiwibWV0aG9kIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJleHBlY3RzIiwiZGF0YSIsImNiIiwidXNlckN1c3RvbWVyVG9rZW4iLCJnZXRDdXN0b21lclRva2VuIiwicmVxdWVzdCIsInRoZW4iLCJyZXMiLCJyZWYxIiwicmVmMiIsImVycm9yIiwicHJvY2VzcyIsImNhbGwiLCJib2R5IiwiY2FsbGJhY2siLCJzZXRLZXkiLCJzZXRDdXN0b21lclRva2VuIiwiZGVsZXRlQ3VzdG9tZXJUb2tlbiIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMyIsInJlZjQiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJ1cGRhdGVRdWVyeSIsInVybCIsInZhbHVlIiwiaGFzaCIsInJlIiwic2VwYXJhdG9yIiwiUmVnRXhwIiwidGVzdCIsInJlcGxhY2UiLCJzcGxpdCIsImluZGV4T2YiLCJYaHIiLCJYaHJDbGllbnQiLCJjb29raWUiLCJQcm9taXNlIiwic2Vzc2lvbk5hbWUiLCJzZXRFbmRwb2ludCIsImdldEtleSIsIktFWSIsInNlc3Npb24iLCJnZXRKU09OIiwiY3VzdG9tZXJUb2tlbiIsInNldCIsImV4cGlyZXMiLCJnZXRVcmwiLCJibHVlcHJpbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiY29uc29sZSIsImxvZyIsInNlbmQiLCJwYXJzZSIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIm9iamVjdEFzc2lnbiIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwiZ2xvYmFsIiwib3B0aW9ucyIsImRlZmF1bHRzIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInJlc29sdmUiLCJyZWplY3QiLCJlIiwiaGVhZGVyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJsZW5ndGgiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInRvU3RyaW5nIiwiZ2V0WEhSIiwiX3VubG9hZEhhbmRsZXIiLCJfaGFuZGxlV2luZG93VW5sb2FkIiwiYmluZCIsIndpbmRvdyIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJnZXRSZXNwb25zZUhlYWRlciIsInJlc3BvbnNlVVJMIiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJhcmciLCJPYmplY3QiLCJyZXN1bHQiLCJyb3ciLCJpbmRleCIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJwdXNoIiwic3RyIiwibGVmdCIsInJpZ2h0IiwiaGFzT3duUHJvcGVydHkiLCJsaXN0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiVHlwZUVycm9yIiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJhcnJheSIsImkiLCJsZW4iLCJzdHJpbmciLCJjaGFyQXQiLCJvYmplY3QiLCJzZXRUaW1lb3V0IiwiYWxlcnQiLCJjb25maXJtIiwicHJvbXB0IiwicHJvcElzRW51bWVyYWJsZSIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwidG9PYmplY3QiLCJ2YWwiLCJ1bmRlZmluZWQiLCJhc3NpZ24iLCJ0YXJnZXQiLCJzb3VyY2UiLCJmcm9tIiwidG8iLCJzeW1ib2xzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwiUHJvbWlzZUluc3BlY3Rpb24iLCJzdXBwcmVzc1VuY2F1Z2h0UmVqZWN0aW9uRXJyb3IiLCJzdGF0ZSIsImlzRnVsZmlsbGVkIiwiaXNSZWplY3RlZCIsInJlZmxlY3QiLCJwcm9taXNlIiwic2V0dGxlIiwicHJvbWlzZXMiLCJhbGwiLCJtYXAiLCJ0IiwibiIsInkiLCJwIiwibyIsInIiLCJjIiwidSIsImYiLCJzcGxpY2UiLCJNdXRhdGlvbk9ic2VydmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJzZXRBdHRyaWJ1dGUiLCJzZXRJbW1lZGlhdGUiLCJzdGFjayIsImwiLCJhIiwidGltZW91dCIsIlpvdXNhbiIsInNvb24iLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwiX09sZENvb2tpZXMiLCJDb29raWVzIiwibm9Db25mbGljdCIsImV4dGVuZCIsImluaXQiLCJjb252ZXJ0ZXIiLCJwYXRoIiwiRGF0ZSIsInNldE1pbGxpc2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsIndyaXRlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiU3RyaW5nIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZXNjYXBlIiwidG9VVENTdHJpbmciLCJkb21haW4iLCJzZWN1cmUiLCJqb2luIiwiY29va2llcyIsInJkZWNvZGUiLCJwYXJ0cyIsInJlYWQiLCJqc29uIiwiZ2V0IiwicmVtb3ZlIiwid2l0aENvbnZlcnRlciIsImJ5SWQiLCJjcmVhdGVCbHVlcHJpbnQiLCJtb2RlbCIsIm1vZGVscyIsInN0b3JlUHJlZml4ZWQiLCJ1c2VyTW9kZWxzIiwiYWNjb3VudCIsInVzZUN1c3RvbWVyVG9rZW4iLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJlbmFibGUiLCJ0b2tlbklkIiwibG9naW4iLCJ0b2tlbiIsImxvZ291dCIsInJlc2V0IiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJjYXB0dXJlIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsInJlZmVycmVyIiwic3AiLCJjb2RlIiwic2x1ZyIsInNrdSIsIkNsaWVudCIsIkhhbnpvIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLFVBQVQsRUFBcUJDLFFBQXJCLEVBQStCQyxRQUEvQixFQUF5Q0MsR0FBekMsRUFBOENDLFFBQTlDLEM7SUFFQUQsR0FBQSxHQUFNRSxPQUFBLENBQVEsU0FBUixDQUFOLEVBQTBCTCxVQUFB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