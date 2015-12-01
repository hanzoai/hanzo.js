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
  // source: src/crowdstart.coffee
  require.define('./crowdstart', function (module, exports, __dirname, __filename) {
    var Client, bindCbs, cachedToken, cookies, sessionTokenName, shim;
    shim = require('./shim');
    cookies = require('cookies-js');
    sessionTokenName = 'crowdstart-session';
    cachedToken = '';
    bindCbs = function (p, predicate, success, fail) {
      p = p.then(predicate);
      if (success != null) {
        p = p.then(success)
      }
      if (fail != null) {
        p = p['catch'](fail)
      }
      return p
    };
    Client = function () {
      Client.prototype.debug = false;
      Client.prototype.endpoint = 'https://api.crowdstart.com';
      Client.prototype.lastResponse = null;
      function Client(key1) {
        var fn, name, payment, ref, ref1, ref2, user, util;
        this.key = key1;
        user = {};
        ref = this.user;
        for (name in ref) {
          fn = ref[name];
          user[name] = fn.bind(this)
        }
        this.user = user;
        payment = {};
        ref1 = this.payment;
        for (name in ref1) {
          fn = ref1[name];
          payment[name] = fn.bind(this)
        }
        this.payment = payment;
        util = {};
        ref2 = this.util;
        for (name in ref2) {
          fn = ref2[name];
          util[name] = fn.bind(this)
        }
        this.util = util
      }
      Client.prototype.setToken = function (token) {
        if (window.location.protocol === 'file:') {
          cachedToken = token;
          return
        }
        return cookies.set(sessionTokenName, token, { expires: 604800 })
      };
      Client.prototype.getToken = function () {
        var ref;
        if (window.location.protocol === 'file:') {
          return cachedToken
        }
        return (ref = cookies.get(sessionTokenName)) != null ? ref : ''
      };
      Client.prototype.setKey = function (key) {
        return this.key = key
      };
      Client.prototype.setStore = function (id) {
        return this.storeId = id
      };
      Client.prototype.req = function (uri, data, method, token) {
        var opts, p;
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
        p = shim.xhr(opts);
        p.then(function (_this) {
          return function (res) {
            return _this.lastResponse = res
          }
        }(this));
        return p
      };
      Client.prototype.user = {
        exists: function (data, success, fail) {
          var uri;
          uri = '/account/exists/' + data.email;
          return bindCbs(this.req(uri, {}), function (res) {
            return res.status === 200
          }, success, fail)
        },
        create: function (data, success, fail) {
          var uri;
          uri = '/account/create';
          return bindCbs(this.req(uri, data), function (res) {
            if (res.status !== 200) {
              throw new Error('User Create Failed')
            }
            return res
          }, success, fail)
        },
        createConfirm: function (data, success, fail) {
          var uri;
          uri = '/account/create/confirm/' + data.tokenId;
          return bindCbs(this.req(uri, {}), function (res) {
            if (res.status !== 200) {
              throw new Error('User Create Confirmation Failed')
            }
            return res
          }, success, fail)
        },
        login: function (data, success, fail) {
          var uri;
          uri = '/account/login';
          return bindCbs(this.req(uri, data), function (_this) {
            return function (res) {
              if (res.status !== 200) {
                throw new Error('User Login Failed')
              }
              data = res.responseText;
              _this.setToken(data.token);
              return res
            }
          }(this), success, fail)
        },
        logout: function () {
          return this.setToken('')
        },
        reset: function (data, success, fail) {
          var uri;
          uri = '/account/reset?email=' + data.email;
          return bindCbs(this.req(uri, data, 'GET'), function (res) {
            if (res.status !== 200) {
              throw new Error('Password Reset Failed')
            }
            return res
          }, success, fail)
        },
        resetConfirm: function (data, success, fail) {
          var uri;
          uri = '/account/reset/confirm/' + data.tokenId;
          return bindCbs(this.req(uri, data), function (res) {
            if (res.status !== 200) {
              throw new Error('Password Reset Confirmation Failed')
            }
            return res
          }, success, fail)
        },
        account: function (success, fail) {
          var uri;
          uri = '/account';
          return bindCbs(this.req(uri, {}, 'GET', this.getToken()), function (res) {
            if (res.status !== 200) {
              throw new Error('Account Retrieval Failed')
            }
            return res
          }, success, fail)
        },
        updateAccount: function (data, success, fail) {
          var uri;
          uri = '/account';
          return bindCbs(this.req(uri, data, 'PATCH', this.getToken()), function (res) {
            if (res.status !== 200) {
              throw new Error('Account Update Failed')
            }
            return res
          }, success, fail)
        }
      };
      Client.prototype.payment = {
        authorize: function (data, success, fail) {
          var uri;
          uri = '/authorize';
          if (this.storeId != null) {
            uri = '/store/' + this.storeId + uri
          }
          return bindCbs(this.req(uri, data), function (res) {
            if (res.status !== 200) {
              throw new Error('Payment Authorization Failed')
            }
            return res
          }, success, fail)
        },
        capture: function (data, success, fail) {
          var uri;
          uri = '/capture/' + data.orderId;
          if (this.storeId != null) {
            uri = '/store/' + this.storeId + uri
          }
          return bindCbs(this.req(uri, {}), function (res) {
            if (res.status !== 200) {
              throw new Error('Payment Capture Failed')
            }
            return res
          }, success, fail)
        },
        charge: function (data, success, fail) {
          var uri;
          uri = '/charge';
          if (this.storeId != null) {
            uri = '/store/' + this.storeId + uri
          }
          return bindCbs(this.req(uri, data), function (res) {
            if (res.status !== 200) {
              throw new Error('Payment Charge Failed')
            }
            return res
          }, success, fail)
        },
        paypal: function (data, success, fail) {
          var uri;
          uri = '/paypal/pay';
          if (this.storeId != null) {
            uri = '/store/' + this.storeId + uri
          }
          return bindCbs(this.req(uri, data), function (res) {
            if (res.status !== 200) {
              throw new Error('Get Paypal PayKey Failed')
            }
            return res
          }, success, fail)
        },
        newReferrer: function (data, success, fail) {
          var uri;
          uri = '/referrer';
          return bindCbs(this.req(uri, data, 'POST'), function (res) {
            if (res.status !== 201) {
              throw new Error('Referrer Creation Failed')
            }
            return res
          }, success, fail)
        }
      };
      Client.prototype.util = {
        product: function (productId, success, fail) {
          var uri;
          uri = '/product/' + productId;
          if (this.storeId != null) {
            uri = '/store/' + this.storeId + uri
          }
          return bindCbs(this.req(uri, {}, 'GET'), function (res) {
            if (res.status !== 200) {
              throw new Error('Get Product Failed')
            }
            return res
          }, success, fail)
        },
        coupon: function (code, success, fail) {
          var uri;
          uri = '/coupon/' + code;
          if (this.storeId != null) {
            uri = '/store/' + this.storeId + uri
          }
          return bindCbs(this.req(uri, {}, 'GET'), function (res) {
            if (res.status !== 200) {
              throw new Error('Get Coupon Failed')
            }
            return res
          }, success, fail)
        }
      };
      return Client
    }();
    module.exports = Client
  });
  // source: src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    var Client;
    Client = require('./crowdstart');
    if (typeof window !== 'undefined') {
      if (window.Crowdstart != null) {
        window.Crowdstart.Client = Client
      } else {
        window.Crowdstart = { Client: Client }
      }
    }
    if (typeof module !== 'undefined' && module !== null) {
      module.exports = Client
    }
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyb3dkc3RhcnQuY29mZmVlIiwiaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbIkNsaWVudCIsImJpbmRDYnMiLCJjYWNoZWRUb2tlbiIsImNvb2tpZXMiLCJzZXNzaW9uVG9rZW5OYW1lIiwic2hpbSIsInJlcXVpcmUiLCJwIiwicHJlZGljYXRlIiwic3VjY2VzcyIsImZhaWwiLCJ0aGVuIiwicHJvdG90eXBlIiwiZGVidWciLCJlbmRwb2ludCIsImxhc3RSZXNwb25zZSIsImtleTEiLCJmbiIsIm5hbWUiLCJwYXltZW50IiwicmVmIiwicmVmMSIsInJlZjIiLCJ1c2VyIiwidXRpbCIsImtleSIsImJpbmQiLCJzZXRUb2tlbiIsInRva2VuIiwid2luZG93IiwibG9jYXRpb24iLCJwcm90b2NvbCIsInNldCIsImV4cGlyZXMiLCJnZXRUb2tlbiIsImdldCIsInNldEtleSIsInNldFN0b3JlIiwiaWQiLCJzdG9yZUlkIiwicmVxIiwidXJpIiwiZGF0YSIsIm1ldGhvZCIsIm9wdHMiLCJ1cmwiLCJyZXBsYWNlIiwiSlNPTiIsInN0cmluZ2lmeSIsImNvbnNvbGUiLCJsb2ciLCJ4aHIiLCJfdGhpcyIsInJlcyIsImV4aXN0cyIsImVtYWlsIiwic3RhdHVzIiwiY3JlYXRlIiwiRXJyb3IiLCJjcmVhdGVDb25maXJtIiwidG9rZW5JZCIsImxvZ2luIiwicmVzcG9uc2VUZXh0IiwibG9nb3V0IiwicmVzZXQiLCJyZXNldENvbmZpcm0iLCJhY2NvdW50IiwidXBkYXRlQWNjb3VudCIsImF1dGhvcml6ZSIsImNhcHR1cmUiLCJvcmRlcklkIiwiY2hhcmdlIiwicGF5cGFsIiwibmV3UmVmZXJyZXIiLCJwcm9kdWN0IiwicHJvZHVjdElkIiwiY291cG9uIiwiY29kZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJDcm93ZHN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxNQUFK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