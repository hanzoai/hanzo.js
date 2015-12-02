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
    var Api, cachedToken, cookies, isFunction, methods, ref, sessionTokenName, statusOk;
    methods = require('./methods');
    cookies = require('cookies-js/dist/cookies');
    ref = require('./utils'), isFunction = ref.isFunction, statusOk = ref.statusOk;
    sessionTokenName = 'crowdstart-session';
    cachedToken = '';
    module.exports = Api = function () {
      function Api(arg) {
        var api, blueprints, ref1;
        ref1 = arg != null ? arg : {}, this.endpoint = ref1.endpoint, this.debug = ref1.debug, this.key = ref1.key, this.client = ref1.client;
        if (!(this instanceof Api)) {
          return function (func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child
          }(Api, arguments, function () {
          })
        }
        if (!this.client) {
          this.client = new (require('./xhr-client'))({
            key: this.key,
            debug: this.debug,
            endpoint: this.endpoint
          })
        }
        for (api in methods) {
          blueprints = methods[api];
          this.addBlueprints(api, blueprints)
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
                  return blueprint.apply(this, arguments)
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
                var p, uri;
                uri = mkuri.call(_this, data);
                p = _this.client.request(uri, data, method);
                p.then(function (res) {
                  if (res.error != null) {
                    return newError(data, res)
                  }
                  if (!expects(res)) {
                    return newError(data, res)
                  }
                  if (process != null) {
                    process.call(this, res)
                  }
                  return res
                });
                p.callback(cb);
                return p
              }
            }
          }(this)(name, blueprint))
        }
        return results
      };
      Api.prototype.setToken = function (token) {
        if (window.location.protocol === 'file:') {
          return cachedToken = token
        }
        return cookies.set(sessionTokenName, token, { expires: 604800 })
      };
      Api.prototype.getToken = function () {
        var ref1;
        if (window.location.protocol === 'file:') {
          return cachedToken
        }
        return (ref1 = cookies.get(sessionTokenName)) != null ? ref1 : ''
      };
      Api.prototype.setKey = function (key) {
        return this.client.setKey(key)
      };
      Api.prototype.setStore = function (id) {
        return this.storeId = id
      };
      return Api
    }()
  });
  // source: src/methods.coffee
  require.define('./methods', function (module, exports, __dirname, __filename) {
    var isFunction, ref, statusCreated, statusOk, storeUri;
    ref = require('./utils'), isFunction = ref.isFunction, statusOk = ref.statusOk, statusCreated = ref.statusCreated;
    storeUri = function (u) {
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
    module.exports = {
      user: {
        exists: {
          uri: function (x) {
            var ref1, ref2, ref3;
            return '/account/exists/' + ((ref1 = (ref2 = (ref3 = x.email) != null ? ref3 : x.username) != null ? ref2 : x.id) != null ? ref1 : x)
          },
          method: 'GET',
          expects: statusOk,
          process: function (res) {
            return res.data.exists
          }
        },
        create: {
          uri: '/account/create',
          method: 'POST',
          expects: statusOk
        },
        createConfirm: {
          uri: function (x) {
            return '/account/create/confirm/' + x.tokenId
          },
          method: 'POST',
          expects: statusOk
        },
        login: {
          uri: '/account/login',
          method: 'POST',
          expects: statusOk,
          process: function (res) {
            this.setToken(res.data.token);
            return res
          }
        },
        logout: function () {
          return this.setToken('')
        },
        reset: {
          uri: function (x) {
            return '/account/reset?email=' + x.email
          },
          method: 'POST',
          expects: statusOk
        },
        resetConfirm: {
          uri: function (x) {
            return '/account/reset/confirm/' + x.tokenId
          },
          method: 'POST',
          expects: statusOk
        },
        account: {
          uri: '/account',
          method: 'GET',
          expects: statusOk
        },
        updateAccount: {
          uri: '/account',
          method: 'PATCH',
          expects: statusOk
        }
      },
      payment: {
        authorize: {
          uri: storeUri('/authorize'),
          method: 'POST',
          expects: statusOk
        },
        capture: {
          uri: storeUri(function (x) {
            return '/capture/' + x.orderId
          }),
          method: 'POST',
          expects: statusOk
        },
        charge: {
          uri: storeUri('/charge'),
          method: 'POST',
          expects: statusOk
        },
        paypal: {
          uri: storeUri('/paypal/pay'),
          method: 'POST',
          expects: statusOk
        },
        newReferrer: function () {
          return {
            uri: '/referrer',
            method: 'POST',
            expects: statusCreated
          }
        }
      },
      util: {
        product: {
          uri: storeUri(function (x) {
            var ref1;
            return (ref1 = '/product/' + x.id) != null ? ref1 : x
          }),
          method: 'GET',
          expects: statusOk
        },
        coupon: function (code, success, fail) {
          return {
            uri: storeUri(function (x) {
              var ref1;
              return (ref1 = '/coupon/' + x.id) != null ? ref1 : x
            }),
            method: 'GET',
            expects: statusOk
          }
        }
      }
    }
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
    exports.newError = function (data, res) {
      var err;
      if (res.error != null) {
        err = new Error(res.error.message);
        err.message = res.error.message
      } else {
        err = new Error('Request failed');
        err.message = 'Request failed'
      }
      err.req = data;
      err.res = res;
      res.data = res.data;
      err.status = res.status;
      err.type = res.error.type;
      return err
    }
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
  // source: src/xhr-client.coffee
  require.define('./xhr-client', function (module, exports, __dirname, __filename) {
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
      Client.prototype.request = function (uri, data, method, token) {
        var opts;
        if (method == null) {
          method = 'POST'
        }
        if (token == null) {
          token = this.key
        }
        opts = {
          url: this.endpoint.replace(/\/$/, '') + uri + '?token=' + token,
          method: method,
          data: JSON.stringify(data)
        };
        if (this.debug) {
          console.log('REQUEST HEADER:', opts)
        }
        return new Xhr().send(opts).then(function (res) {
          res.data = res.responseText;
          return res
        })['catch'](function (err) {
          throw newError(data, err)
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
  // source: src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    if (global.Crowdstart == null) {
      global.Crowdstart = {}
    }
    Crowdstart.Api = require('./api');
    Crowdstart.Client = require('./xhr-client');
    module.exports = Crowdstart
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJtZXRob2RzLmNvZmZlZSIsInV0aWxzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9jb29raWVzLWpzL2Rpc3QvY29va2llcy5qcyIsInhoci1jbGllbnQuY29mZmVlIiwibm9kZV9tb2R1bGVzL3hoci1wcm9taXNlLWVzNi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL3RyaW0vaW5kZXguanMiLCJub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtZnVuY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsImluZGV4LmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJjYWNoZWRUb2tlbiIsImNvb2tpZXMiLCJpc0Z1bmN0aW9uIiwibWV0aG9kcyIsInJlZiIsInNlc3Npb25Ub2tlbk5hbWUiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiYXJnIiwiYXBpIiwiYmx1ZXByaW50cyIsInJlZjEiLCJlbmRwb2ludCIsImRlYnVnIiwia2V5IiwiY2xpZW50IiwiZnVuYyIsImFyZ3MiLCJjdG9yIiwicHJvdG90eXBlIiwiY2hpbGQiLCJyZXN1bHQiLCJhcHBseSIsIk9iamVjdCIsImFyZ3VtZW50cyIsImFkZEJsdWVwcmludHMiLCJibHVlcHJpbnQiLCJuYW1lIiwicmVzdWx0cyIsInB1c2giLCJfdGhpcyIsImV4cGVjdHMiLCJtZXRob2QiLCJta3VyaSIsInByb2Nlc3MiLCJ1cmkiLCJyZXMiLCJkYXRhIiwiY2IiLCJwIiwiY2FsbCIsInJlcXVlc3QiLCJ0aGVuIiwiZXJyb3IiLCJuZXdFcnJvciIsImNhbGxiYWNrIiwic2V0VG9rZW4iLCJ0b2tlbiIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJzZXQiLCJleHBpcmVzIiwiZ2V0VG9rZW4iLCJnZXQiLCJzZXRLZXkiLCJzZXRTdG9yZSIsImlkIiwic3RvcmVJZCIsInN0YXR1c0NyZWF0ZWQiLCJzdG9yZVVyaSIsInUiLCJ4IiwidXNlciIsImV4aXN0cyIsInJlZjIiLCJyZWYzIiwiZW1haWwiLCJ1c2VybmFtZSIsImNyZWF0ZSIsImNyZWF0ZUNvbmZpcm0iLCJ0b2tlbklkIiwibG9naW4iLCJsb2dvdXQiLCJyZXNldCIsInJlc2V0Q29uZmlybSIsImFjY291bnQiLCJ1cGRhdGVBY2NvdW50IiwicGF5bWVudCIsImF1dGhvcml6ZSIsImNhcHR1cmUiLCJvcmRlcklkIiwiY2hhcmdlIiwicGF5cGFsIiwibmV3UmVmZXJyZXIiLCJ1dGlsIiwicHJvZHVjdCIsImNvdXBvbiIsImNvZGUiLCJzdWNjZXNzIiwiZmFpbCIsImZuIiwiaXNTdHJpbmciLCJzIiwic3RhdHVzIiwiZXJyIiwiRXJyb3IiLCJtZXNzYWdlIiwicmVxIiwidHlwZSIsImdsb2JhbCIsInVuZGVmaW5lZCIsImZhY3RvcnkiLCJkb2N1bWVudCIsIkNvb2tpZXMiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJsZW5ndGgiLCJfZG9jdW1lbnQiLCJfY2FjaGVLZXlQcmVmaXgiLCJfbWF4RXhwaXJlRGF0ZSIsIkRhdGUiLCJkZWZhdWx0cyIsInBhdGgiLCJzZWN1cmUiLCJfY2FjaGVkRG9jdW1lbnRDb29raWUiLCJjb29raWUiLCJfcmVuZXdDYWNoZSIsIl9jYWNoZSIsImRlY29kZVVSSUNvbXBvbmVudCIsIl9nZXRFeHRlbmRlZE9wdGlvbnMiLCJfZ2V0RXhwaXJlc0RhdGUiLCJfZ2VuZXJhdGVDb29raWVTdHJpbmciLCJleHBpcmUiLCJkb21haW4iLCJfaXNWYWxpZERhdGUiLCJkYXRlIiwidG9TdHJpbmciLCJpc05hTiIsImdldFRpbWUiLCJub3ciLCJJbmZpbml0eSIsInJlcGxhY2UiLCJlbmNvZGVVUklDb21wb25lbnQiLCJjb29raWVTdHJpbmciLCJ0b1VUQ1N0cmluZyIsIl9nZXRDYWNoZUZyb21TdHJpbmciLCJkb2N1bWVudENvb2tpZSIsImNvb2tpZUNhY2hlIiwiY29va2llc0FycmF5Iiwic3BsaXQiLCJpIiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJzdWJzdHIiLCJkZWNvZGVkS2V5IiwiZSIsImNvbnNvbGUiLCJfYXJlRW5hYmxlZCIsInRlc3RLZXkiLCJhcmVFbmFibGVkIiwiZW5hYmxlZCIsImNvb2tpZXNFeHBvcnQiLCJkZWZpbmUiLCJhbWQiLCJDbGllbnQiLCJYaHIiLCJQcm9taXNlIiwib3B0cyIsInVybCIsIkpTT04iLCJzdHJpbmdpZnkiLCJsb2ciLCJzZW5kIiwicmVzcG9uc2VUZXh0IiwiUGFyc2VIZWFkZXJzIiwiWE1MSHR0cFJlcXVlc3RQcm9taXNlIiwiREVGQVVMVF9DT05URU5UX1RZUEUiLCJoZWFkZXJzIiwiYXN5bmMiLCJwYXNzd29yZCIsImFzc2lnbiIsImNvbnN0cnVjdG9yIiwicmVzb2x2ZSIsInJlamVjdCIsImhlYWRlciIsInhociIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJnZXRYSFIiLCJfdW5sb2FkSGFuZGxlciIsIl9oYW5kbGVXaW5kb3dVbmxvYWQiLCJiaW5kIiwiYXR0YWNoRXZlbnQiLCJkZXRhY2hFdmVudCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImdldFJlc3BvbnNlSGVhZGVyIiwicGFyc2UiLCJyZXNwb25zZVVSTCIsInRlc3QiLCJyZWFzb24iLCJhYm9ydCIsInRyaW0iLCJmb3JFYWNoIiwiaXNBcnJheSIsInJvdyIsImluZGV4Iiwic2xpY2UiLCJ0b0xvd2VyQ2FzZSIsInN0ciIsImxlZnQiLCJyaWdodCIsImhhc093blByb3BlcnR5IiwibGlzdCIsIml0ZXJhdG9yIiwiY29udGV4dCIsIlR5cGVFcnJvciIsImZvckVhY2hBcnJheSIsImZvckVhY2hTdHJpbmciLCJmb3JFYWNoT2JqZWN0IiwiYXJyYXkiLCJsZW4iLCJzdHJpbmciLCJjaGFyQXQiLCJvYmplY3QiLCJrIiwic2V0VGltZW91dCIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsIlByb21pc2VJbnNwZWN0aW9uIiwic3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yIiwic3RhdGUiLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJyZWZsZWN0IiwicHJvbWlzZSIsInNldHRsZSIsInByb21pc2VzIiwiYWxsIiwibWFwIiwidCIsIm4iLCJ5IiwibyIsInIiLCJjIiwiZiIsInNwbGljZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJjcmVhdGVFbGVtZW50Iiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJzZXRBdHRyaWJ1dGUiLCJzZXRJbW1lZGlhdGUiLCJ2Iiwic3RhY2siLCJsIiwiYSIsInRpbWVvdXQiLCJab3VzYW4iLCJzb29uIiwiQ3Jvd2RzdGFydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLFdBQVQsRUFBc0JDLE9BQXRCLEVBQStCQyxVQUEvQixFQUEyQ0MsT0FBM0MsRUFBb0RDLEdBQXBELEVBQXlEQyxnQkFBekQsRUFBMkVDLFFBQTNFLEM7SUFFQUgsT0FBQSxHQUFVSSxPQUFBLENBQVEsV0FBUixDQUFWLEM7SUFFQU4sT0FBQSxHQUFVTSxPQUFBLENBQVEseUJBQVIsQ0FBVixDO0lBRUFILEdBQUEsR0FBTUcsT0FBQSxDQUFRLFNBQVIsQ0FBTixF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