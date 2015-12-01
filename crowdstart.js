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
  global.require = require;
  // source: src/client.coffee
  require.define('./client', function (module, exports, __dirname, __filename) {
    var Client;
    module.exports = Client = function () {
      Client.prototype.debug = false;
      Client.prototype.endpoint = 'https://api.crowdstart.com';
      function Client(key) {
        this.key = key
      }
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
  // source: src/crowdstart.coffee
  require.define('./crowdstart', function (module, exports, __dirname, __filename) {
    var Client, Crowdstart, api, cachedToken, cookies, sessionTokenName, statusOk;
    Client = require('./client');
    api = require('./api');
    cookies = require('cookies-js/dist/cookies');
    statusOk = require('./utils').statusOk;
    sessionTokenName = 'crowdstart-session';
    cachedToken = '';
    module.exports = Crowdstart = function () {
      function Crowdstart(key1) {
        var k, v;
        this.key = key1;
        this.client = new Client(this.key);
        for (k in api) {
          v = api[k];
          addApi(k, v)
        }
      }
      Crowdstart.prototype.addApi = function (api, blueprints) {
        var blueprint, name, results;
        results = [];
        for (name in blueprints) {
          blueprint = blueprints[name];
          results.push(function (name, blueprint) {
            var expects, method, mkuri, process;
            if (isFunction(blueprint)) {
              this[api][name] = function () {
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
            return this[api][name] = function (_this) {
              return function (data, cb) {
                var uri;
                uri = mkuri.call(_this, data);
                return _this.client.request(uri, data, method).then(function (res) {
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
                }).callback(cb)
              }
            }(this)
          }(name, blueprint))
        }
        return results
      };
      Crowdstart.prototype.setToken = function (token) {
        if (window.location.protocol === 'file:') {
          return cachedToken = token
        }
        return cookies.set(sessionTokenName, token, { expires: 604800 })
      };
      Crowdstart.prototype.getToken = function () {
        var ref;
        if (window.location.protocol === 'file:') {
          return cachedToken
        }
        return (ref = cookies.get(sessionTokenName)) != null ? ref : ''
      };
      Crowdstart.prototype.setKey = function (key) {
        return this.client.key = key
      };
      Crowdstart.prototype.setStore = function (id) {
        return this.storeId = id
      };
      return Crowdstart
    }()
  });
  // source: src/api.coffee
  require.define('./api', function (module, exports, __dirname, __filename) {
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
          }
        },
        resetConfirm: {
          uri: function (x) {
            return '/account/reset/confirm/' + x.tokenId
          }
        },
        account: {
          uri: '/account',
          method: 'GET'
        },
        updateAccount: {
          uri: '/account',
          method: 'PATCH'
        }
      },
      payment: {
        authorize: { uri: storeUri('/authorize') },
        capture: function (data, success, fail) {
          return {
            uri: storeId(function (x) {
              return '/capture/' + x.orderId
            })
          }
        },
        charge: function (data, success, fail) {
          return { uri: storeId('/charge') }
        },
        paypal: function (data, success, fail) {
          return { uri: storeId('/paypal/pay') }
        },
        newReferrer: function () {
          return {
            uri: '/referrer',
            expects: statusCreated
          }
        }
      },
      util: {
        product: {
          uri: storeId(function (x) {
            var ref1;
            return (ref1 = '/product/' + x.id) != null ? ref1 : x
          }),
          method: 'GET'
        },
        coupon: function (code, success, fail) {
          return {
            uri: storeId(function (x) {
              var ref1;
              return (ref1 = '/coupon/' + x.id) != null ? ref1 : x
            }),
            method: 'GET'
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
  // source: src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    var Client, Crowdstart;
    Client = require('./client');
    Crowdstart = require('./crowdstart');
    global.Crowdstart = Crowdstart;
    global.Crowdstart.Client = Client
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsaWVudC5jb2ZmZWUiLCJjcm93ZHN0YXJ0LmNvZmZlZSIsImFwaS5jb2ZmZWUiLCJ1dGlscy5jb2ZmZWUiLCJub2RlX21vZHVsZXMvY29va2llcy1qcy9kaXN0L2Nvb2tpZXMuanMiLCJpbmRleC5jb2ZmZWUiXSwibmFtZXMiOlsiQ2xpZW50IiwibW9kdWxlIiwiZXhwb3J0cyIsInByb3RvdHlwZSIsImRlYnVnIiwiZW5kcG9pbnQiLCJrZXkiLCJyZXF1ZXN0IiwidXJpIiwiZGF0YSIsIm1ldGhvZCIsInRva2VuIiwib3B0cyIsInVybCIsInJlcGxhY2UiLCJKU09OIiwic3RyaW5naWZ5IiwiY29uc29sZSIsImxvZyIsIlhociIsInNlbmQiLCJ0aGVuIiwicmVzIiwicmVzcG9uc2VUZXh0IiwiZXJyIiwibmV3RXJyb3IiLCJDcm93ZHN0YXJ0IiwiYXBpIiwiY2FjaGVkVG9rZW4iLCJjb29raWVzIiwic2Vzc2lvblRva2VuTmFtZSIsInN0YXR1c09rIiwicmVxdWlyZSIsImtleTEiLCJrIiwidiIsImNsaWVudCIsImFkZEFwaSIsImJsdWVwcmludHMiLCJibHVlcHJpbnQiLCJuYW1lIiwicmVzdWx0cyIsInB1c2giLCJleHBlY3RzIiwibWt1cmkiLCJwcm9jZXNzIiwiaXNGdW5jdGlvbiIsImFwcGx5IiwiYXJndW1lbnRzIiwiX3RoaXMiLCJjYiIsImNhbGwiLCJlcnJvciIsImNhbGxiYWNrIiwic2V0VG9rZW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInByb3RvY29sIiwic2V0IiwiZXhwaXJlcyIsImdldFRva2VuIiwicmVmIiwiZ2V0Iiwic2V0S2V5Iiwic2V0U3RvcmUiLCJpZCIsInN0b3JlSWQiLCJzdGF0dXNDcmVhdGVkIiwic3RvcmVVcmkiLCJ1IiwieCIsInVzZXIiLCJleGlzdHMiLCJyZWYxIiwicmVmMiIsInJlZjMiLCJlbWFpbCIsInVzZXJuYW1lIiwiY3JlYXRlIiwiY3JlYXRlQ29uZmlybSIsInRva2VuSWQiLCJsb2dpbiIsImxvZ291dCIsInJlc2V0IiwicmVzZXRDb25maXJtIiwiYWNjb3VudCIsInVwZGF0ZUFjY291bnQiLCJwYXltZW50IiwiYXV0aG9yaXplIiwiY2FwdHVyZSIsInN1Y2Nlc3MiLCJmYWlsIiwib3JkZXJJZCIsImNoYXJnZSIsInBheXBhbCIsIm5ld1JlZmVycmVyIiwidXRpbCIsInByb2R1Y3QiLCJjb3Vwb24iLCJjb2RlIiwiZm4iLCJpc1N0cmluZyIsInMiLCJzdGF0dXMiLCJFcnJvciIsIm1lc3NhZ2UiLCJyZXEiLCJ0eXBlIiwiZ2xvYmFsIiwidW5kZWZpbmVkIiwiZmFjdG9yeSIsImRvY3VtZW50IiwiQ29va2llcyIsInZhbHVlIiwib3B0aW9ucyIsImxlbmd0aCIsIl9kb2N1bWVudCIsIl9jYWNoZUtleVByZWZpeCIsIl9tYXhFeHBpcmVEYXRlIiwiRGF0ZSIsImRlZmF1bHRzIiwicGF0aCIsInNlY3VyZSIsIl9jYWNoZWREb2N1bWVudENvb2tpZSIsImNvb2tpZSIsIl9yZW5ld0NhY2hlIiwiX2NhY2hlIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiX2dldEV4dGVuZGVkT3B0aW9ucyIsIl9nZXRFeHBpcmVzRGF0ZSIsIl9nZW5lcmF0ZUNvb2tpZVN0cmluZyIsImV4cGlyZSIsImRvbWFpbiIsIl9pc1ZhbGlkRGF0ZSIsImRhdGUiLCJPYmplY3QiLCJ0b1N0cmluZyIsImlzTmFOIiwiZ2V0VGltZSIsIm5vdyIsIkluZmluaXR5IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29va2llU3RyaW5nIiwidG9VVENTdHJpbmciLCJfZ2V0Q2FjaGVGcm9tU3RyaW5nIiwiZG9jdW1lbnRDb29raWUiLCJjb29raWVDYWNoZSIsImNvb2tpZXNBcnJheSIsInNwbGl0IiwiaSIsImNvb2tpZUt2cCIsIl9nZXRLZXlWYWx1ZVBhaXJGcm9tQ29va2llU3RyaW5nIiwic2VwYXJhdG9ySW5kZXgiLCJpbmRleE9mIiwic3Vic3RyIiwiZGVjb2RlZEtleSIsImUiLCJfYXJlRW5hYmxlZCIsInRlc3RLZXkiLCJhcmVFbmFibGVkIiwiZW5h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