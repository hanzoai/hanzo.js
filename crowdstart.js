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
        create: {
          uri: '/account/create',
          expects: function (x) {
            var bool;
            console.log('expects gets:', x);
            bool = statusOk(x) || statusCreated(x);
            console.log('expects:', bool);
            return bool
          }
        },
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJub2RlX21vZHVsZXMvY29va2llcy1qcy9kaXN0L2Nvb2tpZXMuanMiLCJ1dGlscy5jb2ZmZWUiLCJjbGllbnQveGhyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy94aHItcHJvbWlzZS1lczYvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvem91c2FuL3pvdXNhbi1taW4uanMiLCJibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwiYmx1ZXByaW50cy91cmkuY29mZmVlIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsiQXBpIiwiY29va2llcyIsImlzRnVuY3Rpb24iLCJuZXdFcnJvciIsInJlZiIsInN0YXR1c09rIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJTRVNTSU9OX05BTUUiLCJCTFVFUFJJTlRTIiwiQ0xJRU5UIiwib3B0cyIsImJsdWVwcmludHMiLCJjbGllbnQiLCJkZWJ1ZyIsImVuZHBvaW50IiwiayIsImtleSIsInYiLCJmdW5jIiwiYXJncyIsImN0b3IiLCJwcm90b3R5cGUiLCJjaGlsZCIsInJlc3VsdCIsImFwcGx5IiwiT2JqZWN0IiwiYXJndW1lbnRzIiwiYWRkQmx1ZXByaW50cyIsImFwaSIsImJsdWVwcmludCIsIm5hbWUiLCJyZXN1bHRzIiwicHVzaCIsIl90aGlzIiwiZXhwZWN0cyIsIm1ldGhvZCIsIm1rdXJpIiwicHJvY2VzcyIsInVyaSIsInJlcyIsImRhdGEiLCJjYiIsImNhbGwiLCJyZXF1ZXN0IiwidGhlbiIsInJlZjEiLCJlcnJvciIsImNhbGxiYWNrIiwic2V0S2V5Iiwic2V0VXNlcktleSIsInNldCIsImV4cGlyZXMiLCJnZXRVc2VyS2V5IiwiZ2V0Iiwic2V0U3RvcmUiLCJpZCIsInN0b3JlSWQiLCJnbG9iYWwiLCJ1bmRlZmluZWQiLCJmYWN0b3J5Iiwid2luZG93IiwiZG9jdW1lbnQiLCJFcnJvciIsIkNvb2tpZXMiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJsZW5ndGgiLCJfZG9jdW1lbnQiLCJfY2FjaGVLZXlQcmVmaXgiLCJfbWF4RXhwaXJlRGF0ZSIsIkRhdGUiLCJkZWZhdWx0cyIsInBhdGgiLCJzZWN1cmUiLCJfY2FjaGVkRG9jdW1lbnRDb29raWUiLCJjb29raWUiLCJfcmVuZXdDYWNoZSIsIl9jYWNoZSIsImRlY29kZVVSSUNvbXBvbmVudCIsIl9nZXRFeHRlbmRlZE9wdGlvbnMiLCJfZ2V0RXhwaXJlc0RhdGUiLCJfZ2VuZXJhdGVDb29raWVTdHJpbmciLCJleHBpcmUiLCJkb21haW4iLCJfaXNWYWxpZERhdGUiLCJkYXRlIiwidG9TdHJpbmciLCJpc05hTiIsImdldFRpbWUiLCJub3ciLCJJbmZpbml0eSIsInJlcGxhY2UiLCJlbmNvZGVVUklDb21wb25lbnQiLCJjb29raWVTdHJpbmciLCJ0b1VUQ1N0cmluZyIsIl9nZXRDYWNoZUZyb21TdHJpbmciLCJkb2N1bWVudENvb2tpZSIsImNvb2tpZUNhY2hlIiwiY29va2llc0FycmF5Iiwic3BsaXQiLCJpIiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJzdWJzdHIiLCJkZWNvZGVkS2V5IiwiZSIsImNvbnNvbGUiLCJfYXJlRW5hYmxlZCIsInRlc3RLZXkiLCJhcmVFbmFibGVkIiwiZW5hYmxlZCIsImNvb2tpZXNFeHBvcnQiLCJkZWZpbmUiLCJhbWQiLCJmbiIsImlzU3RyaW5nIiwicyIsInN0YXR1cyIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJlcnIiLCJtZXNzYWdlIiwicmVmMiIsInJlZjMiLCJyZWY0IiwicmVxIiwicmVzcG9uc2VUZXh0IiwidHlwZSIsIkNsaWVudCIsIlhociIsIlByb21pc2UiLCJhcmciLCJ1c2VyS2V5IiwiZ2V0S2V5IiwidXJsIiwiSlNPTiIsInN0cmluZ2lmeSIsImxvZyIsInNlbmQiLCJwYXJzZSIsInhociIsIlBhcnNlSGVhZGVycyIsIlhNTEh0dHBSZXF1ZXN0UHJvbWlzZSIsIkRFRkFVTFRfQ09OVEVOVF9UWVBFIiwiaGVhZGVycyIsImFzeW5jIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsImFzc2lnbiIsImNvbnN0cnVjdG9yIiwicmVzb2x2ZSIsInJlamVjdCIsImhlYWRlciIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJnZXRYSFIiLCJfdW5sb2FkSGFuZGxlciIsIl9oYW5kbGVXaW5kb3dVbmxvYWQiLCJiaW5kIiwiYXR0YWNoRXZlbnQiLCJkZXRhY2hFdmVudCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImdldFJlc3BvbnNlSGVhZGVyIiwicmVzcG9uc2VVUkwiLCJ0ZXN0IiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJyb3ciLCJpbmRleCIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJzdHIiLCJsZWZ0IiwicmlnaHQiLCJoYXNPd25Qcm9wZXJ0eSIsImxpc3QiLCJpdGVyYXRvciIsImNvbnRleHQiLCJUeXBlRXJyb3IiLCJmb3JFYWNoQXJyYXkiLCJmb3JFYWNoU3RyaW5nIiwiZm9yRWFjaE9iamVjdCIsImFycmF5IiwibGVuIiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0Iiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwicCIsIm8iLCJyIiwiYyIsInUiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImNyZWF0ZUVsZW1lbnQiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsInNldEF0dHJpYnV0ZSIsInNldEltbWVkaWF0ZSIsInN0YWNrIiwibCIsImEiLCJ0aW1lb3V0IiwiWm91c2FuIiwic29vbiIsImJ5SWQiLCJjcmVhdGVCbHVlcHJpbnQiLCJtb2RlbCIsIm1vZGVscyIsInN0b3JlUHJlZml4ZWQiLCJhY2NvdW50IiwidXBkYXRlIiwiZXhpc3RzIiwieCIsImVtYWlsIiwiY3JlYXRlIiwiYm9vbCIsImNyZWF0ZUNvbmZpcm0iLCJ0b2tlbklkIiwibG9naW4iLCJ0b2tlbiIsImxvZ291dCIsInJlc2V0IiwicmVzZXRDb25maXJtIiwiY2hlY2tvdXQiLCJhdXRob3JpemUiLCJjYXB0dXJlIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsInJlZmVycmVyIiwic3AiLCJjb2RlIiwic2x1ZyIsIkNyb3dkc3RhcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxPQUFULEVBQWtCQyxVQUFsQixFQUE4QkMsUUFBOUIsRUFBd0NDLEdBQXhDLEVBQTZDQyxRQUE3QyxDO0lBRUFKLE9BQUEsR0FBVUssT0FBQSxDQUFRLHlCQUFSLENBQVYsQztJQUVBRixHQUFBLEdBQU1FLE9BQUEsQ0FBUSxTQUFSLENBQU4sRUFB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