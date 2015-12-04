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
        if (global.document != null) {
          this.userKey = cookie.getJSON(this.sessionName).userKey
        }
        return this.userKey
      };
      XhrClient.prototype.setUserKey = function (key) {
        if (global.document != null) {
          cookie.set(this.sessionName, { userKey: key }, { expires: 604800 })
        }
        return this.userKey = key
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
          expects: function (x) {
            return statusOk(x) || statusCreated(x)
          }
        },
        createConfirm: {
          url: function (x) {
            var ref2;
            return '/account/create/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
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
          return this.setUserKey('')
        },
        reset: {
          url: function (x) {
            var ref2;
            return '/account/reset?email=' + ((ref2 = x.email) != null ? ref2 : x)
          }
        },
        resetConfirm: {
          url: function (x) {
            var ref2;
            return '/account/reset/confirm/' + ((ref2 = x.tokenId) != null ? ref2 : x)
          }
        }
      },
      checkout: {
        authorize: { url: storePrefixed('/authorize') },
        capture: {
          url: storePrefixed(function (x) {
            var ref2;
            return '/capture/' + ((ref2 = x.orderId) != null ? ref2 : x)
          })
        },
        charge: { url: storePrefixed('/charge') },
        paypal: { url: storePrefixed('/paypal/pay') }
      },
      referrer: {
        create: {
          url: '/referrer',
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwiYmx1ZXByaW50cy91cmwuY29mZmVlIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsiQXBpIiwiaXNGdW5jdGlvbiIsImlzU3RyaW5nIiwibmV3RXJyb3IiLCJyZWYiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiQkxVRVBSSU5UUyIsIkNMSUVOVCIsIm9wdHMiLCJibHVlcHJpbnRzIiwiY2xpZW50IiwiZGVidWciLCJlbmRwb2ludCIsImsiLCJrZXkiLCJ2IiwiY29uc3RydWN0b3IiLCJhZGRCbHVlcHJpbnRzIiwicHJvdG90eXBlIiwiYXBpIiwiYnAiLCJmbiIsIm5hbWUiLCJfdGhpcyIsIm1ldGhvZCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZXhwZWN0cyIsImRhdGEiLCJjYiIsInJlcXVlc3QiLCJ0aGVuIiwicmVzIiwicmVmMSIsInJlZjIiLCJlcnJvciIsInByb2Nlc3MiLCJjYWxsIiwiYm9keSIsImNhbGxiYWNrIiwic2V0S2V5Iiwic2V0VXNlcktleSIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMyIsInJlZjQiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJYaHIiLCJYaHJDbGllbnQiLCJjb29raWUiLCJQcm9taXNlIiwic2Vzc2lvbk5hbWUiLCJzZXRFbmRwb2ludCIsImdldFVzZXJLZXkiLCJyZXBsYWNlIiwiZ2V0S2V5IiwidXNlcktleSIsIktFWSIsImdsb2JhbCIsImRvY3VtZW50IiwiZ2V0SlNPTiIsInNldCIsImV4cGlyZXMiLCJnZXRVcmwiLCJ1cmwiLCJibHVlcHJpbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiY29uc29sZSIsImxvZyIsInNlbmQiLCJwYXJzZSIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwib3B0aW9ucyIsImRlZmF1bHRzIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsIk9iamVjdCIsImFzc2lnbiIsInJlc29sdmUiLCJyZWplY3QiLCJlIiwiaGVhZGVyIiwidmFsdWUiLCJYTUxIdHRwUmVxdWVzdCIsIl9oYW5kbGVFcnJvciIsImxlbmd0aCIsIl94aHIiLCJvbmxvYWQiLCJfZGV0YWNoV2luZG93VW5sb2FkIiwiX2dldFJlc3BvbnNlVGV4dCIsIl9lcnJvciIsIl9nZXRSZXNwb25zZVVybCIsInN0YXR1c1RleHQiLCJfZ2V0SGVhZGVycyIsIm9uZXJyb3IiLCJvbnRpbWVvdXQiLCJvbmFib3J0IiwiX2F0dGFjaFdpbmRvd1VubG9hZCIsIm9wZW4iLCJzZXRSZXF1ZXN0SGVhZGVyIiwidG9TdHJpbmciLCJnZXRYSFIiLCJfdW5sb2FkSGFuZGxlciIsIl9oYW5kbGVXaW5kb3dVbmxvYWQiLCJiaW5kIiwid2luZG93IiwiYXR0YWNoRXZlbnQiLCJkZXRhY2hFdmVudCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImdldFJlc3BvbnNlSGVhZGVyIiwicmVzcG9uc2VVUkwiLCJ0ZXN0IiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJhcmciLCJyZXN1bHQiLCJzcGxpdCIsInJvdyIsImluZGV4IiwiaW5kZXhPZiIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJwdXNoIiwic3RyIiwibGVmdCIsInJpZ2h0IiwiaGFzT3duUHJvcGVydHkiLCJsaXN0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiVHlwZUVycm9yIiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJhcnJheSIsImkiLCJsZW4iLCJzdHJpbmciLCJjaGFyQXQiLCJvYmplY3QiLCJzZXRUaW1lb3V0IiwiYWxlcnQiLCJjb25maXJtIiwicHJvbXB0IiwiUHJvbWlzZUluc3BlY3Rpb24iLCJzdXBwcmVzc1VuY2F1Z2h0UmVqZWN0aW9uRXJyb3IiLCJzdGF0ZSIsImlzRnVsZmlsbGVkIiwiaXNSZWplY3RlZCIsInJlZmxlY3QiLCJwcm9taXNlIiwic2V0dGxlIiwicHJvbWlzZXMiLCJhbGwiLCJtYXAiLCJ0IiwibiIsInkiLCJwIiwibyIsInIiLCJjIiwidSIsImYiLCJzcGxpY2UiLCJNdXRhdGlvbk9ic2VydmVyIiwiY3JlYXRlRWxlbWVudCIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwic2V0QXR0cmlidXRlIiwic2V0SW1tZWRpYXRlIiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIl9PbGRDb29raWVzIiwiQ29va2llcyIsIm5vQ29uZmxpY3QiLCJleHRlbmQiLCJpbml0IiwiY29udmVydGVyIiwicGF0aCIsIkRhdGUiLCJzZXRNaWxsaXNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJTdHJpbmciLCJkZWNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ0b1VUQ1N0cmluZyIsImRvbWFpbiIsInNlY3VyZSIsImpvaW4iLCJjb29raWVzIiwicmRlY29kZSIsInBhcnRzIiwianNvbiIsImdldCIsInJlbW92ZSIsIndpdGhDb252ZXJ0ZXIiLCJieUlkIiwiY3JlYXRlQmx1ZXByaW50IiwibW9kZWwiLCJtb2RlbHMiLCJzdG9yZVByZWZpeGVkIiwiYWNjb3VudCIsInVwZGF0ZSIsImV4aXN0cyIsIngiLCJlbWFpbCIsImNyZWF0ZSIsImNyZWF0ZUNvbmZpcm0iLCJ0b2tlbklkIiwibG9naW4iLCJ0b2tlbiIsImxvZ291dCIsInJlc2V0IiwicmVzZXRDb25maXJtIiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJjYXB0dXJlIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsInJlZmVycmVyIiwic3AiLCJjb2RlIiwic2x1ZyIsInNrdSIsIkNsaWVudCIsIkNyb3dkc3RhcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxVQUFULEVBQXFCQyxRQUFyQixFQUErQkMsUUFBL0IsRUFBeUNDLEdBQXpDLEVBQThDQyxRQUE5QyxDO0lBRUFELEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdFLEdBQUEsQ0FBSUYsUUFBdEUsRUFBZ0ZDLFFBQUEsR0FBV0MsR0FBQSxDQUFJRCxRQUEvRixFQUF5R0UsUUFBQSxHQUFXRCxHQUFBLENBQUlDLFFBQXhILEM7SUFFQUUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCUixHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2pDQSxHQUFBLENBQUlTLFVBQUosR0FBaUIsRUFBakIsQ0FEaUM7QUFBQSxNQUdqQ1QsR0FBQSxDQUFJVSxNQUFKLEdBQWEsWUFBVztBQUFBLE9BQXhCLENBSGlDO0FBQUEsTUFLakMsU0FBU1YsR0FBVCxDQUFhVyxJQUFiLEVBQW1CO0FBQUEsUUFDakIs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