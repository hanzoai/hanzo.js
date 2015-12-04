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
  global.require = require;
  // source: src/api.coffee
  require.define('./api', function (module, exports, __dirname, __filename) {
    var Api, isFunction, isString, newError, ref, statusOk;
    ref = require('./utils'), isFunction = ref.isFunction, isString = ref.isString, newError = ref.newError, statusOk = ref.statusOk;
    module.exports = Api = function () {
      Api.BLUEPRINTS = {};
      Api.CLIENT = function () {
      };
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
      XhrClient.prototype.sessionName = 'crowdstart-session';
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
        var ref1, userKey;
        if (global.document != null && (ref1 = cookie.getJSON(this.sessionName), userKey = ref1.userKey, ref1) != null) {
          this.userKey = userKey
        }
        return this.userKey
      };
      XhrClient.prototype.setUserKey = function (key) {
        if (global.document != null) {
          cookie.set(this.sessionName, { userKey: key }, { expires: 7 * 24 * 3600 * 1000 })
        }
        return this.userKey = key
      };
      XhrClient.prototype.deleteUserKey = function () {
        if (global.document != null) {
          cookie.set(this.sessionName, { userKey: null }, { expires: 7 * 24 * 3600 * 1000 })
        }
        return this.userKey
      };
      XhrClient.prototype.getUrl = function (url, data, key) {
        if (isFunction(url)) {
          url = url.call(this, data)
        }
        return updateQuery('' + this.endpoint + url, 'token', key)
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
          console.log('--REQUEST--');
          console.log(opts)
        }
        return new Xhr().send(opts).then(function (res) {
          if (this.debug) {
            console.log('--RESPONSE--');
            console.log(res)
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
            console.log('--RESPONSE--');
            console.log(res);
            console.log('ERROR:', err)
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
    var ParseHeaders, XMLHttpRequestPromise;
    ParseHeaders = require('parse-headers/parse-headers');
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
        options = Object.assign({}, defaults, options);
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
            }) : e.suppressUncaughtRejectionError || console.log('You upset Zousan. Please catch rejections: ', t, t.stack)
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
    var blueprints, byId, createBlueprint, fn, i, isFunction, len, model, models, ref, ref1, statusCreated, statusNoContent, statusOk, storePrefixed;
    ref = require('./utils'), isFunction = ref.isFunction, statusCreated = ref.statusCreated, statusNoContent = ref.statusNoContent, statusOk = ref.statusOk;
    ref1 = require('./blueprints/url'), byId = ref1.byId, storePrefixed = ref1.storePrefixed;
    createBlueprint = function (name) {
      var endpoint;
      endpoint = '/' + name;
      return {
        list: {
          url: endpoint,
          method: 'GET',
          expects: statusOk
        },
        get: {
          url: byId(name),
          method: 'GET',
          expects: statusOk
        }
      }
    };
    blueprints = {
      account: {
        get: {
          url: '/account',
          method: 'GET',
          expects: statusOk
        },
        update: {
          url: '/account',
          method: 'PATCH',
          expects: statusOk
        },
        exists: {
          url: function (x) {
            var ref2, ref3, ref4;
            return '/account/exists/' + ((ref2 = (ref3 = (ref4 = x.email) != null ? ref4 : x.username) != null ? ref3 : x.id) != null ? ref2 : x)
          },
          method: 'GET',
          expects: statusOk,
          process: function (res) {
            return res.data.exists
          }
        },
        create: {
          url: '/account/create',
          method: 'POST',
          expects: statusCreated(x)
        },
        enable: {
          url: function (x) {
            var ref2;
            return '/account/enable/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          },
          method: 'GET',
          expects: statusOk
        },
        login: {
          url: '/account/login',
          method: 'POST',
          expects: statusOk,
          process: function (res) {
            this.setUserKey(res.data.token);
            return res
          }
        },
        logout: function () {
          return this.deleteUserKey()
        },
        reset: {
          url: '/account/reset/#{x.tokenId ? x}',
          method: 'POST',
          expects: statusOk
        },
        confirm: {
          url: function (x) {
            var ref2;
            return '/account/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          },
          method: 'POST',
          expects: statusOk
        }
      },
      checkout: {
        authorize: {
          url: storePrefixed('/authorize'),
          method: 'POST',
          expects: statusOk
        },
        capture: {
          url: storePrefixed(function (x) {
            var ref2;
            return '/capture/' + ((ref2 = x.orderId) != null ? ref2 : x)
          }),
          method: 'POST',
          expects: statusOk
        },
        charge: {
          url: storePrefixed('/charge'),
          method: 'POST',
          expects: statusOk
        },
        paypal: {
          url: storePrefixed('/paypal/pay'),
          method: 'POST',
          expects: statusOk
        }
      },
      referrer: {
        create: {
          url: '/referrer',
          method: 'POST',
          expects: statusCreated
        }
      }
    };
    models = [
      'coupon',
      'collection',
      'product',
      'variant'
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwiYmx1ZXByaW50cy91cmwuY29mZmVlIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsiQXBpIiwiaXNGdW5jdGlvbiIsImlzU3RyaW5nIiwibmV3RXJyb3IiLCJyZWYiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiQkxVRVBSSU5UUyIsIkNMSUVOVCIsIm9wdHMiLCJibHVlcHJpbnRzIiwiY2xpZW50IiwiZGVidWciLCJlbmRwb2ludCIsImsiLCJrZXkiLCJ2IiwiY29uc3RydWN0b3IiLCJhZGRCbHVlcHJpbnRzIiwicHJvdG90eXBlIiwiYXBpIiwiYnAiLCJmbiIsIm5hbWUiLCJfdGhpcyIsIm1ldGhvZCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZXhwZWN0cyIsImRhdGEiLCJjYiIsInJlcXVlc3QiLCJ0aGVuIiwicmVzIiwicmVmMSIsInJlZjIiLCJlcnJvciIsInByb2Nlc3MiLCJjYWxsIiwiYm9keSIsImNhbGxiYWNrIiwic2V0S2V5Iiwic2V0VXNlcktleSIsImRlbGV0ZVVzZXJLZXkiLCJzZXRTdG9yZSIsImlkIiwic3RvcmVJZCIsInMiLCJzdGF0dXMiLCJzdGF0dXNDcmVhdGVkIiwic3RhdHVzTm9Db250ZW50IiwiZXJyIiwibWVzc2FnZSIsInJlZjMiLCJyZWY0IiwiRXJyb3IiLCJyZXEiLCJyZXNwb25zZVRleHQiLCJ0eXBlIiwidXBkYXRlUXVlcnkiLCJ1cmwiLCJ2YWx1ZSIsImhhc2giLCJyZSIsInNlcGFyYXRvciIsIlJlZ0V4cCIsInRlc3QiLCJyZXBsYWNlIiwic3BsaXQiLCJpbmRleE9mIiwiWGhyIiwiWGhyQ2xpZW50IiwiY29va2llIiwiUHJvbWlzZSIsInNlc3Npb25OYW1lIiwic2V0RW5kcG9pbnQiLCJnZXRVc2VyS2V5IiwiZ2V0S2V5IiwidXNlcktleSIsIktFWSIsImdsb2JhbCIsImRvY3VtZW50IiwiZ2V0SlNPTiIsInNldCIsImV4cGlyZXMiLCJnZXRVcmwiLCJibHVlcHJpbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiY29uc29sZSIsImxvZyIsInNlbmQiLCJwYXJzZSIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwib3B0aW9ucyIsImRlZmF1bHRzIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsIk9iamVjdCIsImFzc2lnbiIsInJlc29sdmUiLCJyZWplY3QiLCJlIiwiaGVhZGVyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJsZW5ndGgiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInRvU3RyaW5nIiwiZ2V0WEhSIiwiX3VubG9hZEhhbmRsZXIiLCJfaGFuZGxlV2luZG93VW5sb2FkIiwiYmluZCIsIndpbmRvdyIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJnZXRSZXNwb25zZUhlYWRlciIsInJlc3BvbnNlVVJMIiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJhcmciLCJyZXN1bHQiLCJyb3ciLCJpbmRleCIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJwdXNoIiwic3RyIiwibGVmdCIsInJpZ2h0IiwiaGFzT3duUHJvcGVydHkiLCJsaXN0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiVHlwZUVycm9yIiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJhcnJheSIsImkiLCJsZW4iLCJzdHJpbmciLCJjaGFyQXQiLCJvYmplY3QiLCJzZXRUaW1lb3V0IiwiYWxlcnQiLCJjb25maXJtIiwicHJvbXB0IiwiUHJvbWlzZUluc3BlY3Rpb24iLCJzdXBwcmVzc1VuY2F1Z2h0UmVqZWN0aW9uRXJyb3IiLCJzdGF0ZSIsImlzRnVsZmlsbGVkIiwiaXNSZWplY3RlZCIsInJlZmxlY3QiLCJwcm9taXNlIiwic2V0dGxlIiwicHJvbWlzZXMiLCJhbGwiLCJtYXAiLCJ0IiwibiIsInkiLCJwIiwibyIsInIiLCJjIiwidSIsImYiLCJzcGxpY2UiLCJNdXRhdGlvbk9ic2VydmVyIiwiY3JlYXRlRWxlbWVudCIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwic2V0QXR0cmlidXRlIiwic2V0SW1tZWRpYXRlIiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIl9PbGRDb29raWVzIiwiQ29va2llcyIsIm5vQ29uZmxpY3QiLCJleHRlbmQiLCJpbml0IiwiY29udmVydGVyIiwicGF0aCIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ0b1VUQ1N0cmluZyIsImRvbWFpbiIsInNlY3VyZSIsImpvaW4iLCJjb29raWVzIiwicmRlY29kZSIsInBhcnRzIiwianNvbiIsImdldCIsInJlbW92ZSIsIndpdGhDb252ZXJ0ZXIiLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwiYWNjb3VudCIsInVwZGF0ZSIsImV4aXN0cyIsIngiLCJlbWFpbCIsImNyZWF0ZSIsImVuYWJsZSIsInRva2VuSWQiLCJsb2dpbiIsInRva2VuIiwibG9nb3V0IiwicmVzZXQiLCJjaGVja291dCIsImF1dGhvcml6ZSIsImNhcHR1cmUiLCJvcmRlcklkIiwiY2hhcmdlIiwicGF5cGFsIiwicmVmZXJyZXIiLCJzcCIsImNvZGUiLCJzbHVnIiwic2t1IiwiQ2xpZW50IiwiQ3Jvd2RzdGFydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxVQUFULEVBQXFCQyxRQUFyQixFQUErQkMsUUFBL0IsRUFBeUNDLEdBQXpDLEVBQThDQyxRQUE5QyxDO0lBRUFELEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdFLEdBQUEsQ0FBSUYsUUFBdEUsRUFBZ0ZDLFFBQUEsR0FBV0MsR0FBQSxDQUFJRCxRQUEvRixFQUF5R0UsUUFBQSxHQUFXRCxHQUFBLENBQUlDLFFBQXhILEM7SUFFQUUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCUixHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2pDQSxHQUFBLENBQUlTLFVBQUosR0FBaUIsRUFBakIsQ0FEaUM7QUFBQSxNQUdqQ1QsR0FBQSxDQUFJVSxNQUFKLEdBQWEsWUFBVztBQUFBLE9BQXhCLENBSGlDO0FBQUEsTUFL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