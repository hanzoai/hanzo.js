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
      Api.SESSION_NAME = 'crowdstart-session';
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
    }
  });
  // source: src/client/xhr.coffee
  require.define('./client/xhr', function (module, exports, __dirname, __filename) {
    var Xhr, XhrClient, cookie, isFunction, newError, ref;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
    cookie = require('js-cookie/src/js.cookie');
    ref = require('./utils'), isFunction = ref.isFunction, newError = ref.newError;
    module.exports = XhrClient = function () {
      XhrClient.prototype.debug = false;
      XhrClient.prototype.endpoint = 'https://api.crowdstart.com';
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
      XhrClient.prototype.setUserKey = function (key) {
        return this.userKey = cookie.set(this.constructor.SESSION_NAME, key, { expires: 604800 })
      };
      XhrClient.prototype.getKey = function () {
        return this.userKey || this.key || this.constructor.KEY
      };
      XhrClient.prototype.getUserKey = function () {
        var key;
        key = cookie.getJSON(this.constructor.SESSION_NAME);
        return this.setUserKey(key)
      };
      XhrClient.prototype.getUrl = function (url, data, key) {
        if (isFunction(url)) {
          url = url.call(this, data)
        }
        return '' + this.endpoint + url + '?token=' + key
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
          expects: function (x) {
            return statusOk(x) || statusCreated(x)
          }
        },
        createConfirm: {
          url: function (x) {
            var ref2;
            return '/account/create/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          },
          method: 'POST',
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
          return this.setUserKey('')
        },
        reset: {
          url: function (x) {
            var ref2;
            return '/account/reset?email=' + ((ref2 = x.email) != null ? ref2 : x)
          },
          method: 'POST',
          expects: statusOk
        },
        resetConfirm: {
          url: function (x) {
            var ref2;
            return '/account/reset/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwiYmx1ZXByaW50cy91cmwuY29mZmVlIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsiQXBpIiwiaXNGdW5jdGlvbiIsImlzU3RyaW5nIiwibmV3RXJyb3IiLCJyZWYiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiU0VTU0lPTl9OQU1FIiwiQkxVRVBSSU5UUyIsIkNMSUVOVCIsIm9wdHMiLCJibHVlcHJpbnRzIiwiY2xpZW50IiwiZGVidWciLCJlbmRwb2ludCIsImsiLCJrZXkiLCJ2IiwiY29uc3RydWN0b3IiLCJhZGRCbHVlcHJpbnRzIiwicHJvdG90eXBlIiwiYXBpIiwiYnAiLCJmbiIsIm5hbWUiLCJfdGhpcyIsIm1ldGhvZCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZXhwZWN0cyIsImRhdGEiLCJjYiIsInJlcXVlc3QiLCJ0aGVuIiwicmVzIiwicmVmMSIsInJlZjIiLCJlcnJvciIsInByb2Nlc3MiLCJjYWxsIiwiYm9keSIsImNhbGxiYWNrIiwic2V0S2V5Iiwic2V0VXNlcktleSIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMyIsInJlZjQiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJYaHIiLCJYaHJDbGllbnQiLCJjb29raWUiLCJQcm9taXNlIiwic2V0RW5kcG9pbnQiLCJnZXRVc2VyS2V5IiwicmVwbGFjZSIsInVzZXJLZXkiLCJzZXQiLCJleHBpcmVzIiwiZ2V0S2V5IiwiS0VZIiwiZ2V0SlNPTiIsImdldFVybCIsInVybCIsImJsdWVwcmludCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjb25zb2xlIiwibG9nIiwic2VuZCIsInBhcnNlIiwieGhyIiwiUGFyc2VIZWFkZXJzIiwiWE1MSHR0cFJlcXVlc3RQcm9taXNlIiwiREVGQVVMVF9DT05URU5UX1RZUEUiLCJvcHRpb25zIiwiZGVmYXVsdHMiLCJoZWFkZXJzIiwiYXN5bmMiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiT2JqZWN0IiwiYXNzaWduIiwicmVzb2x2ZSIsInJlamVjdCIsImUiLCJoZWFkZXIiLCJ2YWx1ZSIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwibGVuZ3RoIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJ0b1N0cmluZyIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImJpbmQiLCJ3aW5kb3ciLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJyZXNwb25zZVVSTCIsInRlc3QiLCJyZWFzb24iLCJhYm9ydCIsInRyaW0iLCJmb3JFYWNoIiwiaXNBcnJheSIsImFyZyIsInJlc3VsdCIsInNwbGl0Iiwicm93IiwiaW5kZXgiLCJpbmRleE9mIiwic2xpY2UiLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJzdHIiLCJsZWZ0IiwicmlnaHQiLCJoYXNPd25Qcm9wZXJ0eSIsImxpc3QiLCJpdGVyYXRvciIsImNvbnRleHQiLCJUeXBlRXJyb3IiLCJmb3JFYWNoQXJyYXkiLCJmb3JFYWNoU3RyaW5nIiwiZm9yRWFjaE9iamVjdCIsImFycmF5IiwiaSIsImxlbiIsInN0cmluZyIsImNoYXJBdCIsIm9iamVjdCIsInNldFRpbWVvdXQiLCJhbGVydCIsImNvbmZpcm0iLCJwcm9tcHQiLCJQcm9taXNlSW5zcGVjdGlvbiIsInN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciIsInN0YXRlIiwiaXNGdWxmaWxsZWQiLCJpc1JlamVjdGVkIiwicmVmbGVjdCIsInByb21pc2UiLCJzZXR0bGUiLCJwcm9taXNlcyIsImFsbCIsIm1hcCIsInQiLCJuIiwieSIsInAiLCJvIiwiciIsImMiLCJ1IiwiZiIsInNwbGljZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsInNldEF0dHJpYnV0ZSIsInNldEltbWVkaWF0ZSIsInN0YWNrIiwibCIsImEiLCJ0aW1lb3V0IiwiWm91c2FuIiwic29vbiIsImdsb2JhbCIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJfT2xkQ29va2llcyIsIkNvb2tpZXMiLCJub0NvbmZsaWN0IiwiZXh0ZW5kIiwiaW5pdCIsImNvbnZlcnRlciIsInBhdGgiLCJEYXRlIiwic2V0TWlsbGlzZWNvbmRzIiwiZ2V0TWlsbGlzZWNvbmRzIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiU3RyaW5nIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZXNjYXBlIiwidG9VVENTdHJpbmciLCJkb21haW4iLCJzZWN1cmUiLCJqb2luIiwiY29va2llcyIsInJkZWNvZGUiLCJwYXJ0cyIsImpzb24iLCJnZXQiLCJyZW1vdmUiLCJ3aXRoQ29udmVydGVyIiwiYnlJZCIsImNyZWF0ZUJsdWVwcmludCIsIm1vZGVsIiwibW9kZWxzIiwic3RvcmVQcmVmaXhlZCIsImFjY291bnQiLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJjcmVhdGVDb25maXJtIiwidG9rZW5JZCIsImxvZ2luIiwidG9rZW4iLCJsb2dvdXQiLCJyZXNldCIsInJlc2V0Q29uZmlybSIsImNoZWNrb3V0IiwiYXV0aG9yaXplIiwiY2FwdHVyZSIsIm9yZGVySWQiLCJjaGFyZ2UiLCJwYXlwYWwiLCJyZWZlcnJlciIsInNwIiwiY29kZSIsInNsdWciLCJza3UiLCJDbGllbnQiLCJDcm93ZHN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLFVBQVQsRUFBcUJDLFFBQXJCLEVBQStCQyxRQUEvQixFQUF5Q0MsR0FBekMsRUFBOENDLFFBQTlDLEM7SUFFQUQsR0FBQSxHQUFNRSxPQUFBLENBQVEsU0FBUixDQUFOLEVBQTBCTCxVQUFBLEdBQWFHLEdBQUEsQ0FBSUgsVUFBM0MsRUFBdURDLFFBQUEsR0FBV0UsR0FBQSxDQUFJRixRQUF0RSxFQUFnRkMsUUFBQSxHQUFXQyxHQUFBLENBQUlELFFBQS9GLEVBQXlHRSxRQUFBLEdBQVdELEdBQUEsQ0FBSUMsUUFBeEgsQztJQUVBRSxNQUFBLENBQU9DLE9BQVAsR0FBaUJSLEdBQUEsR0FBTyxZQUFXO0FBQUEsTUFDakNBLEdBQUEsQ0FBSVMsWUFBSixHQUFtQixvQkFBbkIsQ0FEaUM7QUFBQSxNQUdqQ1QsR0FBQSxDQUFJVSxVQUFKLEdBQWlCLEVBQWpCLENBSGlDO0FBQUEsTUFLakNWLEdBQUEsQ0FBSVcsTUFBSixHQUFhLFlBQVc7QUFBQSxPQUF4QixDQUxpQztB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