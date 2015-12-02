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
    var Api, blueprints, cookies, isFunction, newError, ref, sessionName, statusOk;
    blueprints = require('./blueprints');
    cookies = require('cookies-js/dist/cookies');
    ref = require('./utils'), isFunction = ref.isFunction, newError = ref.newError, statusOk = ref.statusOk;
    sessionName = 'crowdstart-session';
    module.exports = Api = function () {
      function Api(arg) {
        var k, ref1, v;
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
          this.client = new (require('./client'))({
            debug: this.debug,
            endpoint: this.endpoint,
            key: this.key
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
        cookies.set(sessionName, key, { expires: 604800 });
        return this.client.setUserKey(key)
      };
      Api.prototype.getUserKey = function () {
        var ref1;
        return (ref1 = cookies.get(sessionName)) != null ? ref1 : ''
      };
      Api.prototype.setStore = function (id) {
        return this.storeId = id
      };
      return Api
    }()
  });
  // source: src/blueprints.coffee
  require.define('./blueprints', function (module, exports, __dirname, __filename) {
    var blueprints, fn, i, isFunction, k, len, models, name, ref, ref1, ref2, statusCreated, statusNoContent, statusOk, storeUri, v;
    ref = require('./utils'), isFunction = ref.isFunction, statusOk = ref.statusOk, statusCreated = ref.statusCreated, statusNoContent = ref.statusNoContent;
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
    blueprints = {
      account: {
        get: {
          uri: '/account',
          method: 'GET',
          expects: statusOk
        },
        update: {
          uri: '/account',
          method: 'PATCH',
          expects: statusOk
        },
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
        enable: {
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
          },
          method: 'POST',
          expects: statusOk
        },
        confirm: {
          uri: function (x) {
            return '/account/reset/confirm/' + x.tokenId
          },
          method: 'POST',
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
        }
      }
    };
    models = [
      'coupon',
      'product',
      'referral',
      'referrer',
      'subscriber',
      'transaction',
      'user'
    ];
    fn = function (name) {
      var endpoint;
      endpoint = '/' + name;
      return blueprints[name] = {
        list: {
          uri: endpoint,
          method: 'GET'
        },
        get: {
          uri: function (x) {
            var ref1;
            return endpoint + '/' + ((ref1 = x.id) != null ? ref1 : x)
          },
          method: 'GET',
          expects: statusOk
        },
        create: {
          uri: endpoint,
          method: 'POST',
          expects: statusCreated
        },
        update: {
          uri: function (x) {
            var ref1;
            return endpoint + '/' + ((ref1 = x.id) != null ? ref1 : x)
          },
          method: 'PATCH',
          expects: statusOk
        },
        'delete': {
          uri: function (x) {
            var ref1;
            return endpoint + '/' + ((ref1 = x.id) != null ? ref1 : x)
          },
          method: 'DELETE',
          expects: statusNoContent
        }
      }
    };
    for (i = 0, len = models.length; i < len; i++) {
      name = models[i];
      fn(name)
    }
    ref1 = blueprints.coupon;
    for (k in ref1) {
      v = ref1[k];
      blueprints.product[k].uri = storeUri(function (x) {
        var ref2;
        return '/coupon/' + ((ref2 = x.code) != null ? ref2 : x)
      })
    }
    ref2 = blueprints.product;
    for (k in ref2) {
      v = ref2[k];
      blueprints.product[k].uri = storeUri(function (x) {
        var ref3, ref4;
        return '/product/' + ((ref3 = (ref4 = x.id) != null ? ref4 : x.slug) != null ? ref3 : x)
      })
    }
    module.exports = blueprints
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
  // source: src/client.coffee
  require.define('./client', function (module, exports, __dirname, __filename) {
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
  // source: src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    if (global.Crowdstart == null) {
      global.Crowdstart = {}
    }
    Crowdstart.Api = require('./api');
    Crowdstart.Client = require('./client');
    module.exports = Crowdstart
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS5jb2ZmZWUiLCJibHVlcHJpbnRzLmNvZmZlZSIsInV0aWxzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9jb29raWVzLWpzL2Rpc3QvY29va2llcy5qcyIsImNsaWVudC5jb2ZmZWUiLCJub2RlX21vZHVsZXMveGhyLXByb21pc2UtZXM2L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL3BhcnNlLWhlYWRlcnMuanMiLCJub2RlX21vZHVsZXMvdHJpbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mb3ItZWFjaC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm9rZW4vbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3pvdXNhbi96b3VzYW4tbWluLmpzIiwiaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbIkFwaSIsImJsdWVwcmludHMiLCJjb29raWVzIiwiaXNGdW5jdGlvbiIsIm5ld0Vycm9yIiwicmVmIiwic2Vzc2lvbk5hbWUiLCJzdGF0dXNPayIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiYXJnIiwiayIsInJlZjEiLCJ2IiwiZW5kcG9pbnQiLCJkZWJ1ZyIsImtleSIsImNsaWVudCIsImZ1bmMiLCJhcmdzIiwiY3RvciIsInByb3RvdHlwZSIsImNoaWxkIiwicmVzdWx0IiwiYXBwbHkiLCJPYmplY3QiLCJhcmd1bWVudHMiLCJhZGRCbHVlcHJpbnRzIiwiYXBpIiwiYmx1ZXByaW50IiwibmFtZSIsInJlc3VsdHMiLCJwdXNoIiwiX3RoaXMiLCJleHBlY3RzIiwibWV0aG9kIiwibWt1cmkiLCJwcm9jZXNzIiwidXJpIiwicmVzIiwiZGF0YSIsImNiIiwiY2FsbCIsInJlcXVlc3QiLCJ0aGVuIiwiZXJyb3IiLCJjYWxsYmFjayIsInNldEtleSIsInNldFVzZXJLZXkiLCJzZXQiLCJleHBpcmVzIiwiZ2V0VXNlcktleSIsImdldCIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwiZm4iLCJpIiwibGVuIiwibW9kZWxzIiwicmVmMiIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJzdG9yZVVyaSIsInUiLCJ4IiwiYWNjb3VudCIsInVwZGF0ZSIsImV4aXN0cyIsInJlZjMiLCJlbWFpbCIsInVzZXJuYW1lIiwiY3JlYXRlIiwiZW5hYmxlIiwidG9rZW5JZCIsImxvZ2luIiwidG9rZW4iLCJsb2dvdXQiLCJyZXNldCIsImNvbmZpcm0iLCJwYXltZW50IiwiYXV0aG9yaXplIiwiY2FwdHVyZSIsIm9yZGVySWQiLCJjaGFyZ2UiLCJwYXlwYWwiLCJsaXN0IiwibGVuZ3RoIiwiY291cG9uIiwicHJvZHVjdCIsImNvZGUiLCJyZWY0Iiwic2x1ZyIsImlzU3RyaW5nIiwicyIsInN0YXR1cyIsImVyciIsIm1lc3NhZ2UiLCJFcnJvciIsInJlcSIsInJlc3BvbnNlVGV4dCIsInR5cGUiLCJnbG9iYWwiLCJ1bmRlZmluZWQiLCJmYWN0b3J5Iiwid2luZG93IiwiZG9jdW1lbnQiLCJDb29raWVzIiwidmFsdWUiLCJvcHRpb25zIiwiX2RvY3VtZW50IiwiX2NhY2hlS2V5UHJlZml4IiwiX21heEV4cGlyZURhdGUiLCJEYXRlIiwiZGVmYXVsdHMiLCJwYXRoIiwic2VjdXJlIiwiX2NhY2hlZERvY3VtZW50Q29va2llIiwiY29va2llIiwiX3JlbmV3Q2FjaGUiLCJfY2FjaGUiLCJkZWNvZGVVUklDb21wb25lbnQiLCJfZ2V0RXh0ZW5kZWRPcHRpb25zIiwiX2dldEV4cGlyZXNEYXRlIiwiX2dlbmVyYXRlQ29va2llU3RyaW5nIiwiZXhwaXJlIiwiZG9tYWluIiwiX2lzVmFsaWREYXRlIiwiZGF0ZSIsInRvU3RyaW5nIiwiaXNOYU4iLCJnZXRUaW1lIiwibm93IiwiSW5maW5pdHkiLCJyZXBsYWNlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29va2llU3RyaW5nIiwidG9VVENTdHJpbmciLCJfZ2V0Q2FjaGVGcm9tU3RyaW5nIiwiZG9jdW1lbnRDb29raWUiLCJjb29raWVDYWNoZSIsImNvb2tpZXNBcnJheSIsInNwbGl0IiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJzdWJzdHIiLCJkZWNvZGVkS2V5IiwiZSIsImNvbnNvbGUiLCJfYXJlRW5hYmxlZCIsInRlc3RLZXkiLCJhcmVFbmFibGVkIiwiZW5hYmxlZCIsImNvb2tpZXNFeHBvcnQiLCJkZWZpbmUiLCJhbWQiLCJDbGllbnQiLCJYaHIiLCJQcm9taXNlIiwidXNlcktleSIsImdldEtleSIsIm9wdHMiLCJ1cmwiLCJKU09OIiwic3RyaW5naWZ5IiwibG9nIiwic2VuZCIsInBhcnNlIiwieGhyIiwiUGFyc2VIZWFkZXJzIiwiWE1MSHR0cFJlcXVlc3RQcm9taXNlIiwiREVGQVVMVF9DT05URU5UX1RZUEUiLCJoZWFkZXJzIiwiYXN5bmMiLCJwYXNzd29yZCIsImFzc2lnbiIsImNvbnN0cnVjdG9yIiwicmVzb2x2ZSIsInJlamVjdCIsImhlYWRlciIsIlhNTEh0dHBSZXF1ZXN0IiwiX2hhbmRsZUVycm9yIiwiX3hociIsIm9ubG9hZCIsIl9kZXRhY2hXaW5kb3dVbmxvYWQiLCJfZ2V0UmVzcG9uc2VUZXh0IiwiX2Vycm9yIiwiX2dldFJlc3BvbnNlVXJsIiwic3RhdHVzVGV4dCIsIl9nZXRIZWFkZXJzIiwib25lcnJvciIsIm9udGltZW91dCIsIm9uYWJvcnQiLCJfYXR0YWNoV2luZG93VW5sb2FkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJnZXRYSFIiLCJfdW5sb2FkSGFuZGxlciIsIl9oYW5kbGVXaW5kb3dVbmxvYWQiLCJiaW5kIiwiYXR0YWNoRXZlbnQiLCJkZXRhY2hFdmVudCIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImdldFJlc3BvbnNlSGVhZGVyIiwicmVzcG9uc2VVUkwiLCJ0ZXN0IiwicmVhc29uIiwiYWJvcnQiLCJ0cmltIiwiZm9yRWFjaCIsImlzQXJyYXkiLCJyb3ciLCJpbmRleCIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJzdHIiLCJsZWZ0IiwicmlnaHQiLCJoYXNPd25Qcm9wZXJ0eSIsIml0ZXJhdG9yIiwiY29udGV4dCIsIlR5cGVFcnJvciIsImZvckVhY2hBcnJheSIsImZvckVhY2hTdHJpbmciLCJmb3JFYWNoT2JqZWN0IiwiYXJyYXkiLCJzdHJpbmciLCJjaGFyQXQiLCJvYmplY3QiLCJzZXRUaW1lb3V0IiwiYWxlcnQiLCJwcm9tcHQiLCJQcm9taXNlSW5zcGVjdGlvbiIsInN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciIsInN0YXRlIiwiaXNGdWxmaWxsZWQiLCJpc1JlamVjdGVkIiwicmVmbGVjdCIsInByb21pc2UiLCJzZXR0bGUiLCJwcm9taXNlcyIsImFsbCIsIm1hcCIsInQiLCJuIiwieSIsInAiLCJvIiwiciIsImMiLCJmIiwic3BsaWNlIiwiTXV0YXRpb25PYnNlcnZlciIsImNyZWF0ZUVsZW1lbnQiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsInNldEF0dHJpYnV0ZSIsInNldEltbWVkaWF0ZSIsInN0YWNrIiwibCIsImEiLCJ0aW1lb3V0IiwiWm91c2FuIiwic29vbiIsIkNyb3dkc3RhcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxVQUFULEVBQXFCQyxPQUFyQixFQUE4QkMsVUFBOUIsRUFBMENDLFFBQTFDLEVBQW9EQyxHQUFwRCxFQUF5REMsV0FBekQsRUFBc0VDLFFBQXRFLEM7SUFFQU4sVUFBQSxHQUFhTyxPQUFBLENBQVEsY0FBUixDQUFiLEM7SUFFQU4sT0FBQSxHQUFVTSxPQUFBLENBQVEseUJBQVIsQ0FBVixDO0lBRUFILEdBQUEsR0FBTUcsT0FBQSxDQUFRLFNBQVIsQ0FBTixFQUEwQkwsVUFBQSxHQUFhRSxHQUFBLENBQUlGLFVBQTNDLEVBQXVEQyxRQUFBLEdBQVdDLEdBQUEsQ0FBSUQs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