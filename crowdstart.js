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
    var Api, cookie, isFunction, isString, newError, ref, statusOk;
    cookie = require('js-cookie/src/js.cookie');
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
        cookie.set(this.constructor.SESSION_NAME, key, { expires: 604800 });
        return this.client.setUserKey(key)
      };
      Api.prototype.getUserKey = function () {
        return cookie.get(this.constructor.SESSION_NAME)
      };
      Api.prototype.setStore = function (id) {
        this.storeId = id;
        return this.client.setStore(id)
      };
      return Api
    }()
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
      message = (ref = res != null ? (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0 : void 0) != null ? ref : 'Request failed';
      err = new Error(message);
      err.message = message;
      err.req = data;
      err.res = res;
      err.data = res.data;
      err.responseText = res.data;
      err.status = res.status;
      err.type = (ref3 = res.data) != null ? (ref4 = ref3.error) != null ? ref4.type : void 0 : void 0;
      return err
    }
  });
  // source: src/client/xhr.coffee
  require.define('./client/xhr', function (module, exports, __dirname, __filename) {
    var Xhr, XhrClient, isFunction, newError, ref;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
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
        this.setEndpoint(opts.endpoint)
      }
      XhrClient.prototype.setEndpoint = function (endpoint) {
        if (endpoint == null) {
          endpoint = ''
        }
        return this.endpoint = endpoint.replace(/\/$/, '')
      };
      XhrClient.prototype.setStore = function (id) {
        return this.storeId = id
      };
      XhrClient.prototype.setKey = function (key) {
        return this.key = key
      };
      XhrClient.prototype.setUserKey = function (key) {
        return this.userKey = key
      };
      XhrClient.prototype.getKey = function () {
        return this.userKey || this.key || this.constructor.KEY
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
      case 'product':
        return sp(function (x) {
          var ref, ref1;
          return '/product/' + ((ref = (ref1 = x.id) != null ? ref1 : x.slug) != null ? ref : x)
        });
      case 'variant':
        return sp(function (x) {
          var ref, ref1;
          return '/product/' + ((ref = (ref1 = x.id) != null ? ref1 : x.sku) != null ? ref : x)
        });
      default:
        return function (x) {
          var ref;
          return name + '/' + ((ref = x.id) != null ? ref : x)
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwiYmx1ZXByaW50cy91cmwuY29mZmVlIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsiQXBpIiwiY29va2llIiwiaXNGdW5jdGlvbiIsImlzU3RyaW5nIiwibmV3RXJyb3IiLCJyZWYiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiU0VTU0lPTl9OQU1FIiwiQkxVRVBSSU5UUyIsIkNMSUVOVCIsIm9wdHMiLCJibHVlcHJpbnRzIiwiY2xpZW50IiwiZGVidWciLCJlbmRwb2ludCIsImsiLCJrZXkiLCJ2IiwiY29uc3RydWN0b3IiLCJhZGRCbHVlcHJpbnRzIiwicHJvdG90eXBlIiwiYXBpIiwiYnAiLCJmbiIsIm5hbWUiLCJfdGhpcyIsIm1ldGhvZCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZXhwZWN0cyIsImRhdGEiLCJjYiIsInJlcXVlc3QiLCJ0aGVuIiwicmVzIiwicmVmMSIsInJlZjIiLCJlcnJvciIsInByb2Nlc3MiLCJjYWxsIiwiYm9keSIsImNhbGxiYWNrIiwic2V0S2V5Iiwic2V0VXNlcktleSIsInNldCIsImV4cGlyZXMiLCJnZXRVc2VyS2V5IiwiZ2V0Iiwic2V0U3RvcmUiLCJpZCIsInN0b3JlSWQiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwiX09sZENvb2tpZXMiLCJ3aW5kb3ciLCJDb29raWVzIiwibm9Db25mbGljdCIsImV4dGVuZCIsImkiLCJyZXN1bHQiLCJsZW5ndGgiLCJhdHRyaWJ1dGVzIiwiaW5pdCIsImNvbnZlcnRlciIsInZhbHVlIiwicGF0aCIsImRlZmF1bHRzIiwiRGF0ZSIsInNldE1pbGxpc2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0ZXN0IiwiZSIsImVuY29kZVVSSUNvbXBvbmVudCIsIlN0cmluZyIsInJlcGxhY2UiLCJkZWNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJkb2N1bWVudCIsInRvVVRDU3RyaW5nIiwiZG9tYWluIiwic2VjdXJlIiwiam9pbiIsImNvb2tpZXMiLCJzcGxpdCIsInJkZWNvZGUiLCJwYXJ0cyIsInNsaWNlIiwiY2hhckF0IiwianNvbiIsInBhcnNlIiwiZ2V0SlNPTiIsInJlbW92ZSIsIndpdGhDb252ZXJ0ZXIiLCJzIiwic3RhdHVzIiwic3RhdHVzQ3JlYXRlZCIsInN0YXR1c05vQ29udGVudCIsImVyciIsIm1lc3NhZ2UiLCJyZWYzIiwicmVmNCIsIkVycm9yIiwicmVxIiwicmVzcG9uc2VUZXh0IiwidHlwZSIsIlhociIsIlhockNsaWVudCIsIlByb21pc2UiLCJzZXRFbmRwb2ludCIsInVzZXJLZXkiLCJnZXRLZXkiLCJLRVkiLCJnZXRVcmwiLCJ1cmwiLCJibHVlcHJpbnQiLCJjb25zb2xlIiwibG9nIiwic2VuZCIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwib3B0aW9ucyIsImhlYWRlcnMiLCJhc3luYyIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJPYmplY3QiLCJhc3NpZ24iLCJyZXNvbHZlIiwicmVqZWN0IiwiaGVhZGVyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInRvU3RyaW5nIiwiZ2V0WEhSIiwiX3VubG9hZEhhbmRsZXIiLCJfaGFuZGxlV2luZG93VW5sb2FkIiwiYmluZCIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJnZXRSZXNwb25zZUhlYWRlciIsInJlc3BvbnNlVVJMIiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJhcmciLCJyb3ciLCJpbmRleCIsImluZGV4T2YiLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJzdHIiLCJsZWZ0IiwicmlnaHQiLCJoYXNPd25Qcm9wZXJ0eSIsImxpc3QiLCJpdGVyYXRvciIsImNvbnRleHQiLCJUeXBlRXJyb3IiLCJmb3JFYWNoQXJyYXkiLCJmb3JFYWNoU3RyaW5nIiwiZm9yRWFjaE9iamVjdCIsImFycmF5IiwibGVuIiwic3RyaW5nIiwib2JqZWN0Iiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwicCIsIm8iLCJyIiwiYyIsInUiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImNyZWF0ZUVsZW1lbnQiLCJvYnNlcnZlIiwic2V0QXR0cmlidXRlIiwic2V0SW1tZWRpYXRlIiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiZ2xvYmFsIiwiYnlJZCIsImNyZWF0ZUJsdWVwcmludCIsIm1vZGVsIiwibW9kZWxzIiwic3RvcmVQcmVmaXhlZCIsImFjY291bnQiLCJ1cGRhdGUiLCJleGlzdHMiLCJ4IiwiZW1haWwiLCJjcmVhdGUiLCJjcmVhdGVDb25maXJtIiwidG9rZW5JZCIsImxvZ2luIiwidG9rZW4iLCJsb2dvdXQiLCJyZXNldCIsInJlc2V0Q29uZmlybSIsImNoZWNrb3V0IiwiYXV0aG9yaXplIiwiY2FwdHVyZSIsIm9yZGVySWQiLCJjaGFyZ2UiLCJwYXlwYWwiLCJyZWZlcnJlciIsInNwIiwiY29kZSIsInNsdWciLCJza3UiLCJDbGllbnQiLCJDcm93ZHN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLEdBQUosRUFBU0MsTUFBVCxFQUFpQkMsVUFBakIsRUFBNkJDLFFBQTdCLEVBQXVDQyxRQUF2QyxFQUFpREMsR0FBakQsRUFBc0RDLFFBQXRELEM7SUFFQUwsTUFBQSxHQUFTTSxPQUFBLENBQVEseUJBQVIsQ0FBVCxDO0lBRUFGLEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdFLEdBQUEsQ0FBSUYsUUFBdEUsRUFBZ0ZDLFFBQUEsR0FBV0MsR0FBQSxDQUFJRCxRQUEvRixFQUF5R0UsUUFBQSxHQUFXRCxHQUFBLENBQUlDLFFBQXhILEM7SUFFQUUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCVCxHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2pDQSxHQUFBLENBQUlVLFlBQUosR0FBbUIsb0JBQW5CLENBRGlDO0FBQUEsTUFHakNWLEdBQUEsQ0FBSVcsVUFBSixHQUFpQixFQUFqQixDQUhpQztBQUFBLE1BS2pDWCxHQUFBLENBQUlZLE1BQUosR0FBYSxZQUFXO0FBQUEsT0FBeEIsQ0FMaUM7QUFBQSxNQU9qQyxTQUFTWixHQUFULENBQWFhLElBQWIsRUFBbUI7QUFBQSxRQUNqQixJQUFJQyxVQUFKLEVBQWdCQyxNQUFoQixFQUF3QkMsS0FBeEIsRUFBK0JDLFFBQS9CLEVBQXlDQyxDQUF6QyxFQUE0Q0MsR0FBNUMsRUFBaURDLENBQWpELENBRGlCO0FBQUEsUUFFakIsSUFBSVAsSUFBQSxJQUFRLElBQVosRUFBa0I7QUFBQSxVQUNoQkEsSUFBQSxHQUFPLEVBRFM7QUFBQSxTQUZEO0FBQUEsUUFLakIsSUFBSSxDQUFFLGlCQUFnQmIsR0FBaEIsQ0FBTixFQUE0QjtBQUFBLFVBQzFCLE9BQU8sSUFBSUEsR0FBSixDQUFRYSxJQUFSLENBRG1CO0FBQUEsU0FMWDtBQUFBLFFBUWpCSSxRQUFBLEdBQVdKLElBQUEsQ0FBS0ksUUFBaEIsRUFBMEJELEtBQUEsR0FBUUgsSUFBQSxDQUFLRyxLQUF2QyxFQUE4Q0csR0FBQSxHQUFNTixJQUFBLENBQUtNLEdBQXpELEVBQThESixNQUFBLEdBQVNGLElBQUEsQ0FBS0UsTUFBNUUsRUFBb0ZELFVBQUEsR0FBYUQsSUFBQSxDQUFLQyxVQUF0RyxDQVJpQjtBQUFBLFFBU2pCLEtBQUtFLEtBQUwsR0FBYUEsS0FBYixDQVRpQjtBQUFBLFFBVWpCLElBQUlGLFVBQUEsSUFBYyxJQUFsQixFQUF3QjtBQUFBLFVBQ3RCQSxVQUFBLEdBQWEsS0FBS08sV0FBTCxDQUFpQlYsVUFEUjtBQUFBLFNBVlA7QUFBQSxRQWFqQixJQUFJSSxNQUFKLEVBQVk7QUFBQSxVQUNWLEtBQUtBLE1BQUwsR0FBY0EsTUFESjtBQUFBLFNBQVosTUFFTztBQUFBLFVBQ0wsS0FBS0EsTUFBTCxHQUFjLElBQUksS0FBS00sV0FBTCxDQUFpQlQsTUFBckIsQ0FBNEI7QUFBQSxZQUN4Q0ksS0FBQSxFQUFPQSxLQURpQztBQUFBLFlBRXhDQyxRQUFBLEVBQVVBLFFBRjhCO0FBQUEsWUFHeENFLEdBQUEsRUFBS0EsR0FIbUM7QUFBQSxXQUE1QixDQURUO0FBQUEsU0FmVTtBQUFBLFFBc0JqQixLQUFLRCxDQUFMLElBQVVKLFVBQVYsRUFBc0I7QUFBQSxVQUNwQk0sQ0FBQSxHQUFJTixVQUFBLENBQVdJLENBQVgsQ0FBSixDQURvQjtBQUFBLFVBRXBCLEtBQUtJLGFBQUwsQ0FBbUJKLENBQW5CLEVBQXNCRSxDQUF0QixDQUZvQjtBQUFBLFNBdEJMO0FBQUEsT0FQYztBQUFBLE1BbUNqQ3BCLEdBQUEsQ0FBSXVCLFNBQUosQ0FBY0QsYUFBZCxHQUE4QixVQUFTRSxHQUFULEVBQWNWLFVBQWQsRUFBMEI7QUFBQSxRQUN0RCxJQUFJVyxFQUFKLEVBQVFDLEVBQVIsRUFBWUMsSUFBWixDQURzRDtBQUFBLFFBRXRELElBQUksS0FBS0gsR0FBTCxLQUFhLElBQWpCLEVBQXVCO0FBQUEsVUFDckIsS0FBS0EsR0FBTCxJQUFZLEVBRFM7QUFBQSxTQUYrQjtBQUFBLFFBS3RERSxFQUFBLEdBQU0sVUFBU0UsS0FBVCxFQUFnQjtBQUFBLFVBQ3BCLE9BQU8sVUFBU0QsSUFBVCxFQUFlRixFQUFmLEVBQW1CO0FBQUEsWUFDeEIsSUFBSUksTUFBSixDQUR3QjtBQUFBLFlBRXhCLElBQUkzQixVQUFBLENBQVd1QixFQUFYLENBQUosRUFBb0I7QUFBQSxjQUNsQixPQUFPRyxLQUFBLENBQU1KLEdBQU4sRUFBV0csSUFBWCxJQUFtQixZQUFXO0FBQUEsZ0JBQ25DLE9BQU9GLEVBQUEsQ0FBR0ssS0FBSCxDQUFTRixLQUFULEVBQWdCRyxTQUFoQixDQUQ0QjtBQUFBLGVBRG5CO0FBQUEsYUFGSTtBQUFBLFlBT3hCLElBQUlOLEVBQUEsQ0FBR08sT0FBSCxJQUFjLElBQWxCLEVBQXdCO0FBQUEsY0FDdEJQLEVBQUEsQ0FBR08sT0FBSCxHQUFhMUIsUUFEUztBQUFBLGFBUEE7QUFBQSxZQVV4QixJQUFJbUIsRUFBQSxDQUFHSSxNQUFILElBQWEsSUFBakIsRUFBdUI7QUFBQSxjQUNyQkosRUFBQSxDQUFHSSxNQUFILEdBQVksTUFEUztBQUFBLGFBVkM7QUFBQSxZQWF4QkEsTUFBQSxHQUFTLFVBQVNJLElBQVQsRUFBZUMsRUFBZixFQUFtQjtBQUFBLGNBQzFCLE9BQU9OLEtBQUEsQ0FBTWIsTUFBTixDQUFhb0IsT0FBYixDQUFxQlYsRUFBckIsRUFBeUJRLElBQXpCLEVBQStCRyxJQUEvQixDQUFvQyxVQUFTQyxHQUFULEVBQWM7QUFBQSxnQkFDdkQsSUFBSUMsSUFBSixFQUFVQyxJQUFWLENBRHVEO0FBQUEsZ0JBRXZELElBQUssQ0FBQyxDQUFBRCxJQUFBLEdBQU9ELEdBQUEsQ0FBSUosSUFBWCxDQUFELElBQXFCLElBQXJCLEdBQTRCSyxJQUFBLENBQUtFLEtBQWpDLEdBQXlDLEtBQUssQ0FBOUMsQ0FBRCxJQUFxRCxJQUF6RCxFQUErRDtBQUFBLGtCQUM3RCxNQUFNcEMsUUFBQSxDQUFTNkIsSUFBVCxFQUFlSSxHQUFmLENBRHVEO0FBQUEsaUJBRlI7QUFBQSxnQkFLdkQsSUFBSSxDQUFDWixFQUFBLENBQUdPLE9BQUgsQ0FBV0ssR0FBWCxDQUFMLEVBQXNCO0FBQUEsa0JBQ3BCLE1BQU1qQyxRQUFBLENBQVM2QixJQUFULEVBQWVJLEdBQWYsQ0FEYztBQUFBLGlCQUxpQztBQUFBLGdCQVF2RCxJQUFJWixFQUFBLENBQUdnQixPQUFILElBQWMsSUFBbEIsRUFBd0I7QUFBQSxrQkFDdEJoQixFQUFBLENBQUdnQixPQUFILENBQVdDLElBQVgsQ0FBZ0JkLEtBQWhCLEVBQXVCUyxHQUF2QixDQURzQjtBQUFBLGlCQVIrQjtBQUFBLGdCQVd2RCxPQUFRLENBQUFFLElBQUEsR0FBT0YsR0FBQSxDQUFJSixJQUFYLENBQUQsSUFBcUIsSUFBckIsR0FBNEJNLElBQTVCLEdBQW1DRixHQUFBLENBQUlNLElBWFM7QUFBQSxlQUFsRCxFQVlKQyxRQVpJLENBWUtWLEVBWkwsQ0FEbUI7QUFBQSxhQUE1QixDQWJ3QjtBQUFBLFlBNEJ4QixPQUFPTixLQUFBLENBQU1KLEdBQU4sRUFBV0csSUFBWCxJQUFtQkUsTUE1QkY7QUFBQSxXQUROO0FBQUEsU0FBakIsQ0ErQkYsSUEvQkUsQ0FBTCxDQUxzRDtBQUFBLFFBcUN0RCxLQUFLRixJQUFMLElBQWFiLFVBQWIsRUFBeUI7QUFBQSxVQUN2QlcsRUFBQSxHQUFLWCxVQUFBLENBQVdhLElBQVgsQ0FBTCxDQUR1QjtBQUFBLFVBRXZCRCxFQUFBLENBQUdDLElBQUgsRUFBU0YsRUFBVCxDQUZ1QjtBQUFBLFNBckM2QjtBQUFBLE9BQXhELENBbkNpQztBQUFBLE1BOEVqQ3pCLEdBQUEsQ0FBSXVCLFNBQUosQ0FBY3NCLE1BQWQsR0FBdUIsVUFBUzFCLEdBQVQsRUFBYztBQUFBLFFBQ25DLE9BQU8sS0FBS0osTUFBTCxDQUFZOEIsTUFBWixDQUFtQjFCLEdBQW5CLENBRDRCO0FBQUEsT0FBckMsQ0E5RWlDO0FBQUEsTUFrRmpDbkIsR0FBQSxDQUFJdUIsU0FBSixDQUFjdUIsVUFBZCxHQUEyQixVQUFTM0IsR0FBVCxFQUFjO0FBQUEsUUFDdkNsQixNQUFBLENBQU84QyxHQUFQLENBQVcsS0FBSzFCLFdBQUwsQ0FBaUJYLFlBQTVCLEVBQTBDUyxHQUExQyxFQUErQyxFQUM3QzZCLE9BQUEsRUFBUyxNQURvQyxFQUEvQyxFQUR1QztBQUFBLFFBSXZDLE9BQU8sS0FBS2pDLE1BQUwsQ0FBWStCLFVBQVosQ0FBdUIzQixHQUF2QixDQUpnQztBQUFBLE9BQXpDLENBbEZpQztBQUFBLE1BeUZqQ25CLEdBQUEsQ0FBSXVCLFNBQUosQ0FBYzBCLFVBQWQsR0FBMkIsWUFBVztBQUFBLFFBQ3BDLE9BQU9oRCxNQUFBLENBQU9pRCxHQUFQLENBQVcsS0FBSzdCLFdBQUwsQ0FBaUJYLFlBQTVCLENBRDZCO0FBQUEsT0FBdEMsQ0F6RmlDO0FBQUEsTUE2RmpDVixHQUFBLENBQUl1QixTQUFKLENBQWM0QixRQUFkLEdBQXlCLFVBQVNDLEVBQVQsRUFBYTtBQUFBLFFBQ3BDLEtBQUtDLE9BQUwsR0FBZUQsRUFBZixDQURvQztBQUFBLFFBRXBDLE9BQU8sS0FBS3JDLE1BQUwsQ0FBWW9DLFFBQVosQ0FBcUJDLEVBQXJCLENBRjZCO0FBQUEsT0FBdEMsQ0E3RmlDO0FBQUEsTUFrR2pDLE9BQU9wRCxHQWxHMEI7QUFBQSxLQUFaLEU7Ozs7SUNDdkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFDLFVBQVVzRCxPQUFWLEVBQW1CO0FBQUEsTUFDbkIsSUFBSSxPQUFPQyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDQSxNQUFBLENBQU9DLEdBQTNDLEVBQWdEO0FBQUEsUUFDL0NELE1BQUEsQ0FBT0QsT0FBUCxDQUQrQztBQUFBLE9BQWhELE1BRU8sSUFBSSxPQUFPN0MsT0FBUCxLQUFtQixRQUF2QixFQUFpQztBQUFBLFFBQ3ZDRCxNQUFBLENBQU9DLE9BQVAsR0FBaUI2QyxPQUFBLEVBRHNCO0FBQUEsT0FBakMsTUFFQTtBQUFBLFFBQ04sSUFBSUcsV0FBQSxHQUFjQyxNQUFBLENBQU9DLE9BQXpCLENBRE07QUFBQSxRQUVOLElBQUluQyxHQUFBLEdBQU1rQyxNQUFBLENBQU9DLE9BQVAsR0FBaUJMLE9BQUEsRUFBM0IsQ0FGTTtBQUFBLFFBR045QixHQUFBLENBQUlvQyxVQUFKLEdBQWlCLFlBQVk7QUFBQSxVQUM1QkYsTUFBQSxDQUFPQyxPQUFQLEdBQWlCRixXQUFqQixDQUQ0QjtBQUFBLFVBRTVCLE9BQU9qQyxHQUZxQjtBQUFBLFNBSHZCO0FBQUEsT0FMWTtBQUFBLEtBQW5CLENBYUMsWUFBWTtBQUFBLE1BQ2IsU0FBU3FDLE1BQVQsR0FBbUI7QUFBQSxRQUNsQixJQUFJQyxDQUFBLEdBQUksQ0FBUixDQURrQjtBQUFBLFFBRWxCLElBQUlDLE1BQUEsR0FBUyxFQUFiLENBRmtCO0FBQUEsUUFHbEIsT0FBT0QsQ0FBQSxHQUFJL0IsU0FBQSxDQUFVaUMsTUFBckIsRUFBNkJGLENBQUEsRUFBN0IsRUFBa0M7QUFBQSxVQUNqQyxJQUFJRyxVQUFBLEdBQWFsQyxTQUFBLENBQVcrQixDQUFYLENBQWpCLENBRGlDO0FBQUEsVUFFakMsU0FBUzNDLEdBQVQsSUFBZ0I4QyxVQUFoQixFQUE0QjtBQUFBLFlBQzNCRixNQUFBLENBQU81QyxHQUFQLElBQWM4QyxVQUFBLENBQVc5QyxHQUFYLENBRGE7QUFBQSxXQUZLO0FBQUEsU0FIaEI7QUFBQSxRQVNsQixPQUFPNEMsTUFUVztBQUFBLE9BRE47QUFBQSxNQWFiLFNBQVNHLElBQVQsQ0FBZUMsU0FBZixFQUEwQjtBQUFBLFFBQ3pCLFNBQVMzQyxHQUFULENBQWNMLEdBQWQsRUFBbUJpRCxLQUFuQixFQUEwQkgsVUFBMUIsRUFBc0M7QUFBQSxVQUNyQyxJQUFJRixNQUFKLENBRHFDO0FBQUEsVUFLckM7QUFBQSxjQUFJaEMsU0FBQSxDQUFVaUMsTUFBVixHQUFtQixDQUF2QixFQUEwQjtBQUFBLFlBQ3pCQyxVQUFBLEdBQWFKLE1BQUEsQ0FBTyxFQUNuQlEsSUFBQSxFQUFNLEdBRGEsRUFBUCxFQUVWN0MsR0FBQSxDQUFJOEMsUUFGTSxFQUVJTCxVQUZKLENBQWIsQ0FEeUI7QUFBQSxZQUt6QixJQUFJLE9BQU9BLFVBQUEsQ0FBV2pCLE9BQWxCLEtBQThCLFFBQWxDLEVBQTRDO0FBQUEsY0FDM0MsSUFBSUEsT0FBQSxHQUFVLElBQUl1QixJQUFsQixDQUQyQztBQUFBLGNBRTNDdkIsT0FBQSxDQUFRd0IsZUFBUixDQUF3QnhCLE9BQUEsQ0FBUXlCLGVBQVIsS0FBNEJSLFVBQUEsQ0FBV2pCLE9BQVgsR0FBcUIsUUFBekUsRUFGMkM7QUFBQSxjQUczQ2lCLFVBQUEsQ0FBV2pCLE9BQVgsR0FBcUJBLE9BSHNCO0FBQUEsYUFMbkI7QUFBQSxZQVd6QixJQUFJO0FBQUEsY0FDSGUsTUFBQSxHQUFTVyxJQUFBLENBQUtDLFNBQUwsQ0FBZVAsS0FBZixDQUFULENBREc7QUFBQSxjQUVILElBQUksVUFBVVEsSUFBVixDQUFlYixNQUFmLENBQUosRUFBNEI7QUFBQSxnQkFDM0JLLEtBQUEsR0FBUUwsTUFEbUI7QUFBQSxlQUZ6QjtBQUFBLGFBQUosQ0FLRSxPQUFPYyxDQUFQLEVBQVU7QUFBQSxhQWhCYTtBQUFBLFlBa0J6QlQsS0FBQSxHQUFRVSxrQkFBQSxDQUFtQkMsTUFBQSxDQUFPWCxLQUFQLENBQW5CLENBQVIsQ0FsQnlCO0FBQUEsWUFtQnpCQSxLQUFBLEdBQVFBLEtBQUEsQ0FBTVksT0FBTixDQUFjLDJEQUFkLEVBQTJFQyxrQkFBM0UsQ0FBUixDQW5CeUI7QUFBQSxZQXFCekI5RCxHQUFBLEdBQU0yRCxrQkFBQSxDQUFtQkMsTUFBQSxDQUFPNUQsR0FBUCxDQUFuQixDQUFOLENBckJ5QjtBQUFBLFlBc0J6QkEsR0FBQSxHQUFNQSxHQUFBLENBQUk2RCxPQUFKLENBQVksMEJBQVosRUFBd0NDLGtCQUF4QyxDQUFOLENBdEJ5QjtBQUFBLFlBdUJ6QjlELEdBQUEsR0FBTUEsR0FBQSxDQUFJNkQsT0FBSixDQUFZLFNBQVosRUFBdUJFLE1BQXZCLENBQU4sQ0F2QnlCO0FBQUEsWUF5QnpCLE9BQVFDLFFBQUEsQ0FBU2xGLE1BQVQsR0FBa0I7QUFBQSxjQUN6QmtCLEdBRHlCO0FBQUEsY0FDcEIsR0FEb0I7QUFBQSxjQUNmaUQsS0FEZTtBQUFBLGNBRXpCSCxVQUFBLENBQVdqQixPQUFYLElBQXNCLGVBQWVpQixVQUFBLENBQVdqQixPQUFYLENBQW1Cb0MsV0FBbkIsRUFGWjtBQUFBLGNBR3pCO0FBQUEsY0FBQW5CLFVBQUEsQ0FBV0ksSUFBWCxJQUFzQixZQUFZSixVQUFBLENBQVdJLElBSHBCO0FBQUEsY0FJekJKLFVBQUEsQ0FBV29CLE1BQVgsSUFBc0IsY0FBY3BCLFVBQUEsQ0FBV29CLE1BSnRCO0FBQUEsY0FLekJwQixVQUFBLENBQVdxQixNQUFYLEdBQW9CLFVBQXBCLEdBQWlDLEVBTFI7QUFBQSxjQU14QkMsSUFOd0IsQ0FNbkIsRUFObUIsQ0F6QkQ7QUFBQSxXQUxXO0FBQUEsVUF5Q3JDO0FBQUEsY0FBSSxDQUFDcEUsR0FBTCxFQUFVO0FBQUEsWUFDVDRDLE1BQUEsR0FBUyxFQURBO0FBQUEsV0F6QzJCO0FBQUEsVUFnRHJDO0FBQUE7QUFBQTtBQUFBLGNBQUl5QixPQUFBLEdBQVVMLFFBQUEsQ0FBU2xGLE1BQVQsR0FBa0JrRixRQUFBLENBQVNsRixNQUFULENBQWdCd0YsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBbEIsR0FBZ0QsRUFBOUQsQ0FoRHFDO0FBQUEsVUFpRHJDLElBQUlDLE9BQUEsR0FBVSxrQkFBZCxDQWpEcUM7QUFBQSxVQWtEckMsSUFBSTVCLENBQUEsR0FBSSxDQUFSLENBbERxQztBQUFBLFVBb0RyQyxPQUFPQSxDQUFBLEdBQUkwQixPQUFBLENBQVF4QixNQUFuQixFQUEyQkYsQ0FBQSxFQUEzQixFQUFnQztBQUFBLFlBQy9CLElBQUk2QixLQUFBLEdBQVFILE9BQUEsQ0FBUTFCLENBQVIsRUFBVzJCLEtBQVgsQ0FBaUIsR0FBakIsQ0FBWixDQUQrQjtBQUFBLFlBRS9CLElBQUk5RCxJQUFBLEdBQU9nRSxLQUFBLENBQU0sQ0FBTixFQUFTWCxPQUFULENBQWlCVSxPQUFqQixFQUEwQlQsa0JBQTFCLENBQVgsQ0FGK0I7QUFBQSxZQUcvQixJQUFJaEYsTUFBQSxHQUFTMEYsS0FBQSxDQUFNQyxLQUFOLENBQVksQ0FBWixFQUFlTCxJQUFmLENBQW9CLEdBQXBCLENBQWIsQ0FIK0I7QUFBQSxZQUsvQixJQUFJdEYsTUFBQSxDQUFPNEYsTUFBUCxDQUFjLENBQWQsTUFBcUIsR0FBekIsRUFBOEI7QUFBQSxjQUM3QjVGLE1BQUEsR0FBU0EsTUFBQSxDQUFPMkYsS0FBUCxDQUFhLENBQWIsRUFBZ0IsQ0FBQyxDQUFqQixDQURvQjtBQUFBLGFBTEM7QUFBQSxZQVMvQixJQUFJO0FBQUEsY0FDSDNGLE1BQUEsR0FBU2tFLFNBQUEsSUFBYUEsU0FBQSxDQUFVbEUsTUFBVixFQUFrQjBCLElBQWxCLENBQWIsSUFBd0MxQixNQUFBLENBQU8rRSxPQUFQLENBQWVVLE9BQWYsRUFBd0JULGtCQUF4QixDQUFqRCxDQURHO0FBQUEsY0FHSCxJQUFJLEtBQUthLElBQVQsRUFBZTtBQUFBLGdCQUNkLElBQUk7QUFBQSxrQkFDSDdGLE1BQUEsR0FBU3lFLElBQUEsQ0FBS3FCLEtBQUwsQ0FBVzlGLE1BQVgsQ0FETjtBQUFBLGlCQUFKLENBRUUsT0FBTzRFLENBQVAsRUFBVTtBQUFBLGlCQUhFO0FBQUEsZUFIWjtBQUFBLGNBU0gsSUFBSTFELEdBQUEsS0FBUVEsSUFBWixFQUFrQjtBQUFBLGdCQUNqQm9DLE1BQUEsR0FBUzlELE1BQVQsQ0FEaUI7QUFBQSxnQkFFakIsS0FGaUI7QUFBQSxlQVRmO0FBQUEsY0FjSCxJQUFJLENBQUNrQixHQUFMLEVBQVU7QUFBQSxnQkFDVDRDLE1BQUEsQ0FBT3BDLElBQVAsSUFBZTFCLE1BRE47QUFBQSxlQWRQO0FBQUEsYUFBSixDQWlCRSxPQUFPNEUsQ0FBUCxFQUFVO0FBQUEsYUExQm1CO0FBQUEsV0FwREs7QUFBQSxVQWlGckMsT0FBT2QsTUFqRjhCO0FBQUEsU0FEYjtBQUFBLFFBcUZ6QnZDLEdBQUEsQ0FBSTBCLEdBQUosR0FBVTFCLEdBQUEsQ0FBSXVCLEdBQUosR0FBVXZCLEdBQXBCLENBckZ5QjtBQUFBLFFBc0Z6QkEsR0FBQSxDQUFJd0UsT0FBSixHQUFjLFlBQVk7QUFBQSxVQUN6QixPQUFPeEUsR0FBQSxDQUFJTSxLQUFKLENBQVUsRUFDaEJnRSxJQUFBLEVBQU0sSUFEVSxFQUFWLEVBRUosR0FBR0YsS0FBSCxDQUFTbEQsSUFBVCxDQUFjWCxTQUFkLENBRkksQ0FEa0I7QUFBQSxTQUExQixDQXRGeUI7QUFBQSxRQTJGekJQLEdBQUEsQ0FBSThDLFFBQUosR0FBZSxFQUFmLENBM0Z5QjtBQUFBLFFBNkZ6QjlDLEdBQUEsQ0FBSXlFLE1BQUosR0FBYSxVQUFVOUUsR0FBVixFQUFlOEMsVUFBZixFQUEyQjtBQUFBLFVBQ3ZDekMsR0FBQSxDQUFJTCxHQUFKLEVBQVMsRUFBVCxFQUFhMEMsTUFBQSxDQUFPSSxVQUFQLEVBQW1CLEVBQy9CakIsT0FBQSxFQUFTLENBQUMsQ0FEcUIsRUFBbkIsQ0FBYixDQUR1QztBQUFBLFNBQXhDLENBN0Z5QjtBQUFBLFFBbUd6QnhCLEdBQUEsQ0FBSTBFLGFBQUosR0FBb0JoQyxJQUFwQixDQW5HeUI7QUFBQSxRQXFHekIsT0FBTzFDLEdBckdrQjtBQUFBLE9BYmI7QUFBQSxNQXFIYixPQUFPMEMsSUFBQSxFQXJITTtBQUFBLEtBYmIsQ0FBRCxDOzs7O0lDUEF6RCxPQUFBLENBQVFQLFVBQVIsR0FBcUIsVUFBU3dCLEVBQVQsRUFBYTtBQUFBLE1BQ2hDLE9BQU8sT0FBT0EsRUFBUCxLQUFjLFVBRFc7QUFBQSxLQUFsQyxDO0lBSUFqQixPQUFBLENBQVFOLFFBQVIsR0FBbUIsVUFBU2dHLENBQVQsRUFBWTtBQUFBLE1BQzdCLE9BQU8sT0FBT0EsQ0FBUCxLQUFhLFFBRFM7QUFBQSxLQUEvQixDO0lBSUExRixPQUFBLENBQVFILFFBQVIsR0FBbUIsVUFBUytCLEdBQVQsRUFBYztBQUFBLE1BQy9CLE9BQU9BLEdBQUEsQ0FBSStELE1BQUosS0FBZSxHQURTO0FBQUEsS0FBakMsQztJQUlBM0YsT0FBQSxDQUFRNEYsYUFBUixHQUF3QixVQUFTaEUsR0FBVCxFQUFjO0FBQUEsTUFDcEMsT0FBT0EsR0FBQSxDQUFJK0QsTUFBSixLQUFlLEdBRGM7QUFBQSxLQUF0QyxDO0lBSUEzRixPQUFBLENBQVE2RixlQUFSLEdBQTBCLFVBQVNqRSxHQUFULEVBQWM7QUFBQSxNQUN0QyxPQUFPQSxHQUFBLENBQUkrRCxNQUFKLEtBQWUsR0FEZ0I7QUFBQSxLQUF4QyxDO0lBSUEzRixPQUFBLENBQVFMLFFBQVIsR0FBbUIsVUFBUzZCLElBQVQsRUFBZUksR0FBZixFQUFvQjtBQUFBLE1BQ3JDLElBQUlrRSxHQUFKLEVBQVNDLE9BQVQsRUFBa0JuRyxHQUFsQixFQUF1QmlDLElBQXZCLEVBQTZCQyxJQUE3QixFQUFtQ2tFLElBQW5DLEVBQXlDQyxJQUF6QyxDQURxQztBQUFBLE1BRXJDRixPQUFBLEdBQVcsQ0FBQW5HLEdBQUEsR0FBTWdDLEdBQUEsSUFBTyxJQUFQLEdBQWUsQ0FBQUMsSUFBQSxHQUFPRCxHQUFBLENBQUlKLElBQVgsQ0FBRCxJQUFxQixJQUFyQixHQUE2QixDQUFBTSxJQUFBLEdBQU9ELElBQUEsQ0FBS0UsS0FBWixDQUFELElBQXVCLElBQXZCLEdBQThCRCxJQUFBLENBQUtpRSxPQUFuQyxHQUE2QyxLQUFLLENBQTlFLEdBQWtGLEtBQUssQ0FBckcsR0FBeUcsS0FBSyxDQUFwSCxDQUFELElBQTJILElBQTNILEdBQWtJbkcsR0FBbEksR0FBd0ksZ0JBQWxKLENBRnFDO0FBQUEsTUFHckNrRyxHQUFBLEdBQU0sSUFBSUksS0FBSixDQUFVSCxPQUFWLENBQU4sQ0FIcUM7QUFBQSxNQUlyQ0QsR0FBQSxDQUFJQyxPQUFKLEdBQWNBLE9BQWQsQ0FKcUM7QUFBQSxNQUtyQ0QsR0FBQSxDQUFJSyxHQUFKLEdBQVUzRSxJQUFWLENBTHFDO0FBQUEsTUFNckNzRSxHQUFBLENBQUlsRSxHQUFKLEdBQVVBLEdBQVYsQ0FOcUM7QUFBQSxNQU9yQ2tFLEdBQUEsQ0FBSXRFLElBQUosR0FBV0ksR0FBQSxDQUFJSixJQUFmLENBUHFDO0FBQUEsTUFRckNzRSxHQUFBLENBQUlNLFlBQUosR0FBbUJ4RSxHQUFBLENBQUlKLElBQXZCLENBUnFDO0FBQUEsTUFTckNzRSxHQUFBLENBQUlILE1BQUosR0FBYS9ELEdBQUEsQ0FBSStELE1BQWpCLENBVHFDO0FBQUEsTUFVckNHLEdBQUEsQ0FBSU8sSUFBSixHQUFZLENBQUFMLElBQUEsR0FBT3BFLEdBQUEsQ0FBSUosSUFBWCxDQUFELElBQXFCLElBQXJCLEdBQTZCLENBQUF5RSxJQUFBLEdBQU9ELElBQUEsQ0FBS2pFLEtBQVosQ0FBRCxJQUF1QixJQUF2QixHQUE4QmtFLElBQUEsQ0FBS0ksSUFBbkMsR0FBMEMsS0FBSyxDQUEzRSxHQUErRSxLQUFLLENBQS9GLENBVnFDO0FBQUEsTUFXckMsT0FBT1AsR0FYOEI7QUFBQSxLOzs7O0lDcEJ2QyxJQUFJUSxHQUFKLEVBQVNDLFNBQVQsRUFBb0I5RyxVQUFwQixFQUFnQ0UsUUFBaEMsRUFBMENDLEdBQTFDLEM7SUFFQTBHLEdBQUEsR0FBTXhHLE9BQUEsQ0FBUSxxQkFBUixDQUFOLEM7SUFFQXdHLEdBQUEsQ0FBSUUsT0FBSixHQUFjMUcsT0FBQSxDQUFRLFlBQVIsQ0FBZCxDO0lBRUFGLEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEyQkwsVUFBQSxHQUFhRyxHQUFBLENBQUlILFVBQTVDLEVBQXdERSxRQUFBLEdBQVdDLEdBQUEsQ0FBSUQsUUFBdkUsQztJQUVBSSxNQUFBLENBQU9DLE9BQVAsR0FBaUJ1RyxTQUFBLEdBQWEsWUFBVztBQUFBLE1BQ3ZDQSxTQUFBLENBQVV6RixTQUFWLENBQW9CUCxLQUFwQixHQUE0QixLQUE1QixDQUR1QztBQUFBLE1BR3ZDZ0csU0FBQSxDQUFVekYsU0FBVixDQUFvQk4sUUFBcEIsR0FBK0IsNEJBQS9CLENBSHVDO0FBQUEsTUFLdkMsU0FBUytGLFNBQVQsQ0FBbUJuRyxJQUFuQixFQUF5QjtBQUFBLFFBQ3ZCLElBQUlBLElBQUEsSUFBUSxJQUFaLEVBQWtCO0FBQUEsVUFDaEJBLElBQUEsR0FBTyxFQURTO0FBQUEsU0FESztBQUFBLFFBSXZCLElBQUksQ0FBRSxpQkFBZ0JtRyxTQUFoQixDQUFOLEVBQWtDO0FBQUEsVUFDaEMsT0FBTyxJQUFJQSxTQUFKLENBQWNuRyxJQUFkLENBRHlCO0FBQUEsU0FKWDtBQUFBLFFBT3ZCLEtBQUtNLEdBQUwsR0FBV04sSUFBQSxDQUFLTSxHQUFoQixFQUFxQixLQUFLSCxLQUFMLEdBQWFILElBQUEsQ0FBS0csS0FBdkMsQ0FQdUI7QUFBQSxRQVF2QixLQUFLa0csV0FBTCxDQUFpQnJHLElBQUEsQ0FBS0ksUUFBdEIsQ0FSdUI7QUFBQSxPQUxjO0FBQUEsTUFnQnZDK0YsU0FBQSxDQUFVekYsU0FBVixDQUFvQjJGLFdBQXBCLEdBQWtDLFVBQVNqRyxRQUFULEVBQW1CO0FBQUEsUUFDbkQsSUFBSUEsUUFBQSxJQUFZLElBQWhCLEVBQXNCO0FBQUEsVUFDcEJBLFFBQUEsR0FBVyxFQURTO0FBQUEsU0FENkI7QUFBQSxRQUluRCxPQUFPLEtBQUtBLFFBQUwsR0FBZ0JBLFFBQUEsQ0FBUytELE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsRUFBeEIsQ0FKNEI7QUFBQSxPQUFyRCxDQWhCdUM7QUFBQSxNQXVCdkNnQyxTQUFBLENBQVV6RixTQUFWLENBQW9CNEIsUUFBcEIsR0FBK0IsVUFBU0MsRUFBVCxFQUFhO0FBQUEsUUFDMUMsT0FBTyxLQUFLQyxPQUFMLEdBQWVELEVBRG9CO0FBQUEsT0FBNUMsQ0F2QnVDO0FBQUEsTUEyQnZDNEQsU0FBQSxDQUFVekYsU0FBVixDQUFvQnNCLE1BQXBCLEdBQTZCLFVBQVMxQixHQUFULEVBQWM7QUFBQSxRQUN6QyxPQUFPLEtBQUtBLEdBQUwsR0FBV0EsR0FEdUI7QUFBQSxPQUEzQyxDQTNCdUM7QUFBQSxNQStCdkM2RixTQUFBLENBQVV6RixTQUFWLENBQW9CdUIsVUFBcEIsR0FBaUMsVUFBUzNCLEdBQVQsRUFBYztBQUFBLFFBQzdDLE9BQU8sS0FBS2dHLE9BQUwsR0FBZWhHLEdBRHVCO0FBQUEsT0FBL0MsQ0EvQnVDO0FBQUEsTUFtQ3ZDNkYsU0FBQSxDQUFVekYsU0FBVixDQUFvQjZGLE1BQXBCLEdBQTZCLFlBQVc7QUFBQSxRQUN0QyxPQUFPLEtBQUtELE9BQUwsSUFBZ0IsS0FBS2hHLEdBQXJCLElBQTRCLEtBQUtFLFdBQUwsQ0FBaUJnRyxHQURkO0FBQUEsT0FBeEMsQ0FuQ3VDO0FBQUEsTUF1Q3ZDTCxTQUFBLENBQVV6RixTQUFWLENBQW9CK0YsTUFBcEIsR0FBNkIsVUFBU0MsR0FBVCxFQUFjdEYsSUFBZCxFQUFvQmQsR0FBcEIsRUFBeUI7QUFBQSxRQUNwRCxJQUFJakIsVUFBQSxDQUFXcUgsR0FBWCxDQUFKLEVBQXFCO0FBQUEsVUFDbkJBLEdBQUEsR0FBTUEsR0FBQSxDQUFJN0UsSUFBSixDQUFTLElBQVQsRUFBZVQsSUFBZixDQURhO0FBQUEsU0FEK0I7QUFBQSxRQUlwRCxPQUFPLEtBQUssS0FBS2hCLFFBQVYsR0FBcUJzRyxHQUFyQixHQUEyQixTQUEzQixHQUF1Q3BHLEdBSk07QUFBQSxPQUF0RCxDQXZDdUM7QUFBQSxNQThDdkM2RixTQUFBLENBQVV6RixTQUFWLENBQW9CWSxPQUFwQixHQUE4QixVQUFTcUYsU0FBVCxFQUFvQnZGLElBQXBCLEVBQTBCZCxHQUExQixFQUErQjtBQUFBLFFBQzNELElBQUlOLElBQUosQ0FEMkQ7QUFBQSxRQUUzRCxJQUFJTSxHQUFBLElBQU8sSUFBWCxFQUFpQjtBQUFBLFVBQ2ZBLEdBQUEsR0FBTSxLQUFLaUcsTUFBTCxFQURTO0FBQUEsU0FGMEM7QUFBQSxRQUszRHZHLElBQUEsR0FBTztBQUFBLFVBQ0wwRyxHQUFBLEVBQUssS0FBS0QsTUFBTCxDQUFZRSxTQUFBLENBQVVELEdBQXRCLEVBQTJCdEYsSUFBM0IsRUFBaUNkLEdBQWpDLENBREE7QUFBQSxVQUVMVSxNQUFBLEVBQVEyRixTQUFBLENBQVUzRixNQUZiO0FBQUEsVUFHTEksSUFBQSxFQUFNeUMsSUFBQSxDQUFLQyxTQUFMLENBQWUxQyxJQUFmLENBSEQ7QUFBQSxTQUFQLENBTDJEO0FBQUEsUUFVM0QsSUFBSSxLQUFLakIsS0FBVCxFQUFnQjtBQUFBLFVBQ2R5RyxPQUFBLENBQVFDLEdBQVIsQ0FBWSxhQUFaLEVBRGM7QUFBQSxVQUVkRCxPQUFBLENBQVFDLEdBQVIsQ0FBWTdHLElBQVosQ0FGYztBQUFBLFNBVjJDO0FBQUEsUUFjM0QsT0FBUSxJQUFJa0csR0FBSixFQUFELENBQVVZLElBQVYsQ0FBZTlHLElBQWYsRUFBcUJ1QixJQUFyQixDQUEwQixVQUFTQyxHQUFULEVBQWM7QUFBQSxVQUM3QyxJQUFJLEtBQUtyQixLQUFULEVBQWdCO0FBQUEsWUFDZHlHLE9BQUEsQ0FBUUMsR0FBUixDQUFZLGNBQVosRUFEYztBQUFBLFlBRWRELE9BQUEsQ0FBUUMsR0FBUixDQUFZckYsR0FBWixDQUZjO0FBQUEsV0FENkI7QUFBQSxVQUs3Q0EsR0FBQSxDQUFJSixJQUFKLEdBQVdJLEdBQUEsQ0FBSXdFLFlBQWYsQ0FMNkM7QUFBQSxVQU03QyxPQUFPeEUsR0FOc0M7QUFBQSxTQUF4QyxFQU9KLE9BUEksRUFPSyxVQUFTQSxHQUFULEVBQWM7QUFBQSxVQUN4QixJQUFJa0UsR0FBSixFQUFTL0QsS0FBVCxFQUFnQkYsSUFBaEIsQ0FEd0I7QUFBQSxVQUV4QixJQUFJO0FBQUEsWUFDRkQsR0FBQSxDQUFJSixJQUFKLEdBQVksQ0FBQUssSUFBQSxHQUFPRCxHQUFBLENBQUl3RSxZQUFYLENBQUQsSUFBNkIsSUFBN0IsR0FBb0N2RSxJQUFwQyxHQUEyQ29DLElBQUEsQ0FBS3FCLEtBQUwsQ0FBVzFELEdBQUEsQ0FBSXVGLEdBQUosQ0FBUWYsWUFBbkIsQ0FEcEQ7QUFBQSxXQUFKLENBRUUsT0FBT3JFLEtBQVAsRUFBYztBQUFBLFlBQ2QrRCxHQUFBLEdBQU0vRCxLQURRO0FBQUEsV0FKUTtBQUFBLFVBT3hCK0QsR0FBQSxHQUFNbkcsUUFBQSxDQUFTNkIsSUFBVCxFQUFlSSxHQUFmLENBQU4sQ0FQd0I7QUFBQSxVQVF4QixJQUFJLEtBQUtyQixLQUFULEVBQWdCO0FBQUEsWUFDZHlHLE9BQUEsQ0FBUUMsR0FBUixDQUFZLGNBQVosRUFEYztBQUFBLFlBRWRELE9BQUEsQ0FBUUMsR0FBUixDQUFZckYsR0FBWixFQUZjO0FBQUEsWUFHZG9GLE9BQUEsQ0FBUUMsR0FBUixDQUFZLFFBQVosRUFBc0JuQixHQUF0QixDQUhjO0FBQUEsV0FSUTtBQUFBLFVBYXhCLE1BQU1BLEdBYmtCO0FBQUEsU0FQbkIsQ0Fkb0Q7QUFBQSxPQUE3RCxDQTlDdUM7QUFBQSxNQW9GdkMsT0FBT1MsU0FwRmdDO0FBQUEsS0FBWixFOzs7O0lDRjdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUFJYSxZQUFKLEVBQWtCQyxxQkFBbEIsQztJQUVBRCxZQUFBLEdBQWV0SCxPQUFBLENBQVEsNkJBQVIsQ0FBZixDO0lBT0E7QUFBQTtBQUFBO0FBQUEsSUFBQUMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCcUgscUJBQUEsR0FBeUIsWUFBVztBQUFBLE1BQ25ELFNBQVNBLHFCQUFULEdBQWlDO0FBQUEsT0FEa0I7QUFBQSxNQUduREEscUJBQUEsQ0FBc0JDLG9CQUF0QixHQUE2QyxrREFBN0MsQ0FIbUQ7QUFBQSxNQUtuREQscUJBQUEsQ0FBc0JiLE9BQXRCLEdBQWdDQSxPQUFoQyxDQUxtRDtBQUFBLE1BZW5EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFhLHFCQUFBLENBQXNCdkcsU0FBdEIsQ0FBZ0NvRyxJQUFoQyxHQUF1QyxVQUFTSyxPQUFULEVBQWtCO0FBQUEsUUFDdkQsSUFBSTFELFFBQUosQ0FEdUQ7QUFBQSxRQUV2RCxJQUFJMEQsT0FBQSxJQUFXLElBQWYsRUFBcUI7QUFBQSxVQUNuQkEsT0FBQSxHQUFVLEVBRFM7QUFBQSxTQUZrQztBQUFBLFFBS3ZEMUQsUUFBQSxHQUFXO0FBQUEsVUFDVHpDLE1BQUEsRUFBUSxLQURDO0FBQUEsVUFFVEksSUFBQSxFQUFNLElBRkc7QUFBQSxVQUdUZ0csT0FBQSxFQUFTLEVBSEE7QUFBQSxVQUlUQyxLQUFBLEVBQU8sSUFKRTtBQUFBLFVBS1RDLFFBQUEsRUFBVSxJQUxEO0FBQUEsVUFNVEMsUUFBQSxFQUFVLElBTkQ7QUFBQSxTQUFYLENBTHVEO0FBQUEsUUFhdkRKLE9BQUEsR0FBVUssTUFBQSxDQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQmhFLFFBQWxCLEVBQTRCMEQsT0FBNUIsQ0FBVixDQWJ1RDtBQUFBLFFBY3ZELE9BQU8sSUFBSSxLQUFLM0csV0FBTCxDQUFpQjRGLE9BQXJCLENBQThCLFVBQVNyRixLQUFULEVBQWdCO0FBQUEsVUFDbkQsT0FBTyxVQUFTMkcsT0FBVCxFQUFrQkMsTUFBbEIsRUFBMEI7QUFBQSxZQUMvQixJQUFJM0QsQ0FBSixFQUFPNEQsTUFBUCxFQUFlcEksR0FBZixFQUFvQitELEtBQXBCLEVBQTJCd0QsR0FBM0IsQ0FEK0I7QUFBQSxZQUUvQixJQUFJLENBQUNjLGNBQUwsRUFBcUI7QUFBQSxjQUNuQjlHLEtBQUEsQ0FBTStHLFlBQU4sQ0FBbUIsU0FBbkIsRUFBOEJILE1BQTlCLEVBQXNDLElBQXRDLEVBQTRDLHdDQUE1QyxFQURtQjtBQUFBLGNBRW5CLE1BRm1CO0FBQUEsYUFGVTtBQUFBLFlBTS9CLElBQUksT0FBT1IsT0FBQSxDQUFRVCxHQUFmLEtBQXVCLFFBQXZCLElBQW1DUyxPQUFBLENBQVFULEdBQVIsQ0FBWXZELE1BQVosS0FBdUIsQ0FBOUQsRUFBaUU7QUFBQSxjQUMvRHBDLEtBQUEsQ0FBTStHLFlBQU4sQ0FBbUIsS0FBbkIsRUFBMEJILE1BQTFCLEVBQWtDLElBQWxDLEVBQXdDLDZCQUF4QyxFQUQrRDtBQUFBLGNBRS9ELE1BRitEO0FBQUEsYUFObEM7QUFBQSxZQVUvQjVHLEtBQUEsQ0FBTWdILElBQU4sR0FBYWhCLEdBQUEsR0FBTSxJQUFJYyxjQUF2QixDQVYrQjtBQUFBLFlBVy9CZCxHQUFBLENBQUlpQixNQUFKLEdBQWEsWUFBVztBQUFBLGNBQ3RCLElBQUloQyxZQUFKLENBRHNCO0FBQUEsY0FFdEJqRixLQUFBLENBQU1rSCxtQkFBTixHQUZzQjtBQUFBLGNBR3RCLElBQUk7QUFBQSxnQkFDRmpDLFlBQUEsR0FBZWpGLEtBQUEsQ0FBTW1ILGdCQUFOLEVBRGI7QUFBQSxlQUFKLENBRUUsT0FBT0MsTUFBUCxFQUFlO0FBQUEsZ0JBQ2ZwSCxLQUFBLENBQU0rRyxZQUFOLENBQW1CLE9BQW5CLEVBQTRCSCxNQUE1QixFQUFvQyxJQUFwQyxFQUEwQyx1QkFBMUMsRUFEZTtBQUFBLGdCQUVmLE1BRmU7QUFBQSxlQUxLO0FBQUEsY0FTdEIsT0FBT0QsT0FBQSxDQUFRO0FBQUEsZ0JBQ2JoQixHQUFBLEVBQUszRixLQUFBLENBQU1xSCxlQUFOLEVBRFE7QUFBQSxnQkFFYjdDLE1BQUEsRUFBUXdCLEdBQUEsQ0FBSXhCLE1BRkM7QUFBQSxnQkFHYjhDLFVBQUEsRUFBWXRCLEdBQUEsQ0FBSXNCLFVBSEg7QUFBQSxnQkFJYnJDLFlBQUEsRUFBY0EsWUFKRDtBQUFBLGdCQUtib0IsT0FBQSxFQUFTckcsS0FBQSxDQUFNdUgsV0FBTixFQUxJO0FBQUEsZ0JBTWJ2QixHQUFBLEVBQUtBLEdBTlE7QUFBQSxlQUFSLENBVGU7QUFBQSxhQUF4QixDQVgrQjtBQUFBLFlBNkIvQkEsR0FBQSxDQUFJd0IsT0FBSixHQUFjLFlBQVc7QUFBQSxjQUN2QixPQUFPeEgsS0FBQSxDQUFNK0csWUFBTixDQUFtQixPQUFuQixFQUE0QkgsTUFBNUIsQ0FEZ0I7QUFBQSxhQUF6QixDQTdCK0I7QUFBQSxZQWdDL0JaLEdBQUEsQ0FBSXlCLFNBQUosR0FBZ0IsWUFBVztBQUFBLGNBQ3pCLE9BQU96SCxLQUFBLENBQU0rRyxZQUFOLENBQW1CLFNBQW5CLEVBQThCSCxNQUE5QixDQURrQjtBQUFBLGFBQTNCLENBaEMrQjtBQUFBLFlBbUMvQlosR0FBQSxDQUFJMEIsT0FBSixHQUFjLFlBQVc7QUFBQSxjQUN2QixPQUFPMUgsS0FBQSxDQUFNK0csWUFBTixDQUFtQixPQUFuQixFQUE0QkgsTUFBNUIsQ0FEZ0I7QUFBQSxhQUF6QixDQW5DK0I7QUFBQSxZQXNDL0I1RyxLQUFBLENBQU0ySCxtQkFBTixHQXRDK0I7QUFBQSxZQXVDL0IzQixHQUFBLENBQUk0QixJQUFKLENBQVN4QixPQUFBLENBQVFuRyxNQUFqQixFQUF5Qm1HLE9BQUEsQ0FBUVQsR0FBakMsRUFBc0NTLE9BQUEsQ0FBUUUsS0FBOUMsRUFBcURGLE9BQUEsQ0FBUUcsUUFBN0QsRUFBdUVILE9BQUEsQ0FBUUksUUFBL0UsRUF2QytCO0FBQUEsWUF3Qy9CLElBQUtKLE9BQUEsQ0FBUS9GLElBQVIsSUFBZ0IsSUFBakIsSUFBMEIsQ0FBQytGLE9BQUEsQ0FBUUMsT0FBUixDQUFnQixjQUFoQixDQUEvQixFQUFnRTtBQUFBLGNBQzlERCxPQUFBLENBQVFDLE9BQVIsQ0FBZ0IsY0FBaEIsSUFBa0NyRyxLQUFBLENBQU1QLFdBQU4sQ0FBa0IwRyxvQkFEVTtBQUFBLGFBeENqQztBQUFBLFlBMkMvQjFILEdBQUEsR0FBTTJILE9BQUEsQ0FBUUMsT0FBZCxDQTNDK0I7QUFBQSxZQTRDL0IsS0FBS1EsTUFBTCxJQUFlcEksR0FBZixFQUFvQjtBQUFBLGNBQ2xCK0QsS0FBQSxHQUFRL0QsR0FBQSxDQUFJb0ksTUFBSixDQUFSLENBRGtCO0FBQUEsY0FFbEJiLEdBQUEsQ0FBSTZCLGdCQUFKLENBQXFCaEIsTUFBckIsRUFBNkJyRSxLQUE3QixDQUZrQjtBQUFBLGFBNUNXO0FBQUEsWUFnRC9CLElBQUk7QUFBQSxjQUNGLE9BQU93RCxHQUFBLENBQUlELElBQUosQ0FBU0ssT0FBQSxDQUFRL0YsSUFBakIsQ0FETDtBQUFBLGFBQUosQ0FFRSxPQUFPK0csTUFBUCxFQUFlO0FBQUEsY0FDZm5FLENBQUEsR0FBSW1FLE1BQUosQ0FEZTtBQUFBLGNBRWYsT0FBT3BILEtBQUEsQ0FBTStHLFlBQU4sQ0FBbUIsTUFBbkIsRUFBMkJILE1BQTNCLEVBQW1DLElBQW5DLEVBQXlDM0QsQ0FBQSxDQUFFNkUsUUFBRixFQUF6QyxDQUZRO0FBQUEsYUFsRGM7QUFBQSxXQURrQjtBQUFBLFNBQWpCLENBd0RqQyxJQXhEaUMsQ0FBN0IsQ0FkZ0Q7QUFBQSxPQUF6RCxDQWZtRDtBQUFBLE1BNkZuRDtBQUFBO0FBQUE7QUFBQSxNQUFBNUIscUJBQUEsQ0FBc0J2RyxTQUF0QixDQUFnQ29JLE1BQWhDLEdBQXlDLFlBQVc7QUFBQSxRQUNsRCxPQUFPLEtBQUtmLElBRHNDO0FBQUEsT0FBcEQsQ0E3Rm1EO0FBQUEsTUEyR25EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFBZCxxQkFBQSxDQUFzQnZHLFNBQXRCLENBQWdDZ0ksbUJBQWhDLEdBQXNELFlBQVc7QUFBQSxRQUMvRCxLQUFLSyxjQUFMLEdBQXNCLEtBQUtDLG1CQUFMLENBQXlCQyxJQUF6QixDQUE4QixJQUE5QixDQUF0QixDQUQrRDtBQUFBLFFBRS9ELElBQUlwRyxNQUFBLENBQU9xRyxXQUFYLEVBQXdCO0FBQUEsVUFDdEIsT0FBT3JHLE1BQUEsQ0FBT3FHLFdBQVAsQ0FBbUIsVUFBbkIsRUFBK0IsS0FBS0gsY0FBcEMsQ0FEZTtBQUFBLFNBRnVDO0FBQUEsT0FBakUsQ0EzR21EO0FBQUEsTUF1SG5EO0FBQUE7QUFBQTtBQUFBLE1BQUE5QixxQkFBQSxDQUFzQnZHLFNBQXRCLENBQWdDdUgsbUJBQWhDLEdBQXNELFlBQVc7QUFBQSxRQUMvRCxJQUFJcEYsTUFBQSxDQUFPc0csV0FBWCxFQUF3QjtBQUFBLFVBQ3RCLE9BQU90RyxNQUFBLENBQU9zRyxXQUFQLENBQW1CLFVBQW5CLEVBQStCLEtBQUtKLGNBQXBDLENBRGU7QUFBQSxTQUR1QztBQUFBLE9BQWpFLENBdkhtRDtBQUFBLE1Ba0luRDtBQUFBO0FBQUE7QUFBQSxNQUFBOUIscUJBQUEsQ0FBc0J2RyxTQUF0QixDQUFnQzRILFdBQWhDLEdBQThDLFlBQVc7QUFBQSxRQUN2RCxPQUFPdEIsWUFBQSxDQUFhLEtBQUtlLElBQUwsQ0FBVXFCLHFCQUFWLEVBQWIsQ0FEZ0Q7QUFBQSxPQUF6RCxDQWxJbUQ7QUFBQSxNQTZJbkQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUFuQyxxQkFBQSxDQUFzQnZHLFNBQXRCLENBQWdDd0gsZ0JBQWhDLEdBQW1ELFlBQVc7QUFBQSxRQUM1RCxJQUFJbEMsWUFBSixDQUQ0RDtBQUFBLFFBRTVEQSxZQUFBLEdBQWUsT0FBTyxLQUFLK0IsSUFBTCxDQUFVL0IsWUFBakIsS0FBa0MsUUFBbEMsR0FBNkMsS0FBSytCLElBQUwsQ0FBVS9CLFlBQXZELEdBQXNFLEVBQXJGLENBRjREO0FBQUEsUUFHNUQsUUFBUSxLQUFLK0IsSUFBTCxDQUFVc0IsaUJBQVYsQ0FBNEIsY0FBNUIsQ0FBUjtBQUFBLFFBQ0UsS0FBSyxrQkFBTCxDQURGO0FBQUEsUUFFRSxLQUFLLGlCQUFMO0FBQUEsVUFDRXJELFlBQUEsR0FBZW5DLElBQUEsQ0FBS3FCLEtBQUwsQ0FBV2MsWUFBQSxHQUFlLEVBQTFCLENBSG5CO0FBQUEsU0FINEQ7QUFBQSxRQVE1RCxPQUFPQSxZQVJxRDtBQUFBLE9BQTlELENBN0ltRDtBQUFBLE1BK0puRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQWlCLHFCQUFBLENBQXNCdkcsU0FBdEIsQ0FBZ0MwSCxlQUFoQyxHQUFrRCxZQUFXO0FBQUEsUUFDM0QsSUFBSSxLQUFLTCxJQUFMLENBQVV1QixXQUFWLElBQXlCLElBQTdCLEVBQW1DO0FBQUEsVUFDakMsT0FBTyxLQUFLdkIsSUFBTCxDQUFVdUIsV0FEZ0I7QUFBQSxTQUR3QjtBQUFBLFFBSTNELElBQUksbUJBQW1CdkYsSUFBbkIsQ0FBd0IsS0FBS2dFLElBQUwsQ0FBVXFCLHFCQUFWLEVBQXhCLENBQUosRUFBZ0U7QUFBQSxVQUM5RCxPQUFPLEtBQUtyQixJQUFMLENBQVVzQixpQkFBVixDQUE0QixlQUE1QixDQUR1RDtBQUFBLFNBSkw7QUFBQSxRQU8zRCxPQUFPLEVBUG9EO0FBQUEsT0FBN0QsQ0EvSm1EO0FBQUEsTUFrTG5EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQXBDLHFCQUFBLENBQXNCdkcsU0FBdEIsQ0FBZ0NvSCxZQUFoQyxHQUErQyxVQUFTeUIsTUFBVCxFQUFpQjVCLE1BQWpCLEVBQXlCcEMsTUFBekIsRUFBaUM4QyxVQUFqQyxFQUE2QztBQUFBLFFBQzFGLEtBQUtKLG1CQUFMLEdBRDBGO0FBQUEsUUFFMUYsT0FBT04sTUFBQSxDQUFPO0FBQUEsVUFDWjRCLE1BQUEsRUFBUUEsTUFESTtBQUFBLFVBRVpoRSxNQUFBLEVBQVFBLE1BQUEsSUFBVSxLQUFLd0MsSUFBTCxDQUFVeEMsTUFGaEI7QUFBQSxVQUdaOEMsVUFBQSxFQUFZQSxVQUFBLElBQWMsS0FBS04sSUFBTCxDQUFVTSxVQUh4QjtBQUFBLFVBSVp0QixHQUFBLEVBQUssS0FBS2dCLElBSkU7QUFBQSxTQUFQLENBRm1GO0FBQUEsT0FBNUYsQ0FsTG1EO0FBQUEsTUFpTW5EO0FBQUE7QUFBQTtBQUFBLE1BQUFkLHFCQUFBLENBQXNCdkcsU0FBdEIsQ0FBZ0NzSSxtQkFBaEMsR0FBc0QsWUFBVztBQUFBLFFBQy9ELE9BQU8sS0FBS2pCLElBQUwsQ0FBVXlCLEtBQVYsRUFEd0Q7QUFBQSxPQUFqRSxDQWpNbUQ7QUFBQSxNQXFNbkQsT0FBT3ZDLHFCQXJNNEM7QUFBQSxLQUFaLEU7Ozs7SUNmekMsSUFBSXdDLElBQUEsR0FBTy9KLE9BQUEsQ0FBUSxNQUFSLENBQVgsRUFDSWdLLE9BQUEsR0FBVWhLLE9BQUEsQ0FBUSxVQUFSLENBRGQsRUFFSWlLLE9BQUEsR0FBVSxVQUFTQyxHQUFULEVBQWM7QUFBQSxRQUN0QixPQUFPcEMsTUFBQSxDQUFPOUcsU0FBUCxDQUFpQm1JLFFBQWpCLENBQTBCaEgsSUFBMUIsQ0FBK0IrSCxHQUEvQixNQUF3QyxnQkFEekI7QUFBQSxPQUY1QixDO0lBTUFqSyxNQUFBLENBQU9DLE9BQVAsR0FBaUIsVUFBVXdILE9BQVYsRUFBbUI7QUFBQSxNQUNsQyxJQUFJLENBQUNBLE9BQUw7QUFBQSxRQUNFLE9BQU8sRUFBUCxDQUZnQztBQUFBLE1BSWxDLElBQUlsRSxNQUFBLEdBQVMsRUFBYixDQUprQztBQUFBLE1BTWxDd0csT0FBQSxDQUNJRCxJQUFBLENBQUtyQyxPQUFMLEVBQWN4QyxLQUFkLENBQW9CLElBQXBCLENBREosRUFFSSxVQUFVaUYsR0FBVixFQUFlO0FBQUEsUUFDYixJQUFJQyxLQUFBLEdBQVFELEdBQUEsQ0FBSUUsT0FBSixDQUFZLEdBQVosQ0FBWixFQUNJekosR0FBQSxHQUFNbUosSUFBQSxDQUFLSSxHQUFBLENBQUk5RSxLQUFKLENBQVUsQ0FBVixFQUFhK0UsS0FBYixDQUFMLEVBQTBCRSxXQUExQixFQURWLEVBRUl6RyxLQUFBLEdBQVFrRyxJQUFBLENBQUtJLEdBQUEsQ0FBSTlFLEtBQUosQ0FBVStFLEtBQUEsR0FBUSxDQUFsQixDQUFMLENBRlosQ0FEYTtBQUFBLFFBS2IsSUFBSSxPQUFPNUcsTUFBQSxDQUFPNUMsR0FBUCxDQUFQLEtBQXdCLFdBQTVCLEVBQXlDO0FBQUEsVUFDdkM0QyxNQUFBLENBQU81QyxHQUFQLElBQWNpRCxLQUR5QjtBQUFBLFNBQXpDLE1BRU8sSUFBSW9HLE9BQUEsQ0FBUXpHLE1BQUEsQ0FBTzVDLEdBQVAsQ0FBUixDQUFKLEVBQTBCO0FBQUEsVUFDL0I0QyxNQUFBLENBQU81QyxHQUFQLEVBQVkySixJQUFaLENBQWlCMUcsS0FBakIsQ0FEK0I7QUFBQSxTQUExQixNQUVBO0FBQUEsVUFDTEwsTUFBQSxDQUFPNUMsR0FBUCxJQUFjO0FBQUEsWUFBRTRDLE1BQUEsQ0FBTzVDLEdBQVAsQ0FBRjtBQUFBLFlBQWVpRCxLQUFmO0FBQUEsV0FEVDtBQUFBLFNBVE07QUFBQSxPQUZuQixFQU5rQztBQUFBLE1BdUJsQyxPQUFPTCxNQXZCMkI7QUFBQSxLOzs7O0lDTHBDdEQsT0FBQSxHQUFVRCxNQUFBLENBQU9DLE9BQVAsR0FBaUI2SixJQUEzQixDO0lBRUEsU0FBU0EsSUFBVCxDQUFjUyxHQUFkLEVBQWtCO0FBQUEsTUFDaEIsT0FBT0EsR0FBQSxDQUFJL0YsT0FBSixDQUFZLFlBQVosRUFBMEIsRUFBMUIsQ0FEUztBQUFBLEs7SUFJbEJ2RSxPQUFBLENBQVF1SyxJQUFSLEdBQWUsVUFBU0QsR0FBVCxFQUFhO0FBQUEsTUFDMUIsT0FBT0EsR0FBQSxDQUFJL0YsT0FBSixDQUFZLE1BQVosRUFBb0IsRUFBcEIsQ0FEbUI7QUFBQSxLQUE1QixDO0lBSUF2RSxPQUFBLENBQVF3SyxLQUFSLEdBQWdCLFVBQVNGLEdBQVQsRUFBYTtBQUFBLE1BQzNCLE9BQU9BLEdBQUEsQ0FBSS9GLE9BQUosQ0FBWSxNQUFaLEVBQW9CLEVBQXBCLENBRG9CO0FBQUEsSzs7OztJQ1g3QixJQUFJOUUsVUFBQSxHQUFhSyxPQUFBLENBQVEsYUFBUixDQUFqQixDO0lBRUFDLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQjhKLE9BQWpCLEM7SUFFQSxJQUFJYixRQUFBLEdBQVdyQixNQUFBLENBQU85RyxTQUFQLENBQWlCbUksUUFBaEMsQztJQUNBLElBQUl3QixjQUFBLEdBQWlCN0MsTUFBQSxDQUFPOUcsU0FBUCxDQUFpQjJKLGNBQXRDLEM7SUFFQSxTQUFTWCxPQUFULENBQWlCWSxJQUFqQixFQUF1QkMsUUFBdkIsRUFBaUNDLE9BQWpDLEVBQTBDO0FBQUEsTUFDdEMsSUFBSSxDQUFDbkwsVUFBQSxDQUFXa0wsUUFBWCxDQUFMLEVBQTJCO0FBQUEsUUFDdkIsTUFBTSxJQUFJRSxTQUFKLENBQWMsNkJBQWQsQ0FEaUI7QUFBQSxPQURXO0FBQUEsTUFLdEMsSUFBSXZKLFNBQUEsQ0FBVWlDLE1BQVYsR0FBbUIsQ0FBdkIsRUFBMEI7QUFBQSxRQUN0QnFILE9BQUEsR0FBVSxJQURZO0FBQUEsT0FMWTtBQUFBLE1BU3RDLElBQUkzQixRQUFBLENBQVNoSCxJQUFULENBQWN5SSxJQUFkLE1BQXdCLGdCQUE1QjtBQUFBLFFBQ0lJLFlBQUEsQ0FBYUosSUFBYixFQUFtQkMsUUFBbkIsRUFBNkJDLE9BQTdCLEVBREo7QUFBQSxXQUVLLElBQUksT0FBT0YsSUFBUCxLQUFnQixRQUFwQjtBQUFBLFFBQ0RLLGFBQUEsQ0FBY0wsSUFBZCxFQUFvQkMsUUFBcEIsRUFBOEJDLE9BQTlCLEVBREM7QUFBQTtBQUFBLFFBR0RJLGFBQUEsQ0FBY04sSUFBZCxFQUFvQkMsUUFBcEIsRUFBOEJDLE9BQTlCLENBZGtDO0FBQUEsSztJQWlCMUMsU0FBU0UsWUFBVCxDQUFzQkcsS0FBdEIsRUFBNkJOLFFBQTdCLEVBQXVDQyxPQUF2QyxFQUFnRDtBQUFBLE1BQzVDLEtBQUssSUFBSXZILENBQUEsR0FBSSxDQUFSLEVBQVc2SCxHQUFBLEdBQU1ELEtBQUEsQ0FBTTFILE1BQXZCLENBQUwsQ0FBb0NGLENBQUEsR0FBSTZILEdBQXhDLEVBQTZDN0gsQ0FBQSxFQUE3QyxFQUFrRDtBQUFBLFFBQzlDLElBQUlvSCxjQUFBLENBQWV4SSxJQUFmLENBQW9CZ0osS0FBcEIsRUFBMkI1SCxDQUEzQixDQUFKLEVBQW1DO0FBQUEsVUFDL0JzSCxRQUFBLENBQVMxSSxJQUFULENBQWMySSxPQUFkLEVBQXVCSyxLQUFBLENBQU01SCxDQUFOLENBQXZCLEVBQWlDQSxDQUFqQyxFQUFvQzRILEtBQXBDLENBRCtCO0FBQUEsU0FEVztBQUFBLE9BRE47QUFBQSxLO0lBUWhELFNBQVNGLGFBQVQsQ0FBdUJJLE1BQXZCLEVBQStCUixRQUEvQixFQUF5Q0MsT0FBekMsRUFBa0Q7QUFBQSxNQUM5QyxLQUFLLElBQUl2SCxDQUFBLEdBQUksQ0FBUixFQUFXNkgsR0FBQSxHQUFNQyxNQUFBLENBQU81SCxNQUF4QixDQUFMLENBQXFDRixDQUFBLEdBQUk2SCxHQUF6QyxFQUE4QzdILENBQUEsRUFBOUMsRUFBbUQ7QUFBQSxRQUUvQztBQUFBLFFBQUFzSCxRQUFBLENBQVMxSSxJQUFULENBQWMySSxPQUFkLEVBQXVCTyxNQUFBLENBQU8vRixNQUFQLENBQWMvQixDQUFkLENBQXZCLEVBQXlDQSxDQUF6QyxFQUE0QzhILE1BQTVDLENBRitDO0FBQUEsT0FETDtBQUFBLEs7SUFPbEQsU0FBU0gsYUFBVCxDQUF1QkksTUFBdkIsRUFBK0JULFFBQS9CLEVBQXlDQyxPQUF6QyxFQUFrRDtBQUFBLE1BQzlDLFNBQVNuSyxDQUFULElBQWMySyxNQUFkLEVBQXNCO0FBQUEsUUFDbEIsSUFBSVgsY0FBQSxDQUFleEksSUFBZixDQUFvQm1KLE1BQXBCLEVBQTRCM0ssQ0FBNUIsQ0FBSixFQUFvQztBQUFBLFVBQ2hDa0ssUUFBQSxDQUFTMUksSUFBVCxDQUFjMkksT0FBZCxFQUF1QlEsTUFBQSxDQUFPM0ssQ0FBUCxDQUF2QixFQUFrQ0EsQ0FBbEMsRUFBcUMySyxNQUFyQyxDQURnQztBQUFBLFNBRGxCO0FBQUEsT0FEd0I7QUFBQSxLOzs7O0lDdkNsRHJMLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQlAsVUFBakIsQztJQUVBLElBQUl3SixRQUFBLEdBQVdyQixNQUFBLENBQU85RyxTQUFQLENBQWlCbUksUUFBaEMsQztJQUVBLFNBQVN4SixVQUFULENBQXFCd0IsRUFBckIsRUFBeUI7QUFBQSxNQUN2QixJQUFJa0ssTUFBQSxHQUFTbEMsUUFBQSxDQUFTaEgsSUFBVCxDQUFjaEIsRUFBZCxDQUFiLENBRHVCO0FBQUEsTUFFdkIsT0FBT2tLLE1BQUEsS0FBVyxtQkFBWCxJQUNKLE9BQU9sSyxFQUFQLEtBQWMsVUFBZCxJQUE0QmtLLE1BQUEsS0FBVyxpQkFEbkMsSUFFSixPQUFPbEksTUFBUCxLQUFrQixXQUFsQixJQUVDLENBQUFoQyxFQUFBLEtBQU9nQyxNQUFBLENBQU9vSSxVQUFkLElBQ0FwSyxFQUFBLEtBQU9nQyxNQUFBLENBQU9xSSxLQURkLElBRUFySyxFQUFBLEtBQU9nQyxNQUFBLENBQU9zSSxPQUZkLElBR0F0SyxFQUFBLEtBQU9nQyxNQUFBLENBQU91SSxNQUhkLENBTm1CO0FBQUEsSztJQVV4QixDOzs7O0lDYkQ7QUFBQSxRQUFJaEYsT0FBSixFQUFhaUYsaUJBQWIsQztJQUVBakYsT0FBQSxHQUFVMUcsT0FBQSxDQUFRLG1CQUFSLENBQVYsQztJQUVBMEcsT0FBQSxDQUFRa0YsOEJBQVIsR0FBeUMsSUFBekMsQztJQUVBRCxpQkFBQSxHQUFxQixZQUFXO0FBQUEsTUFDOUIsU0FBU0EsaUJBQVQsQ0FBMkJ6QixHQUEzQixFQUFnQztBQUFBLFFBQzlCLEtBQUsyQixLQUFMLEdBQWEzQixHQUFBLENBQUkyQixLQUFqQixFQUF3QixLQUFLaEksS0FBTCxHQUFhcUcsR0FBQSxDQUFJckcsS0FBekMsRUFBZ0QsS0FBS2dHLE1BQUwsR0FBY0ssR0FBQSxDQUFJTCxNQURwQztBQUFBLE9BREY7QUFBQSxNQUs5QjhCLGlCQUFBLENBQWtCM0ssU0FBbEIsQ0FBNEI4SyxXQUE1QixHQUEwQyxZQUFXO0FBQUEsUUFDbkQsT0FBTyxLQUFLRCxLQUFMLEtBQWUsV0FENkI7QUFBQSxPQUFyRCxDQUw4QjtBQUFBLE1BUzlCRixpQkFBQSxDQUFrQjNLLFNBQWxCLENBQTRCK0ssVUFBNUIsR0FBeUMsWUFBVztBQUFBLFFBQ2xELE9BQU8sS0FBS0YsS0FBTCxLQUFlLFVBRDRCO0FBQUEsT0FBcEQsQ0FUOEI7QUFBQSxNQWE5QixPQUFPRixpQkFidUI7QUFBQSxLQUFaLEVBQXBCLEM7SUFpQkFqRixPQUFBLENBQVFzRixPQUFSLEdBQWtCLFVBQVNDLE9BQVQsRUFBa0I7QUFBQSxNQUNsQyxPQUFPLElBQUl2RixPQUFKLENBQVksVUFBU3NCLE9BQVQsRUFBa0JDLE1BQWxCLEVBQTBCO0FBQUEsUUFDM0MsT0FBT2dFLE9BQUEsQ0FBUXBLLElBQVIsQ0FBYSxVQUFTZ0MsS0FBVCxFQUFnQjtBQUFBLFVBQ2xDLE9BQU9tRSxPQUFBLENBQVEsSUFBSTJELGlCQUFKLENBQXNCO0FBQUEsWUFDbkNFLEtBQUEsRUFBTyxXQUQ0QjtBQUFBLFlBRW5DaEksS0FBQSxFQUFPQSxLQUY0QjtBQUFBLFdBQXRCLENBQVIsQ0FEMkI7QUFBQSxTQUE3QixFQUtKLE9BTEksRUFLSyxVQUFTbUMsR0FBVCxFQUFjO0FBQUEsVUFDeEIsT0FBT2dDLE9BQUEsQ0FBUSxJQUFJMkQsaUJBQUosQ0FBc0I7QUFBQSxZQUNuQ0UsS0FBQSxFQUFPLFVBRDRCO0FBQUEsWUFFbkNoQyxNQUFBLEVBQVE3RCxHQUYyQjtBQUFBLFdBQXRCLENBQVIsQ0FEaUI7QUFBQSxTQUxuQixDQURvQztBQUFBLE9BQXRDLENBRDJCO0FBQUEsS0FBcEMsQztJQWdCQVUsT0FBQSxDQUFRd0YsTUFBUixHQUFpQixVQUFTQyxRQUFULEVBQW1CO0FBQUEsTUFDbEMsT0FBT3pGLE9BQUEsQ0FBUTBGLEdBQVIsQ0FBWUQsUUFBQSxDQUFTRSxHQUFULENBQWEzRixPQUFBLENBQVFzRixPQUFyQixDQUFaLENBRDJCO0FBQUEsS0FBcEMsQztJQUlBdEYsT0FBQSxDQUFRMUYsU0FBUixDQUFrQnFCLFFBQWxCLEdBQTZCLFVBQVNWLEVBQVQsRUFBYTtBQUFBLE1BQ3hDLElBQUksT0FBT0EsRUFBUCxLQUFjLFVBQWxCLEVBQThCO0FBQUEsUUFDNUIsS0FBS0UsSUFBTCxDQUFVLFVBQVNnQyxLQUFULEVBQWdCO0FBQUEsVUFDeEIsT0FBT2xDLEVBQUEsQ0FBRyxJQUFILEVBQVNrQyxLQUFULENBRGlCO0FBQUEsU0FBMUIsRUFENEI7QUFBQSxRQUk1QixLQUFLLE9BQUwsRUFBYyxVQUFTNUIsS0FBVCxFQUFnQjtBQUFBLFVBQzVCLE9BQU9OLEVBQUEsQ0FBR00sS0FBSCxFQUFVLElBQVYsQ0FEcUI7QUFBQSxTQUE5QixDQUo0QjtBQUFBLE9BRFU7QUFBQSxNQVN4QyxPQUFPLElBVGlDO0FBQUEsS0FBMUMsQztJQVlBaEMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCd0csT0FBakI7Ozs7SUN4REEsQ0FBQyxVQUFTNEYsQ0FBVCxFQUFXO0FBQUEsTUFBQyxhQUFEO0FBQUEsTUFBYyxTQUFTaEksQ0FBVCxDQUFXZ0ksQ0FBWCxFQUFhO0FBQUEsUUFBQyxJQUFHQSxDQUFILEVBQUs7QUFBQSxVQUFDLElBQUloSSxDQUFBLEdBQUUsSUFBTixDQUFEO0FBQUEsVUFBWWdJLENBQUEsQ0FBRSxVQUFTQSxDQUFULEVBQVc7QUFBQSxZQUFDaEksQ0FBQSxDQUFFMEQsT0FBRixDQUFVc0UsQ0FBVixDQUFEO0FBQUEsV0FBYixFQUE0QixVQUFTQSxDQUFULEVBQVc7QUFBQSxZQUFDaEksQ0FBQSxDQUFFMkQsTUFBRixDQUFTcUUsQ0FBVCxDQUFEO0FBQUEsV0FBdkMsQ0FBWjtBQUFBLFNBQU47QUFBQSxPQUEzQjtBQUFBLE1BQW9HLFNBQVNDLENBQVQsQ0FBV0QsQ0FBWCxFQUFhaEksQ0FBYixFQUFlO0FBQUEsUUFBQyxJQUFHLGNBQVksT0FBT2dJLENBQUEsQ0FBRUUsQ0FBeEI7QUFBQSxVQUEwQixJQUFHO0FBQUEsWUFBQyxJQUFJRCxDQUFBLEdBQUVELENBQUEsQ0FBRUUsQ0FBRixDQUFJckssSUFBSixDQUFTb0IsQ0FBVCxFQUFXZSxDQUFYLENBQU4sQ0FBRDtBQUFBLFlBQXFCZ0ksQ0FBQSxDQUFFRyxDQUFGLENBQUl6RSxPQUFKLENBQVl1RSxDQUFaLENBQXJCO0FBQUEsV0FBSCxDQUF1QyxPQUFNRyxDQUFOLEVBQVE7QUFBQSxZQUFDSixDQUFBLENBQUVHLENBQUYsQ0FBSXhFLE1BQUosQ0FBV3lFLENBQVgsQ0FBRDtBQUFBLFdBQXpFO0FBQUE7QUFBQSxVQUE2RkosQ0FBQSxDQUFFRyxDQUFGLENBQUl6RSxPQUFKLENBQVkxRCxDQUFaLENBQTlGO0FBQUEsT0FBbkg7QUFBQSxNQUFnTyxTQUFTb0ksQ0FBVCxDQUFXSixDQUFYLEVBQWFoSSxDQUFiLEVBQWU7QUFBQSxRQUFDLElBQUcsY0FBWSxPQUFPZ0ksQ0FBQSxDQUFFQyxDQUF4QjtBQUFBLFVBQTBCLElBQUc7QUFBQSxZQUFDLElBQUlBLENBQUEsR0FBRUQsQ0FBQSxDQUFFQyxDQUFGLENBQUlwSyxJQUFKLENBQVNvQixDQUFULEVBQVdlLENBQVgsQ0FBTixDQUFEO0FBQUEsWUFBcUJnSSxDQUFBLENBQUVHLENBQUYsQ0FBSXpFLE9BQUosQ0FBWXVFLENBQVosQ0FBckI7QUFBQSxXQUFILENBQXVDLE9BQU1HLENBQU4sRUFBUTtBQUFBLFlBQUNKLENBQUEsQ0FBRUcsQ0FBRixDQUFJeEUsTUFBSixDQUFXeUUsQ0FBWCxDQUFEO0FBQUEsV0FBekU7QUFBQTtBQUFBLFVBQTZGSixDQUFBLENBQUVHLENBQUYsQ0FBSXhFLE1BQUosQ0FBVzNELENBQVgsQ0FBOUY7QUFBQSxPQUEvTztBQUFBLE1BQTJWLElBQUlxSSxDQUFKLEVBQU1wSixDQUFOLEVBQVFxSixDQUFBLEdBQUUsV0FBVixFQUFzQkMsQ0FBQSxHQUFFLFVBQXhCLEVBQW1DakgsQ0FBQSxHQUFFLFdBQXJDLEVBQWlEa0gsQ0FBQSxHQUFFLFlBQVU7QUFBQSxVQUFDLFNBQVNSLENBQVQsR0FBWTtBQUFBLFlBQUMsT0FBS2hJLENBQUEsQ0FBRWIsTUFBRixHQUFTOEksQ0FBZDtBQUFBLGNBQWlCakksQ0FBQSxDQUFFaUksQ0FBRixLQUFPQSxDQUFBLEVBQVAsRUFBV0EsQ0FBQSxHQUFFLElBQUYsSUFBUyxDQUFBakksQ0FBQSxDQUFFeUksTUFBRixDQUFTLENBQVQsRUFBV1IsQ0FBWCxHQUFjQSxDQUFBLEdBQUUsQ0FBaEIsQ0FBdEM7QUFBQSxXQUFiO0FBQUEsVUFBc0UsSUFBSWpJLENBQUEsR0FBRSxFQUFOLEVBQVNpSSxDQUFBLEdBQUUsQ0FBWCxFQUFhRyxDQUFBLEdBQUUsWUFBVTtBQUFBLGNBQUMsSUFBRyxPQUFPTSxnQkFBUCxLQUEwQnBILENBQTdCLEVBQStCO0FBQUEsZ0JBQUMsSUFBSXRCLENBQUEsR0FBRU0sUUFBQSxDQUFTcUksYUFBVCxDQUF1QixLQUF2QixDQUFOLEVBQW9DVixDQUFBLEdBQUUsSUFBSVMsZ0JBQUosQ0FBcUJWLENBQXJCLENBQXRDLENBQUQ7QUFBQSxnQkFBK0QsT0FBT0MsQ0FBQSxDQUFFVyxPQUFGLENBQVU1SSxDQUFWLEVBQVksRUFBQ1osVUFBQSxFQUFXLENBQUMsQ0FBYixFQUFaLEdBQTZCLFlBQVU7QUFBQSxrQkFBQ1ksQ0FBQSxDQUFFNkksWUFBRixDQUFlLEdBQWYsRUFBbUIsQ0FBbkIsQ0FBRDtBQUFBLGlCQUE3RztBQUFBLGVBQWhDO0FBQUEsY0FBcUssT0FBTyxPQUFPQyxZQUFQLEtBQXNCeEgsQ0FBdEIsR0FBd0IsWUFBVTtBQUFBLGdCQUFDd0gsWUFBQSxDQUFhZCxDQUFiLENBQUQ7QUFBQSxlQUFsQyxHQUFvRCxZQUFVO0FBQUEsZ0JBQUNmLFVBQUEsQ0FBV2UsQ0FBWCxFQUFhLENBQWIsQ0FBRDtBQUFBLGVBQTFPO0FBQUEsYUFBVixFQUFmLENBQXRFO0FBQUEsVUFBOFYsT0FBTyxVQUFTQSxDQUFULEVBQVc7QUFBQSxZQUFDaEksQ0FBQSxDQUFFaUcsSUFBRixDQUFPK0IsQ0FBUCxHQUFVaEksQ0FBQSxDQUFFYixNQUFGLEdBQVM4SSxDQUFULElBQVksQ0FBWixJQUFlRyxDQUFBLEVBQTFCO0FBQUEsV0FBaFg7QUFBQSxTQUFWLEVBQW5ELENBQTNWO0FBQUEsTUFBMHlCcEksQ0FBQSxDQUFFdEQsU0FBRixHQUFZO0FBQUEsUUFBQ2dILE9BQUEsRUFBUSxVQUFTc0UsQ0FBVCxFQUFXO0FBQUEsVUFBQyxJQUFHLEtBQUtULEtBQUwsS0FBYWMsQ0FBaEIsRUFBa0I7QUFBQSxZQUFDLElBQUdMLENBQUEsS0FBSSxJQUFQO0FBQUEsY0FBWSxPQUFPLEtBQUtyRSxNQUFMLENBQVksSUFBSThDLFNBQUosQ0FBYyxzQ0FBZCxDQUFaLENBQVAsQ0FBYjtBQUFBLFlBQXVGLElBQUl6RyxDQUFBLEdBQUUsSUFBTixDQUF2RjtBQUFBLFlBQWtHLElBQUdnSSxDQUFBLElBQUksZUFBWSxPQUFPQSxDQUFuQixJQUFzQixZQUFVLE9BQU9BLENBQXZDLENBQVA7QUFBQSxjQUFpRCxJQUFHO0FBQUEsZ0JBQUMsSUFBSUksQ0FBQSxHQUFFLENBQUMsQ0FBUCxFQUFTbkosQ0FBQSxHQUFFK0ksQ0FBQSxDQUFFekssSUFBYixDQUFEO0FBQUEsZ0JBQW1CLElBQUcsY0FBWSxPQUFPMEIsQ0FBdEI7QUFBQSxrQkFBd0IsT0FBTyxLQUFLQSxDQUFBLENBQUVwQixJQUFGLENBQU9tSyxDQUFQLEVBQVMsVUFBU0EsQ0FBVCxFQUFXO0FBQUEsb0JBQUNJLENBQUEsSUFBSSxDQUFBQSxDQUFBLEdBQUUsQ0FBQyxDQUFILEVBQUtwSSxDQUFBLENBQUUwRCxPQUFGLENBQVVzRSxDQUFWLENBQUwsQ0FBTDtBQUFBLG1CQUFwQixFQUE2QyxVQUFTQSxDQUFULEVBQVc7QUFBQSxvQkFBQ0ksQ0FBQSxJQUFJLENBQUFBLENBQUEsR0FBRSxDQUFDLENBQUgsRUFBS3BJLENBQUEsQ0FBRTJELE1BQUYsQ0FBU3FFLENBQVQsQ0FBTCxDQUFMO0FBQUEsbUJBQXhELENBQXZEO0FBQUEsZUFBSCxDQUEySSxPQUFNTyxDQUFOLEVBQVE7QUFBQSxnQkFBQyxPQUFPLEtBQUssQ0FBQUgsQ0FBQSxJQUFHLEtBQUt6RSxNQUFMLENBQVk0RSxDQUFaLENBQUgsQ0FBYjtBQUFBLGVBQXRTO0FBQUEsWUFBc1UsS0FBS2hCLEtBQUwsR0FBV2UsQ0FBWCxFQUFhLEtBQUsvTCxDQUFMLEdBQU95TCxDQUFwQixFQUFzQmhJLENBQUEsQ0FBRXNJLENBQUYsSUFBS0UsQ0FBQSxDQUFFLFlBQVU7QUFBQSxjQUFDLEtBQUksSUFBSUosQ0FBQSxHQUFFLENBQU4sRUFBUUMsQ0FBQSxHQUFFckksQ0FBQSxDQUFFc0ksQ0FBRixDQUFJbkosTUFBZCxDQUFKLENBQXlCa0osQ0FBQSxHQUFFRCxDQUEzQixFQUE2QkEsQ0FBQSxFQUE3QjtBQUFBLGdCQUFpQ0gsQ0FBQSxDQUFFakksQ0FBQSxDQUFFc0ksQ0FBRixDQUFJRixDQUFKLENBQUYsRUFBU0osQ0FBVCxDQUFsQztBQUFBLGFBQVosQ0FBalc7QUFBQSxXQUFuQjtBQUFBLFNBQXBCO0FBQUEsUUFBc2NyRSxNQUFBLEVBQU8sVUFBU3FFLENBQVQsRUFBVztBQUFBLFVBQUMsSUFBRyxLQUFLVCxLQUFMLEtBQWFjLENBQWhCLEVBQWtCO0FBQUEsWUFBQyxLQUFLZCxLQUFMLEdBQVdnQixDQUFYLEVBQWEsS0FBS2hNLENBQUwsR0FBT3lMLENBQXBCLENBQUQ7QUFBQSxZQUF1QixJQUFJQyxDQUFBLEdBQUUsS0FBS0ssQ0FBWCxDQUF2QjtBQUFBLFlBQW9DTCxDQUFBLEdBQUVPLENBQUEsQ0FBRSxZQUFVO0FBQUEsY0FBQyxLQUFJLElBQUl4SSxDQUFBLEdBQUUsQ0FBTixFQUFRcUksQ0FBQSxHQUFFSixDQUFBLENBQUU5SSxNQUFaLENBQUosQ0FBdUJrSixDQUFBLEdBQUVySSxDQUF6QixFQUEyQkEsQ0FBQSxFQUEzQjtBQUFBLGdCQUErQm9JLENBQUEsQ0FBRUgsQ0FBQSxDQUFFakksQ0FBRixDQUFGLEVBQU9nSSxDQUFQLENBQWhDO0FBQUEsYUFBWixDQUFGLEdBQTBEaEksQ0FBQSxDQUFFc0gsOEJBQUYsSUFBa0MxRSxPQUFBLENBQVFDLEdBQVIsQ0FBWSw2Q0FBWixFQUEwRG1GLENBQTFELEVBQTREQSxDQUFBLENBQUVlLEtBQTlELENBQWhJO0FBQUEsV0FBbkI7QUFBQSxTQUF4ZDtBQUFBLFFBQWtyQnhMLElBQUEsRUFBSyxVQUFTeUssQ0FBVCxFQUFXL0ksQ0FBWCxFQUFhO0FBQUEsVUFBQyxJQUFJc0osQ0FBQSxHQUFFLElBQUl2SSxDQUFWLEVBQVlzQixDQUFBLEdBQUU7QUFBQSxjQUFDNEcsQ0FBQSxFQUFFRixDQUFIO0FBQUEsY0FBS0MsQ0FBQSxFQUFFaEosQ0FBUDtBQUFBLGNBQVNrSixDQUFBLEVBQUVJLENBQVg7QUFBQSxhQUFkLENBQUQ7QUFBQSxVQUE2QixJQUFHLEtBQUtoQixLQUFMLEtBQWFjLENBQWhCO0FBQUEsWUFBa0IsS0FBS0MsQ0FBTCxHQUFPLEtBQUtBLENBQUwsQ0FBT3JDLElBQVAsQ0FBWTNFLENBQVosQ0FBUCxHQUFzQixLQUFLZ0gsQ0FBTCxHQUFPLENBQUNoSCxDQUFELENBQTdCLENBQWxCO0FBQUEsZUFBdUQ7QUFBQSxZQUFDLElBQUkwSCxDQUFBLEdBQUUsS0FBS3pCLEtBQVgsRUFBaUIwQixDQUFBLEdBQUUsS0FBSzFNLENBQXhCLENBQUQ7QUFBQSxZQUEyQmlNLENBQUEsQ0FBRSxZQUFVO0FBQUEsY0FBQ1EsQ0FBQSxLQUFJVixDQUFKLEdBQU1MLENBQUEsQ0FBRTNHLENBQUYsRUFBSTJILENBQUosQ0FBTixHQUFhYixDQUFBLENBQUU5RyxDQUFGLEVBQUkySCxDQUFKLENBQWQ7QUFBQSxhQUFaLENBQTNCO0FBQUEsV0FBcEY7QUFBQSxVQUFrSixPQUFPVixDQUF6SjtBQUFBLFNBQXBzQjtBQUFBLFFBQWcyQixTQUFRLFVBQVNQLENBQVQsRUFBVztBQUFBLFVBQUMsT0FBTyxLQUFLekssSUFBTCxDQUFVLElBQVYsRUFBZXlLLENBQWYsQ0FBUjtBQUFBLFNBQW4zQjtBQUFBLFFBQTg0QixXQUFVLFVBQVNBLENBQVQsRUFBVztBQUFBLFVBQUMsT0FBTyxLQUFLekssSUFBTCxDQUFVeUssQ0FBVixFQUFZQSxDQUFaLENBQVI7QUFBQSxTQUFuNkI7QUFBQSxRQUEyN0JrQixPQUFBLEVBQVEsVUFBU2xCLENBQVQsRUFBV0MsQ0FBWCxFQUFhO0FBQUEsVUFBQ0EsQ0FBQSxHQUFFQSxDQUFBLElBQUcsU0FBTCxDQUFEO0FBQUEsVUFBZ0IsSUFBSUcsQ0FBQSxHQUFFLElBQU4sQ0FBaEI7QUFBQSxVQUEyQixPQUFPLElBQUlwSSxDQUFKLENBQU0sVUFBU0EsQ0FBVCxFQUFXcUksQ0FBWCxFQUFhO0FBQUEsWUFBQ3BCLFVBQUEsQ0FBVyxZQUFVO0FBQUEsY0FBQ29CLENBQUEsQ0FBRXZHLEtBQUEsQ0FBTW1HLENBQU4sQ0FBRixDQUFEO0FBQUEsYUFBckIsRUFBbUNELENBQW5DLEdBQXNDSSxDQUFBLENBQUU3SyxJQUFGLENBQU8sVUFBU3lLLENBQVQsRUFBVztBQUFBLGNBQUNoSSxDQUFBLENBQUVnSSxDQUFGLENBQUQ7QUFBQSxhQUFsQixFQUF5QixVQUFTQSxDQUFULEVBQVc7QUFBQSxjQUFDSyxDQUFBLENBQUVMLENBQUYsQ0FBRDtBQUFBLGFBQXBDLENBQXZDO0FBQUEsV0FBbkIsQ0FBbEM7QUFBQSxTQUFoOUI7QUFBQSxPQUFaLEVBQXdtQ2hJLENBQUEsQ0FBRTBELE9BQUYsR0FBVSxVQUFTc0UsQ0FBVCxFQUFXO0FBQUEsUUFBQyxJQUFJQyxDQUFBLEdBQUUsSUFBSWpJLENBQVYsQ0FBRDtBQUFBLFFBQWEsT0FBT2lJLENBQUEsQ0FBRXZFLE9BQUYsQ0FBVXNFLENBQVYsR0FBYUMsQ0FBakM7QUFBQSxPQUE3bkMsRUFBaXFDakksQ0FBQSxDQUFFMkQsTUFBRixHQUFTLFVBQVNxRSxDQUFULEVBQVc7QUFBQSxRQUFDLElBQUlDLENBQUEsR0FBRSxJQUFJakksQ0FBVixDQUFEO0FBQUEsUUFBYSxPQUFPaUksQ0FBQSxDQUFFdEUsTUFBRixDQUFTcUUsQ0FBVCxHQUFZQyxDQUFoQztBQUFBLE9BQXJyQyxFQUF3dENqSSxDQUFBLENBQUU4SCxHQUFGLEdBQU0sVUFBU0UsQ0FBVCxFQUFXO0FBQUEsUUFBQyxTQUFTQyxDQUFULENBQVdBLENBQVgsRUFBYUssQ0FBYixFQUFlO0FBQUEsVUFBQyxjQUFZLE9BQU9MLENBQUEsQ0FBRTFLLElBQXJCLElBQTRCLENBQUEwSyxDQUFBLEdBQUVqSSxDQUFBLENBQUUwRCxPQUFGLENBQVV1RSxDQUFWLENBQUYsQ0FBNUIsRUFBNENBLENBQUEsQ0FBRTFLLElBQUYsQ0FBTyxVQUFTeUMsQ0FBVCxFQUFXO0FBQUEsWUFBQ29JLENBQUEsQ0FBRUUsQ0FBRixJQUFLdEksQ0FBTCxFQUFPcUksQ0FBQSxFQUFQLEVBQVdBLENBQUEsSUFBR0wsQ0FBQSxDQUFFN0ksTUFBTCxJQUFhRixDQUFBLENBQUV5RSxPQUFGLENBQVUwRSxDQUFWLENBQXpCO0FBQUEsV0FBbEIsRUFBeUQsVUFBU0osQ0FBVCxFQUFXO0FBQUEsWUFBQy9JLENBQUEsQ0FBRTBFLE1BQUYsQ0FBU3FFLENBQVQsQ0FBRDtBQUFBLFdBQXBFLENBQTdDO0FBQUEsU0FBaEI7QUFBQSxRQUFnSixLQUFJLElBQUlJLENBQUEsR0FBRSxFQUFOLEVBQVNDLENBQUEsR0FBRSxDQUFYLEVBQWFwSixDQUFBLEdBQUUsSUFBSWUsQ0FBbkIsRUFBcUJzSSxDQUFBLEdBQUUsQ0FBdkIsQ0FBSixDQUE2QkEsQ0FBQSxHQUFFTixDQUFBLENBQUU3SSxNQUFqQyxFQUF3Q21KLENBQUEsRUFBeEM7QUFBQSxVQUE0Q0wsQ0FBQSxDQUFFRCxDQUFBLENBQUVNLENBQUYsQ0FBRixFQUFPQSxDQUFQLEVBQTVMO0FBQUEsUUFBc00sT0FBT04sQ0FBQSxDQUFFN0ksTUFBRixJQUFVRixDQUFBLENBQUV5RSxPQUFGLENBQVUwRSxDQUFWLENBQVYsRUFBdUJuSixDQUFwTztBQUFBLE9BQXp1QyxFQUFnOUMsT0FBT3RELE1BQVAsSUFBZTJGLENBQWYsSUFBa0IzRixNQUFBLENBQU9DLE9BQXpCLElBQW1DLENBQUFELE1BQUEsQ0FBT0MsT0FBUCxHQUFlb0UsQ0FBZixDQUFuL0MsRUFBcWdEZ0ksQ0FBQSxDQUFFbUIsTUFBRixHQUFTbkosQ0FBOWdELEVBQWdoREEsQ0FBQSxDQUFFb0osSUFBRixHQUFPWixDQUFqMEU7QUFBQSxLQUFYLENBQSswRSxlQUFhLE9BQU9hLE1BQXBCLEdBQTJCQSxNQUEzQixHQUFrQyxJQUFqM0UsQzs7OztJQ0FELElBQUlwTixVQUFKLEVBQWdCcU4sSUFBaEIsRUFBc0JDLGVBQXRCLEVBQXVDMU0sRUFBdkMsRUFBMkNvQyxDQUEzQyxFQUE4QzVELFVBQTlDLEVBQTBEeUwsR0FBMUQsRUFBK0QwQyxLQUEvRCxFQUFzRUMsTUFBdEUsRUFBOEVqTyxHQUE5RSxFQUFtRmlDLElBQW5GLEVBQXlGK0QsYUFBekYsRUFBd0dDLGVBQXhHLEVBQXlIaEcsUUFBekgsRUFBbUlpTyxhQUFuSSxDO0lBRUFsTyxHQUFBLEdBQU1FLE9BQUEsQ0FBUSxTQUFSLENBQU4sRUFBMkJMLFVBQUEsR0FBYUcsR0FBQSxDQUFJSCxVQUE1QyxFQUF3RG1HLGFBQUEsR0FBZ0JoRyxHQUFBLENBQUlnRyxhQUE1RSxFQUEyRkMsZUFBQSxHQUFrQmpHLEdBQUEsQ0FBSWlHLGVBQWpILEVBQWtJaEcsUUFBQSxHQUFXRCxHQUFBLENBQUlDLFFBQWpKLEM7SUFFQWdDLElBQUEsR0FBTy9CLE9BQUEsQ0FBUSxrQkFBUixDQUFQLEVBQXlCNE4sSUFBQSxHQUFPN0wsSUFBQSxDQUFLNkwsSUFBckMsRUFBMkNJLGFBQUEsR0FBZ0JqTSxJQUFBLENBQUtpTSxhQUFoRSxDO0lBRUFILGVBQUEsR0FBa0IsVUFBU3pNLElBQVQsRUFBZTtBQUFBLE1BQy9CLElBQUlWLFFBQUosQ0FEK0I7QUFBQSxNQUUvQkEsUUFBQSxHQUFXLE1BQU1VLElBQWpCLENBRitCO0FBQUEsTUFHL0IsT0FBTztBQUFBLFFBQ0x3SixJQUFBLEVBQU07QUFBQSxVQUNKNUQsR0FBQSxFQUFLdEcsUUFERDtBQUFBLFVBRUpZLE1BQUEsRUFBUSxLQUZKO0FBQUEsU0FERDtBQUFBLFFBTUxxQixHQUFBLEVBQUs7QUFBQSxVQUNIcUUsR0FBQSxFQUFLNEcsSUFBQSxDQUFLeE0sSUFBTCxDQURGO0FBQUEsVUFFSEUsTUFBQSxFQUFRLEtBRkw7QUFBQSxTQU5BO0FBQUEsT0FId0I7QUFBQSxLQUFqQyxDO0lBaUJBZixVQUFBLEdBQWE7QUFBQSxNQUNYME4sT0FBQSxFQUFTO0FBQUEsUUFDUHRMLEdBQUEsRUFBSztBQUFBLFVBQ0hxRSxHQUFBLEVBQUssVUFERjtBQUFBLFVBRUgxRixNQUFBLEVBQVEsS0FGTDtBQUFBLFNBREU7QUFBQSxRQU1QNE0sTUFBQSxFQUFRO0FBQUEsVUFDTmxILEdBQUEsRUFBSyxVQURDO0FBQUEsVUFFTjFGLE1BQUEsRUFBUSxPQUZGO0FBQUEsU0FORDtBQUFBLFFBV1A2TSxNQUFBLEVBQVE7QUFBQSxVQUNObkgsR0FBQSxFQUFLLFVBQVNvSCxDQUFULEVBQVk7QUFBQSxZQUNmLElBQUlwTSxJQUFKLEVBQVVrRSxJQUFWLEVBQWdCQyxJQUFoQixDQURlO0FBQUEsWUFFZixPQUFPLHFCQUFzQixDQUFDLENBQUFuRSxJQUFBLEdBQVEsQ0FBQWtFLElBQUEsR0FBUSxDQUFBQyxJQUFBLEdBQU9pSSxDQUFBLENBQUVDLEtBQVQsQ0FBRCxJQUFvQixJQUFwQixHQUEyQmxJLElBQTNCLEdBQWtDaUksQ0FBQSxDQUFFeEcsUUFBM0MsQ0FBRCxJQUF5RCxJQUF6RCxHQUFnRTFCLElBQWhFLEdBQXVFa0ksQ0FBQSxDQUFFdkwsRUFBaEYsQ0FBRCxJQUF3RixJQUF4RixHQUErRmIsSUFBL0YsR0FBc0dvTSxDQUF0RyxDQUZkO0FBQUEsV0FEWDtBQUFBLFVBS045TSxNQUFBLEVBQVEsS0FMRjtBQUFBLFVBT05ZLE9BQUEsRUFBUyxVQUFTSixHQUFULEVBQWM7QUFBQSxZQUNyQixPQUFPQSxHQUFBLENBQUlKLElBQUosQ0FBU3lNLE1BREs7QUFBQSxXQVBqQjtBQUFBLFNBWEQ7QUFBQSxRQXNCUEcsTUFBQSxFQUFRO0FBQUEsVUFDTnRILEdBQUEsRUFBSyxpQkFEQztBQUFBLFVBR052RixPQUFBLEVBQVMsVUFBUzJNLENBQVQsRUFBWTtBQUFBLFlBQ25CLE9BQVFyTyxRQUFBLENBQVNxTyxDQUFULENBQUQsSUFBa0J0SSxhQUFBLENBQWNzSSxDQUFkLENBRE47QUFBQSxXQUhmO0FBQUEsU0F0QkQ7QUFBQSxRQTZCUEcsYUFBQSxFQUFlO0FBQUEsVUFDYnZILEdBQUEsRUFBSyxVQUFTb0gsQ0FBVCxFQUFZO0FBQUEsWUFDZixJQUFJcE0sSUFBSixDQURlO0FBQUEsWUFFZixPQUFPLDZCQUE4QixDQUFDLENBQUFBLElBQUEsR0FBT29NLENBQUEsQ0FBRUksT0FBVCxDQUFELElBQXNCLElBQXRCLEdBQTZCeE0sSUFBN0IsR0FBb0NvTSxDQUFwQyxDQUZ0QjtBQUFBLFdBREo7QUFBQSxTQTdCUjtBQUFBLFFBcUNQSyxLQUFBLEVBQU87QUFBQSxVQUNMekgsR0FBQSxFQUFLLGdCQURBO0FBQUEsVUFJTDlFLE9BQUEsRUFBUyxVQUFTSixHQUFULEVBQWM7QUFBQSxZQUNyQixLQUFLUyxVQUFMLENBQWdCVCxHQUFBLENBQUlKLElBQUosQ0FBU2dOLEtBQXpCLEVBRHFCO0FBQUEsWUFFckIsT0FBTzVNLEdBRmM7QUFBQSxXQUpsQjtBQUFBLFNBckNBO0FBQUEsUUE4Q1A2TSxNQUFBLEVBQVEsWUFBVztBQUFBLFVBQ2pCLE9BQU8sS0FBS3BNLFVBQUwsQ0FBZ0IsRUFBaEIsQ0FEVTtBQUFBLFNBOUNaO0FBQUEsUUFpRFBxTSxLQUFBLEVBQU87QUFBQSxVQUNMNUgsR0FBQSxFQUFLLFVBQVNvSCxDQUFULEVBQVk7QUFBQSxZQUNmLElBQUlwTSxJQUFKLENBRGU7QUFBQSxZQUVmLE9BQU8sMEJBQTJCLENBQUMsQ0FBQUEsSUFBQSxHQUFPb00sQ0FBQSxDQUFFQyxLQUFULENBQUQsSUFBb0IsSUFBcEIsR0FBMkJyTSxJQUEzQixHQUFrQ29NLENBQWxDLENBRm5CO0FBQUEsV0FEWjtBQUFBLFNBakRBO0FBQUEsUUF5RFBTLFlBQUEsRUFBYztBQUFBLFVBQ1o3SCxHQUFBLEVBQUssVUFBU29ILENBQVQsRUFBWTtBQUFBLFlBQ2YsSUFBSXBNLElBQUosQ0FEZTtBQUFBLFlBRWYsT0FBTyw0QkFBNkIsQ0FBQyxDQUFBQSxJQUFBLEdBQU9vTSxDQUFBLENBQUVJLE9BQVQsQ0FBRCxJQUFzQixJQUF0QixHQUE2QnhNLElBQTdCLEdBQW9Db00sQ0FBcEMsQ0FGckI7QUFBQSxXQURMO0FBQUEsU0F6RFA7QUFBQSxPQURFO0FBQUEsTUFtRVhVLFFBQUEsRUFBVTtBQUFBLFFBQ1JDLFNBQUEsRUFBVyxFQUNUL0gsR0FBQSxFQUFLZ0gsYUFBQSxDQUFjLFlBQWQsQ0FESSxFQURIO0FBQUEsUUFNUmdCLE9BQUEsRUFBUztBQUFBLFVBQ1BoSSxHQUFBLEVBQUtnSCxhQUFBLENBQWMsVUFBU0ksQ0FBVCxFQUFZO0FBQUEsWUFDN0IsSUFBSXBNLElBQUosQ0FENkI7QUFBQSxZQUU3QixPQUFPLGNBQWUsQ0FBQyxDQUFBQSxJQUFBLEdBQU9vTSxDQUFBLENBQUVhLE9BQVQsQ0FBRCxJQUFzQixJQUF0QixHQUE2QmpOLElBQTdCLEdBQW9Db00sQ0FBcEMsQ0FGTztBQUFBLFdBQTFCLENBREU7QUFBQSxTQU5EO0FBQUEsUUFjUmMsTUFBQSxFQUFRLEVBQ05sSSxHQUFBLEVBQUtnSCxhQUFBLENBQWMsU0FBZCxDQURDLEVBZEE7QUFBQSxRQW1CUm1CLE1BQUEsRUFBUSxFQUNObkksR0FBQSxFQUFLZ0gsYUFBQSxDQUFjLGFBQWQsQ0FEQyxFQW5CQTtBQUFBLE9BbkVDO0FBQUEsTUE0RlhvQixRQUFBLEVBQVU7QUFBQSxRQUNSZCxNQUFBLEVBQVE7QUFBQSxVQUNOdEgsR0FBQSxFQUFLLFdBREM7QUFBQSxVQUdOdkYsT0FBQSxFQUFTcUUsYUFISDtBQUFBLFNBREE7QUFBQSxPQTVGQztBQUFBLEtBQWIsQztJQXFHQWlJLE1BQUEsR0FBUztBQUFBLE1BQUMsUUFBRDtBQUFBLE1BQVcsWUFBWDtBQUFBLE1BQXlCLFNBQXpCO0FBQUEsTUFBb0MsU0FBcEM7QUFBQSxLQUFULEM7SUFFQTVNLEVBQUEsR0FBSyxVQUFTMk0sS0FBVCxFQUFnQjtBQUFBLE1BQ25CLE9BQU92TixVQUFBLENBQVd1TixLQUFYLElBQW9CRCxlQUFBLENBQWdCQyxLQUFoQixDQURSO0FBQUEsS0FBckIsQztJQUdBLEtBQUt2SyxDQUFBLEdBQUksQ0FBSixFQUFPNkgsR0FBQSxHQUFNMkMsTUFBQSxDQUFPdEssTUFBekIsRUFBaUNGLENBQUEsR0FBSTZILEdBQXJDLEVBQTBDN0gsQ0FBQSxFQUExQyxFQUErQztBQUFBLE1BQzdDdUssS0FBQSxHQUFRQyxNQUFBLENBQU94SyxDQUFQLENBQVIsQ0FENkM7QUFBQSxNQUU3Q3BDLEVBQUEsQ0FBRzJNLEtBQUgsQ0FGNkM7QUFBQSxLO0lBSy9DN04sTUFBQSxDQUFPQyxPQUFQLEdBQWlCSyxVOzs7O0lDdElqQixJQUFJWixVQUFKLEVBQWdCMFAsRUFBaEIsQztJQUVBMVAsVUFBQSxHQUFhSyxPQUFBLENBQVEsU0FBUixFQUFvQkwsVUFBakMsQztJQUVBTyxPQUFBLENBQVE4TixhQUFSLEdBQXdCcUIsRUFBQSxHQUFLLFVBQVN4QyxDQUFULEVBQVk7QUFBQSxNQUN2QyxPQUFPLFVBQVN1QixDQUFULEVBQVk7QUFBQSxRQUNqQixJQUFJcEgsR0FBSixDQURpQjtBQUFBLFFBRWpCLElBQUlySCxVQUFBLENBQVdrTixDQUFYLENBQUosRUFBbUI7QUFBQSxVQUNqQjdGLEdBQUEsR0FBTTZGLENBQUEsQ0FBRXVCLENBQUYsQ0FEVztBQUFBLFNBQW5CLE1BRU87QUFBQSxVQUNMcEgsR0FBQSxHQUFNNkYsQ0FERDtBQUFBLFNBSlU7QUFBQSxRQU9qQixJQUFJLEtBQUsvSixPQUFMLElBQWdCLElBQXBCLEVBQTBCO0FBQUEsVUFDeEIsT0FBUSxZQUFZLEtBQUtBLE9BQWxCLEdBQTZCa0UsR0FEWjtBQUFBLFNBQTFCLE1BRU87QUFBQSxVQUNMLE9BQU9BLEdBREY7QUFBQSxTQVRVO0FBQUEsT0FEb0I7QUFBQSxLQUF6QyxDO0lBZ0JBOUcsT0FBQSxDQUFRME4sSUFBUixHQUFlLFVBQVN4TSxJQUFULEVBQWU7QUFBQSxNQUM1QixRQUFRQSxJQUFSO0FBQUEsTUFDRSxLQUFLLFFBQUw7QUFBQSxRQUNFLE9BQU9pTyxFQUFBLENBQUcsVUFBU2pCLENBQVQsRUFBWTtBQUFBLFVBQ3BCLElBQUl0TyxHQUFKLENBRG9CO0FBQUEsVUFFcEIsT0FBTyxhQUFjLENBQUMsQ0FBQUEsR0FBQSxHQUFNc08sQ0FBQSxDQUFFa0IsSUFBUixDQUFELElBQWtCLElBQWxCLEdBQXlCeFAsR0FBekIsR0FBK0JzTyxDQUEvQixDQUZEO0FBQUEsU0FBZixDQUFQLENBRko7QUFBQSxNQU1FLEtBQUssU0FBTDtBQUFBLFFBQ0UsT0FBT2lCLEVBQUEsQ0FBRyxVQUFTakIsQ0FBVCxFQUFZO0FBQUEsVUFDcEIsSUFBSXRPLEdBQUosRUFBU2lDLElBQVQsQ0FEb0I7QUFBQSxVQUVwQixPQUFPLGNBQWUsQ0FBQyxDQUFBakMsR0FBQSxHQUFPLENBQUFpQyxJQUFBLEdBQU9xTSxDQUFBLENBQUV2TCxFQUFULENBQUQsSUFBaUIsSUFBakIsR0FBd0JkLElBQXhCLEdBQStCcU0sQ0FBQSxDQUFFbUIsSUFBdkMsQ0FBRCxJQUFpRCxJQUFqRCxHQUF3RHpQLEdBQXhELEdBQThEc08sQ0FBOUQsQ0FGRjtBQUFBLFNBQWYsQ0FBUCxDQVBKO0FBQUEsTUFXRSxLQUFLLFNBQUw7QUFBQSxRQUNFLE9BQU9pQixFQUFBLENBQUcsVUFBU2pCLENBQVQsRUFBWTtBQUFBLFVBQ3BCLElBQUl0TyxHQUFKLEVBQVNpQyxJQUFULENBRG9CO0FBQUEsVUFFcEIsT0FBTyxjQUFlLENBQUMsQ0FBQWpDLEdBQUEsR0FBTyxDQUFBaUMsSUFBQSxHQUFPcU0sQ0FBQSxDQUFFdkwsRUFBVCxDQUFELElBQWlCLElBQWpCLEdBQXdCZCxJQUF4QixHQUErQnFNLENBQUEsQ0FBRW9CLEdBQXZDLENBQUQsSUFBZ0QsSUFBaEQsR0FBdUQxUCxHQUF2RCxHQUE2RHNPLENBQTdELENBRkY7QUFBQSxTQUFmLENBQVAsQ0FaSjtBQUFBLE1BZ0JFO0FBQUEsUUFDRSxPQUFPLFVBQVNBLENBQVQsRUFBWTtBQUFBLFVBQ2pCLElBQUl0TyxHQUFKLENBRGlCO0FBQUEsVUFFakIsT0FBT3NCLElBQUEsR0FBTyxHQUFQLEdBQWMsQ0FBQyxDQUFBdEIsR0FBQSxHQUFNc08sQ0FBQSxDQUFFdkwsRUFBUixDQUFELElBQWdCLElBQWhCLEdBQXVCL0MsR0FBdkIsR0FBNkJzTyxDQUE3QixDQUZKO0FBQUEsU0FqQnZCO0FBQUEsT0FENEI7QUFBQSxLOzs7O0lDcEI5QixJQUFBM08sR0FBQSxFQUFBZ1EsTUFBQSxDOztNQUFBOUIsTUFBQSxDQUFPK0IsVUFBUCxHQUFxQixFOztJQUVyQmpRLEdBQUEsR0FBU08sT0FBQSxDQUFRLE9BQVIsQ0FBVCxDO0lBQ0F5UCxNQUFBLEdBQVN6UCxPQUFBLENBQVEsY0FBUixDQUFULEM7SUFFQVAsR0FBQSxDQUFJWSxNQUFKLEdBQWlCb1AsTUFBakIsQztJQUNBaFEsR0FBQSxDQUFJVyxVQUFKLEdBQWlCSixPQUFBLENBQVEsc0JBQVIsQ0FBakIsQztJQUVBMFAsVUFBQSxDQUFXalEsR0FBWCxHQUFvQkEsR0FBcEIsQztJQUNBaVEsVUFBQSxDQUFXRCxNQUFYLEdBQW9CQSxNQUFwQixDO0lBRUF4UCxNQUFBLENBQU9DLE9BQVAsR0FBaUJ3UCxVIiwic291cmNlUm9vdCI6Ii9zcmMifQ==