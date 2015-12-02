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
    var Api, cookies, isFunction, newError, ref, statusOk;
    cookies = require('cookies-js/dist/cookies');
    ref = require('./utils'), isFunction = ref.isFunction, newError = ref.newError, statusOk = ref.statusOk;
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
          return function (func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child
          }(Api, arguments, function () {
          })
        }
        endpoint = opts.endpoint, debug = opts.debug, key = opts.key, client = opts.client, blueprints = opts.blueprints;
        this.debug = debug;
        if (blueprints == null) {
          blueprints = Api.BLUEPRINTS
        }
        if (client) {
          this.client = client
        } else {
          this.client = new Api.CLIENT({
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
        var blueprint, name, results;
        if (this[api] == null) {
          this[api] = {}
        }
        results = [];
        for (name in blueprints) {
          blueprint = blueprints[name];
          results.push(function (_this) {
            return function (name, blueprint) {
              var expects, method, mkuri, process;
              if (isFunction(blueprint)) {
                _this[api][name] = function () {
                  return blueprint.apply(_this, arguments)
                };
                return
              }
              if (typeof blueprint.uri === 'string') {
                mkuri = function (res) {
                  return blueprint.uri
                }
              } else {
                mkuri = blueprint.uri
              }
              expects = blueprint.expects, method = blueprint.method, process = blueprint.process;
              if (expects == null) {
                expects = statusOk
              }
              if (method == null) {
                method = 'POST'
              }
              return _this[api][name] = function (data, cb) {
                var uri;
                uri = mkuri.call(_this, data);
                return _this.client.request(uri, data, method).then(function (res) {
                  var ref1;
                  if (((ref1 = res.data) != null ? ref1.error : void 0) != null) {
                    throw newError(data, res)
                  }
                  if (!expects(res)) {
                    throw newError(data, res)
                  }
                  if (process != null) {
                    process.call(_this, res)
                  }
                  return res
                }).callback(cb)
              }
            }
          }(this)(name, blueprint))
        }
        return results
      };
      Api.prototype.setKey = function (key) {
        return this.client.setKey(key)
      };
      Api.prototype.setUserKey = function (key) {
        cookies.set(Api.SESSION_NAME, key, { expires: 604800 });
        return this.client.setUserKey(key)
      };
      Api.prototype.getUserKey = function () {
        var ref1;
        return (ref1 = cookies.get(Api.SESSION_NAME)) != null ? ref1 : ''
      };
      Api.prototype.setStore = function (id) {
        return this.storeId = id
      };
      return Api
    }()
  });
  // source: node_modules/cookies-js/dist/cookies.js
  require.define('cookies-js/dist/cookies', function (module, exports, __dirname, __filename) {
    /*
 * Cookies.js - 1.2.2
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
    (function (global, undefined) {
      'use strict';
      var factory = function (window) {
        if (typeof window.document !== 'object') {
          throw new Error('Cookies.js requires a `window` with a `document` object')
        }
        var Cookies = function (key, value, options) {
          return arguments.length === 1 ? Cookies.get(key) : Cookies.set(key, value, options)
        };
        // Allows for setter injection in unit tests
        Cookies._document = window.document;
        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.';
        // Hurr hurr, :)
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');
        Cookies.defaults = {
          path: '/',
          secure: false
        };
        Cookies.get = function (key) {
          if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
            Cookies._renewCache()
          }
          var value = Cookies._cache[Cookies._cacheKeyPrefix + key];
          return value === undefined ? undefined : decodeURIComponent(value)
        };
        Cookies.set = function (key, value, options) {
          options = Cookies._getExtendedOptions(options);
          options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);
          Cookies._document.cookie = Cookies._generateCookieString(key, value, options);
          return Cookies
        };
        Cookies.expire = function (key, options) {
          return Cookies.set(key, undefined, options)
        };
        Cookies._getExtendedOptions = function (options) {
          return {
            path: options && options.path || Cookies.defaults.path,
            domain: options && options.domain || Cookies.defaults.domain,
            expires: options && options.expires || Cookies.defaults.expires,
            secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
          }
        };
        Cookies._isValidDate = function (date) {
          return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())
        };
        Cookies._getExpiresDate = function (expires, now) {
          now = now || new Date;
          if (typeof expires === 'number') {
            expires = expires === Infinity ? Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000)
          } else if (typeof expires === 'string') {
            expires = new Date(expires)
          }
          if (expires && !Cookies._isValidDate(expires)) {
            throw new Error('`expires` parameter cannot be converted to a valid Date instance')
          }
          return expires
        };
        Cookies._generateCookieString = function (key, value, options) {
          key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
          key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
          value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
          options = options || {};
          var cookieString = key + '=' + value;
          cookieString += options.path ? ';path=' + options.path : '';
          cookieString += options.domain ? ';domain=' + options.domain : '';
          cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
          cookieString += options.secure ? ';secure' : '';
          return cookieString
        };
        Cookies._getCacheFromString = function (documentCookie) {
          var cookieCache = {};
          var cookiesArray = documentCookie ? documentCookie.split('; ') : [];
          for (var i = 0; i < cookiesArray.length; i++) {
            var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);
            if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
              cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value
            }
          }
          return cookieCache
        };
        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
          // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
          var separatorIndex = cookieString.indexOf('=');
          // IE omits the "=" when the cookie value is an empty string
          separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;
          var key = cookieString.substr(0, separatorIndex);
          var decodedKey;
          try {
            decodedKey = decodeURIComponent(key)
          } catch (e) {
            if (console && typeof console.error === 'function') {
              console.error('Could not decode cookie with key "' + key + '"', e)
            }
          }
          return {
            key: decodedKey,
            value: cookieString.substr(separatorIndex + 1)  // Defer decoding value until accessed
          }
        };
        Cookies._renewCache = function () {
          Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
          Cookies._cachedDocumentCookie = Cookies._document.cookie
        };
        Cookies._areEnabled = function () {
          var testKey = 'cookies.js';
          var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
          Cookies.expire(testKey);
          return areEnabled
        };
        Cookies.enabled = Cookies._areEnabled();
        return Cookies
      };
      var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;
      // AMD support
      if (typeof define === 'function' && define.amd) {
        define(function () {
          return cookiesExport
        })  // CommonJS/Node.js support
      } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
          exports = module.exports = cookiesExport
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport
      } else {
        global.Cookies = cookiesExport
      }
    }(typeof window === 'undefined' ? this : window))
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
    var Client, Xhr;
    Xhr = require('xhr-promise-es6/lib');
    Xhr.Promise = require('broken/lib');
    module.exports = Client = function () {
      Client.prototype.debug = false;
      Client.prototype.endpoint = 'https://api.crowdstart.com';
      function Client(arg) {
        var ref;
        ref = arg != null ? arg : {}, this.key = ref.key, this.endpoint = ref.endpoint, this.debug = ref.debug;
        if (!(this instanceof Client)) {
          return new Client(this.key)
        }
      }
      Client.prototype.setKey = function (key) {
        return this.key = key
      };
      Client.prototype.setUserKey = function (key) {
        return this.userKey = key
      };
      Client.prototype.getKey = function () {
        return this.userKey || this.key
      };
      Client.prototype.request = function (uri, data, method, key) {
        var opts;
        if (method == null) {
          method = 'POST'
        }
        if (key == null) {
          key = this.getKey()
        }
        opts = {
          url: this.endpoint.replace(/\/$/, '') + uri + '?token=' + key,
          method: method,
          data: JSON.stringify(data)
        };
        if (this.debug) {
          console.log('REQUEST HEADER:', opts)
        }
        return new Xhr().send(opts).then(function (res) {
          res.data = res.responseText;
          return res
        })['catch'](function (res) {
          var err, error, ref;
          try {
            res.data = (ref = res.responseText) != null ? ref : JSON.parse(res.xhr.responseText)
          } catch (error) {
            err = error
          }
          throw newError(data, res)
        })
      };
      return Client
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
    ref1 = require('./blueprints/uri'), byId = ref1.byId, storePrefixed = ref1.storePrefixed;
    createBlueprint = function (name) {
      var endpoint;
      endpoint = '/' + name;
      return {
        list: {
          uri: endpoint,
          method: 'GET'
        },
        get: {
          uri: byId(name),
          method: 'GET'
        }
      }
    };
    blueprints = {
      account: {
        get: {
          uri: '/account',
          method: 'GET'
        },
        update: {
          uri: '/account',
          method: 'PATCH'
        },
        exists: {
          uri: function (x) {
            var ref2, ref3, ref4;
            return '/account/exists/' + ((ref2 = (ref3 = (ref4 = x.email) != null ? ref4 : x.username) != null ? ref3 : x.id) != null ? ref2 : x)
          },
          method: 'GET',
          process: function (res) {
            return res.data.exists
          }
        },
        create: { uri: '/account/create' },
        createConfirm: {
          uri: function (x) {
            return '/account/create/confirm/' + x.tokenId
          }
        },
        login: {
          uri: '/account/login',
          process: function (res) {
            this.setUserKey(res.data.token);
            return res
          }
        },
        logout: function () {
          return this.setUserKey('')
        },
        reset: {
          uri: function (x) {
            return '/account/reset?email=' + x.email
          }
        },
        resetConfirm: {
          uri: function (x) {
            return '/account/reset/confirm/' + x.tokenId
          }
        }
      },
      checkout: {
        authorize: { uri: storePrefixed('/authorize') },
        capture: {
          uri: storePrefixed(function (x) {
            return '/capture/' + x.orderId
          })
        },
        charge: { uri: storePrefixed('/charge') },
        paypal: { uri: storePrefixed('/paypal/pay') }
      },
      referrer: {
        create: {
          uri: '/referrer',
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
  // source: src/blueprints/uri.coffee
  require.define('./blueprints/uri', function (module, exports, __dirname, __filename) {
    var isFunction, sp;
    isFunction = require('./utils').isFunction;
    exports.storePrefixed = sp = function (u) {
      return function (x) {
        var uri;
        if (isFunction(u)) {
          uri = u(x)
        } else {
          uri = u
        }
        if (this.storeId != null) {
          return '/store/' + this.storeId + uri
        } else {
          return uri
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJub2RlX21vZHVsZXMvY29va2llcy1qcy9kaXN0L2Nvb2tpZXMuanMiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwiYmx1ZXByaW50cy91cmkuY29mZmVlIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsiQXBpIiwiY29va2llcyIsImlzRnVuY3Rpb24iLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJTRVNTSU9OX05BTUUiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJmdW5jIiwiYXJncyIsImN0b3IiLCJwcm90b3R5cGUiLCJjaGlsZCIsInJlc3VsdCIsImFwcGx5IiwiT2JqZWN0IiwiYXJndW1lbnRzIiwiYWRkQmx1ZXByaW50cyIsImFwaSIsImJsdWVwcmludCIsIm5hbWUiLCJyZXN1bHRzIiwicHVzaCIsIl90aGlzIiwiZXhwZWN0cyIsIm1ldGhvZCIsIm1rdXJpIiwicHJvY2VzcyIsInVyaSIsInJlcyIsImRhdGEiLCJjYiIsImNhbGwiLCJyZXF1ZXN0IiwidGhlbiIsInJlZjEiLCJlcnJvciIsImNhbGxiYWNrIiwic2V0S2V5Iiwic2V0VXNlcktleSIsInNldCIsImV4cGlyZXMiLCJnZXRVc2VyS2V5IiwiZ2V0Iiwic2V0U3RvcmUiLCJpZCIsInN0b3JlSWQiLCJnbG9iYWwiLCJ1bmRlZmluZWQiLCJmYWN0b3J5Iiwid2luZG93IiwiZG9jdW1lbnQiLCJFcnJvciIsIkNvb2tpZXMiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJsZW5ndGgiLCJfZG9jdW1lbnQiLCJfY2FjaGVLZXlQcmVmaXgiLCJfbWF4RXhwaXJlRGF0ZSIsIkRhdGUiLCJkZWZhdWx0cyIsInBhdGgiLCJzZWN1cmUiLCJfY2FjaGVkRG9jdW1lbnRDb29raWUiLCJjb29raWUiLCJfcmVuZXdDYWNoZSIsIl9jYWNoZSIsImRlY29kZVVSSUNvbXBvbmVudCIsIl9nZXRFeHRlbmRlZE9wdGlvbnMiLCJfZ2V0RXhwaXJlc0RhdGUiLCJfZ2VuZXJhdGVDb29raWVTdHJpbmciLCJleHBpcmUiLCJkb21haW4iLCJfaXNWYWxpZERhdGUiLCJkYXRlIiwidG9TdHJpbmciLCJpc05hTiIsImdldFRpbWUiLCJub3ciLCJJbmZpbml0eSIsInJlcGxhY2UiLCJlbmNvZGVVUklDb21wb25lbnQiLCJjb29raWVTdHJpbmciLCJ0b1VUQ1N0cmluZyIsIl9nZXRDYWNoZUZyb21TdHJpbmciLCJkb2N1bWVudENvb2tpZSIsImNvb2tpZUNhY2hlIiwiY29va2llc0FycmF5Iiwic3BsaXQiLCJpIiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJzdWJzdHIiLCJkZWNvZGVkS2V5IiwiZSIsImNvbnNvbGUiLCJfYXJlRW5hYmxlZCIsInRlc3RLZXkiLCJhcmVFbmFibGVkIiwiZW5hYmxlZCIsImNvb2tpZXNFeHBvcnQiLCJkZWZpbmUiLCJhbWQiLCJmbiIsImlzU3RyaW5nIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMiIsInJlZjMiLCJyZWY0IiwicmVxIiwicmVzcG9uc2VUZXh0IiwidHlwZSIsIkNsaWVudCIsIlhociIsIlByb21pc2UiLCJhcmciLCJ1c2VyS2V5IiwiZ2V0S2V5IiwidXJsIiwiSlNPTiIsInN0cmluZ2lmeSIsImxvZyIsInNlbmQiLCJwYXJzZSIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsImFzc2lnbiIsImNvbnN0cnVjdG9yIiwicmVzb2x2ZSIsInJlamVjdCIsImhlYWRlciIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJnZXRYSFIiLCJfdW5sb2FkSGFuZGxlciIsIl9oYW5kbGVXaW5kb3dVbmxvYWQiLCJiaW5kIiwiYXR0YWNoRXZlbnQiLCJkZXRhY2hFdmVudCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImdldFJlc3BvbnNlSGVhZGVyIiwicmVzcG9uc2VVUkwiLCJ0ZXN0IiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJyb3ciLCJpbmRleCIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJzdHIiLCJsZWZ0IiwicmlnaHQiLCJoYXNPd25Qcm9wZXJ0eSIsImxpc3QiLCJpdGVyYXRvciIsImNvbnRleHQiLCJUeXBlRXJyb3IiLCJmb3JFYWNoQXJyYXkiLCJmb3JFYWNoU3RyaW5nIiwiZm9yRWFjaE9iamVjdCIsImFycmF5IiwibGVuIiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0Iiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwicCIsIm8iLCJyIiwiYyIsInUiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImNyZWF0ZUVsZW1lbnQiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsInNldEF0dHJpYnV0ZSIsInNldEltbWVkaWF0ZSIsInN0YWNrIiwibCIsImEiLCJ0aW1lb3V0IiwiWm91c2FuIiwic29vbiIsImJ5SWQiLCJjcmVhdGVCbHVlcHJpbnQiLCJtb2RlbCIsIm1vZGVscyIsInN0b3JlUHJlZml4ZWQiLCJhY2NvdW50IiwidXBkYXRlIiwiZXhpc3RzIiwieCIsImVtYWlsIiwiY3JlYXRlIiwiY3JlYXRlQ29uZmlybSIsInRva2VuSWQiLCJsb2dpbiIsInRva2VuIiwibG9nb3V0IiwicmVzZXQiLCJyZXNldENvbmZpcm0iLCJjaGVja291dCIsImF1dGhvcml6ZSIsImNhcHR1cmUiLCJvcmRlcklkIiwiY2hhcmdlIiwicGF5cGFsIiwicmVmZXJyZXIiLCJzcCIsImNvZGUiLCJzbHVnIiwiQ3Jvd2RzdGFydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLE9BQVQsRUFBa0JDLFVBQWxCLEVBQThCQyxRQUE5QixFQUF3Q0MsR0FBeEMsRUFBNkNDLFFBQTdDLEM7SUFFQUosT0FBQSxHQUFVSyxPQUFBLENBQVEseUJBQVIsQ0FBVixDO0lBRUFGLEdBQUEsR0FBTUUsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkosVUFB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