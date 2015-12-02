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
      function Api(client) {
        var api, blueprints;
        this.client = client;
        if (!(this instanceof Api)) {
          return new Api(this.client)
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
      function Client(key1) {
        this.key = key1;
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
    Crowdstart.XhrClient = require('./xhr-client');
    Crowdstart.Client = function (key) {
      return Crowdstart.Api(Crowdstart.XhrClient(key))
    };
    module.exports = Crowdstart
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJtZXRob2RzLmNvZmZlZSIsInV0aWxzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9jb29raWVzLWpzL2Rpc3QvY29va2llcy5qcyIsInhoci1jbGllbnQuY29mZmVlIiwibm9kZV9tb2R1bGVzL3hoci1wcm9taXNlLWVzNi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL3RyaW0vaW5kZXguanMiLCJub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtZnVuY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy96b3VzYW4vem91c2FuLW1pbi5qcyIsImluZGV4LmNvZmZlZSJdLCJuYW1lcyI6WyJBcGkiLCJjYWNoZWRUb2tlbiIsImNvb2tpZXMiLCJpc0Z1bmN0aW9uIiwibWV0aG9kcyIsInJlZiIsInNlc3Npb25Ub2tlbk5hbWUiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiY2xpZW50IiwiYXBpIiwiYmx1ZXByaW50cyIsImFkZEJsdWVwcmludHMiLCJwcm90b3R5cGUiLCJibHVlcHJpbnQiLCJuYW1lIiwicmVzdWx0cyIsInB1c2giLCJfdGhpcyIsImV4cGVjdHMiLCJtZXRob2QiLCJta3VyaSIsInByb2Nlc3MiLCJhcHBseSIsImFyZ3VtZW50cyIsInVyaSIsInJlcyIsImRhdGEiLCJjYiIsInAiLCJjYWxsIiwicmVxdWVzdCIsInRoZW4iLCJlcnJvciIsIm5ld0Vycm9yIiwiY2FsbGJhY2siLCJzZXRUb2tlbiIsInRva2VuIiwid2luZG93IiwibG9jYXRpb24iLCJwcm90b2NvbCIsInNldCIsImV4cGlyZXMiLCJnZXRUb2tlbiIsInJlZjEiLCJnZXQiLCJzZXRLZXkiLCJrZXkiLCJzZXRTdG9yZSIsImlkIiwic3RvcmVJZCIsInN0YXR1c0NyZWF0ZWQiLCJzdG9yZVVyaSIsInUiLCJ4IiwidXNlciIsImV4aXN0cyIsInJlZjIiLCJyZWYzIiwiZW1haWwiLCJ1c2VybmFtZSIsImNyZWF0ZSIsImNyZWF0ZUNvbmZpcm0iLCJ0b2tlbklkIiwibG9naW4iLCJsb2dvdXQiLCJyZXNldCIsInJlc2V0Q29uZmlybSIsImFjY291bnQiLCJ1cGRhdGVBY2NvdW50IiwicGF5bWVudCIsImF1dGhvcml6ZSIsImNhcHR1cmUiLCJvcmRlcklkIiwiY2hhcmdlIiwicGF5cGFsIiwibmV3UmVmZXJyZXIiLCJ1dGlsIiwicHJvZHVjdCIsImNvdXBvbiIsImNvZGUiLCJzdWNjZXNzIiwiZmFpbCIsImZuIiwiaXNTdHJpbmciLCJzIiwic3RhdHVzIiwiZXJyIiwiRXJyb3IiLCJtZXNzYWdlIiwicmVxIiwidHlwZSIsImdsb2JhbCIsInVuZGVmaW5lZCIsImZhY3RvcnkiLCJkb2N1bWVudCIsIkNvb2tpZXMiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJsZW5ndGgiLCJfZG9jdW1lbnQiLCJfY2FjaGVLZXlQcmVmaXgiLCJfbWF4RXhwaXJlRGF0ZSIsIkRhdGUiLCJkZWZhdWx0cyIsInBhdGgiLCJzZWN1cmUiLCJfY2FjaGVkRG9jdW1lbnRDb29raWUiLCJjb29raWUiLCJfcmVuZXdDYWNoZSIsIl9jYWNoZSIsImRlY29kZVVSSUNvbXBvbmVudCIsIl9nZXRFeHRlbmRlZE9wdGlvbnMiLCJfZ2V0RXhwaXJlc0RhdGUiLCJfZ2VuZXJhdGVDb29raWVTdHJpbmciLCJleHBpcmUiLCJkb21haW4iLCJfaXNWYWxpZERhdGUiLCJkYXRlIiwiT2JqZWN0IiwidG9TdHJpbmciLCJpc05hTiIsImdldFRpbWUiLCJub3ciLCJJbmZpbml0eSIsInJlcGxhY2UiLCJlbmNvZGVVUklDb21wb25lbnQiLCJjb29raWVTdHJpbmciLCJ0b1VUQ1N0cmluZyIsIl9nZXRDYWNoZUZyb21TdHJpbmciLCJkb2N1bWVudENvb2tpZSIsImNvb2tpZUNhY2hlIiwiY29va2llc0FycmF5Iiwic3BsaXQiLCJpIiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJzdWJzdHIiLCJkZWNvZGVkS2V5IiwiZSIsImNvbnNvbGUiLCJfYXJlRW5hYmxlZCIsInRlc3RLZXkiLCJhcmVFbmFibGVkIiwiZW5hYmxlZCIsImNvb2tpZXNFeHBvcnQiLCJkZWZpbmUiLCJhbWQiLCJDbGllbnQiLCJYaHIiLCJQcm9taXNlIiwiZGVidWciLCJlbmRwb2ludCIsImtleTEiLCJvcHRzIiwidXJsIiwiSlNPTiIsInN0cmluZ2lmeSIsImxvZyIsInNlbmQiLCJyZXNwb25zZVRleHQiLCJQYXJzZUhlYWRlcnMiLCJYTUxIdHRwUmVxdWVzdFByb21pc2UiLCJERUZBVUxUX0NPTlRFTlRfVFlQRSIsImhlYWRlcnMiLCJhc3luYyIsInBhc3N3b3JkIiwiYXNzaWduIiwiY29uc3RydWN0b3IiLCJyZXNvbHZlIiwicmVqZWN0IiwiaGVhZGVyIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJfaGFuZGxlRXJyb3IiLCJfeGhyIiwib25sb2FkIiwiX2RldGFjaFdpbmRvd1VubG9hZCIsIl9nZXRSZXNwb25zZVRleHQiLCJfZXJyb3IiLCJfZ2V0UmVzcG9uc2VVcmwiLCJzdGF0dXNUZXh0IiwiX2dldEhlYWRlcnMiLCJvbmVycm9yIiwib250aW1lb3V0Iiwib25hYm9ydCIsIl9hdHRhY2hXaW5kb3dVbmxvYWQiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsImdldFhIUiIsIl91bmxvYWRIYW5kbGVyIiwiX2hhbmRsZVdpbmRvd1VubG9hZCIsImJpbmQiLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJwYXJzZSIsInJlc3BvbnNlVVJMIiwidGVzdCIsInJlYXNvbiIsImFib3J0IiwidHJpbSIsImZvckVhY2giLCJpc0FycmF5IiwiYXJnIiwicmVzdWx0Iiwicm93IiwiaW5kZXgiLCJzbGljZSIsInRvTG93ZXJDYXNlIiwic3RyIiwibGVmdCIsInJpZ2h0IiwiaGFzT3duUHJvcGVydHkiLCJsaXN0IiwiaXRlcmF0b3IiLCJjb250ZXh0IiwiVHlwZUVycm9yIiwiZm9yRWFjaEFycmF5IiwiZm9yRWFjaFN0cmluZyIsImZvckVhY2hPYmplY3QiLCJhcnJheSIsImxlbiIsInN0cmluZyIsImNoYXJBdCIsIm9iamVjdCIsImsiLCJzZXRUaW1lb3V0IiwiYWxlcnQiLCJjb25maXJtIiwicHJvbXB0IiwiUHJvbWlzZUluc3BlY3Rpb24iLCJzdXBwcmVzc1VuY2F1Z2h0UmVqZWN0aW9uRXJyb3IiLCJzdGF0ZSIsImlzRnVsZmlsbGVkIiwiaXNSZWplY3RlZCIsInJlZmxlY3QiLCJwcm9taXNlIiwic2V0dGxlIiwicHJvbWlzZXMiLCJhbGwiLCJtYXAiLCJ0IiwibiIsInkiLCJvIiwiciIsImMiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImNyZWF0ZUVsZW1lbnQiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsInNldEF0dHJpYnV0ZSIsInNldEltbWVkaWF0ZSIsInYiLCJzdGFjayIsImwiLCJhIiwidGltZW91dCIsIlpvdXNhbiIsInNvb24iLCJDcm93ZHN0YXJ0IiwiWGhyQ2xpZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLEdBQUosRUFBU0MsV0FBVCxFQUFzQkMsT0FBdEIsRUFBK0JDLFVBQS9CLEVBQTJDQyxPQUEzQyxFQUFvREMsR0FBcEQsRUFBeURDLGdCQUF6RCxFQUEyRUMsUUFBM0UsQztJQUVBSCxPQUFBLEdBQVVJLE9BQUEsQ0FBUSxXQUFSLENBQVYsQztJQUVBTixPQUFBLEdBQVVNLE9BQUEsQ0FBUSx5QkFBUixDQUFWLEM7SUFFQUgsR0FBQSxHQUFNRyxPQUFBLENBQVEsU0FBUixDQUFOLEVBQTBCTCxVQUFB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