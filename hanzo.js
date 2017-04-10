(function (exports) {
'use strict';

// src/utils.coffee
var updateParam;

var isFunction = function(fn) {
  return typeof fn === 'function';
};



var statusOk = function(res) {
  return res.status === 200;
};

var statusCreated = function(res) {
  return res.status === 201;
};



var GET = 'GET';

var POST = 'POST';

var PATCH = 'PATCH';

var newError = function(data, res, err) {
  var message, ref, ref1, ref2, ref3, ref4;
  if (res == null) {
    res = {};
  }
  message = (ref = (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0) != null ? ref : 'Request failed';
  if (err == null) {
    err = new Error(message);
  }
  err.data = res.data;
  err.msg = message;
  err.req = data;
  err.responseText = res.data;
  err.status = res.status;
  err.type = (ref3 = res.data) != null ? (ref4 = ref3.error) != null ? ref4.type : void 0 : void 0;
  return err;
};

updateParam = function(url, key, value) {
  var hash, re, separator;
  re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi');
  if (re.test(url)) {
    if (value != null) {
      return url.replace(re, '$1' + key + '=' + value + '$2$3');
    } else {
      hash = url.split('#');
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
      if (hash[1] != null) {
        url += '#' + hash[1];
      }
      return url;
    }
  } else {
    if (value != null) {
      separator = url.indexOf('?') !== -1 ? '&' : '?';
      hash = url.split('#');
      url = hash[0] + separator + key + '=' + value;
      if (hash[1] != null) {
        url += '#' + hash[1];
      }
      return url;
    } else {
      return url;
    }
  }
};

var updateQuery = function(url, data) {
  var k, v;
  if (typeof data !== 'object') {
    return url;
  }
  for (k in data) {
    v = data[k];
    url = updateParam(url, k, v);
  }
  return url;
};

// src/api.coffee
var Api;

Api = (function() {
  Api.BLUEPRINTS = {};

  Api.CLIENT = null;

  function Api(opts) {
    var blueprints, client, k, v;
    if (opts == null) {
      opts = {};
    }
    if (!(this instanceof Api)) {
      return new Api(opts);
    }
    blueprints = opts.blueprints, client = opts.client;
    this.client = client || new this.constructor.CLIENT(opts);
    if (blueprints == null) {
      blueprints = this.constructor.BLUEPRINTS;
    }
    for (k in blueprints) {
      v = blueprints[k];
      this.addBlueprints(k, v);
    }
  }

  Api.prototype.addBlueprints = function(api, blueprints) {
    var bp, name;
    if (this[api] == null) {
      this[api] = {};
    }
    for (name in blueprints) {
      bp = blueprints[name];
      this.addBlueprint(api, name, bp);
    }
  };

  Api.prototype.addBlueprint = function(api, name, bp) {
    var method;
    if (isFunction(bp)) {
      return this[api][name] = (function(_this) {
        return function() {
          return bp.apply(_this, arguments);
        };
      })(this);
    }
    if (bp.expects == null) {
      bp.expects = statusOk;
    }
    if (bp.method == null) {
      bp.method = GET;
    }
    method = (function(_this) {
      return function(data, cb) {
        var key;
        key = void 0;
        if (bp.useCustomerToken) {
          key = _this.client.getCustomerToken();
        }
        return _this.client.request(bp, data, key).then(function(res) {
          var ref, ref1;
          if (((ref = res.data) != null ? ref.error : void 0) != null) {
            throw newError(data, res);
          }
          if (!bp.expects(res)) {
            throw newError(data, res);
          }
          if (bp.process != null) {
            bp.process.call(_this, res);
          }
          return (ref1 = res.data) != null ? ref1 : res.body;
        }).callback(cb);
      };
    })(this);
    return this[api][name] = method;
  };

  Api.prototype.setKey = function(key) {
    return this.client.setKey(key);
  };

  Api.prototype.setCustomerToken = function(key) {
    return this.client.setCustomerToken(key);
  };

  Api.prototype.deleteCustomerToken = function() {
    return this.client.deleteCustomerToken();
  };

  Api.prototype.setStore = function(id) {
    this.storeId = id;
    return this.client.setStore(id);
  };

  return Api;

})();

var Api$1 = Api;

// node_modules/es-xhr-promise/node_modules/broken/dist/broken.mjs
// src/promise-inspection.coffee
var PromiseInspection;

var PromiseInspection$1 = PromiseInspection = (function() {
  function PromiseInspection(arg) {
    this.state = arg.state, this.value = arg.value, this.reason = arg.reason;
  }

  PromiseInspection.prototype.isFulfilled = function() {
    return this.state === 'fulfilled';
  };

  PromiseInspection.prototype.isRejected = function() {
    return this.state === 'rejected';
  };

  return PromiseInspection;

})();

// src/utils.coffee
var _undefined$1 = void 0;

var _undefinedString$1 = 'undefined';

// src/soon.coffee
var soon;

soon = (function() {
  var bufferSize, callQueue, cqYield, fq, fqStart;
  fq = [];
  fqStart = 0;
  bufferSize = 1024;
  callQueue = function() {
    var err;
    while (fq.length - fqStart) {
      try {
        fq[fqStart]();
      } catch (error) {
        err = error;
        if (typeof console !== 'undefined') {
          console.error(err);
        }
      }
      fq[fqStart++] = _undefined$1;
      if (fqStart === bufferSize) {
        fq.splice(0, bufferSize);
        fqStart = 0;
      }
    }
  };
  cqYield = (function() {
    var dd, mo;
    if (typeof MutationObserver !== _undefinedString$1) {
      dd = document.createElement('div');
      mo = new MutationObserver(callQueue);
      mo.observe(dd, {
        attributes: true
      });
      return function() {
        dd.setAttribute('a', 0);
      };
    }
    if (typeof setImmediate !== _undefinedString$1) {
      return function() {
        setImmediate(callQueue);
      };
    }
    return function() {
      setTimeout(callQueue, 0);
    };
  })();
  return function(fn) {
    fq.push(fn);
    if (fq.length - fqStart === 1) {
      cqYield();
    }
  };
})();

var soon$1 = soon;

// src/promise.coffee
var Promise$1;
var STATE_FULFILLED;
var STATE_PENDING;
var STATE_REJECTED;
var _undefined;
var rejectClient;
var resolveClient;

_undefined = void 0;

STATE_PENDING = _undefined;

STATE_FULFILLED = 'fulfilled';

STATE_REJECTED = 'rejected';

resolveClient = function(c, arg) {
  var err, yret;
  if (typeof c.y === 'function') {
    try {
      yret = c.y.call(_undefined, arg);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.resolve(arg);
  }
};

rejectClient = function(c, reason) {
  var err, yret;
  if (typeof c.n === 'function') {
    try {
      yret = c.n.call(_undefined, reason);
      c.p.resolve(yret);
    } catch (error) {
      err = error;
      c.p.reject(err);
    }
  } else {
    c.p.reject(reason);
  }
};

Promise$1 = (function() {
  function Promise(fn) {
    if (fn) {
      fn((function(_this) {
        return function(arg) {
          return _this.resolve(arg);
        };
      })(this), (function(_this) {
        return function(arg) {
          return _this.reject(arg);
        };
      })(this));
    }
  }

  Promise.prototype.resolve = function(value) {
    var clients, err, first, next;
    if (this.state !== STATE_PENDING) {
      return;
    }
    if (value === this) {
      return this.reject(new TypeError('Attempt to resolve promise with self'));
    }
    if (value && (typeof value === 'function' || typeof value === 'object')) {
      try {
        first = true;
        next = value.then;
        if (typeof next === 'function') {
          next.call(value, (function(_this) {
            return function(ra) {
              if (first) {
                if (first) {
                  first = false;
                }
                _this.resolve(ra);
              }
            };
          })(this), (function(_this) {
            return function(rr) {
              if (first) {
                first = false;
                _this.reject(rr);
              }
            };
          })(this));
          return;
        }
      } catch (error) {
        err = error;
        if (first) {
          this.reject(err);
        }
        return;
      }
    }
    this.state = STATE_FULFILLED;
    this.v = value;
    if (clients = this.c) {
      soon$1((function(_this) {
        return function() {
          var c, i, len;
          for (i = 0, len = clients.length; i < len; i++) {
            c = clients[i];
            resolveClient(c, value);
          }
        };
      })(this));
    }
  };

  Promise.prototype.reject = function(reason) {
    var clients;
    if (this.state !== STATE_PENDING) {
      return;
    }
    this.state = STATE_REJECTED;
    this.v = reason;
    if (clients = this.c) {
      soon$1(function() {
        var c, i, len;
        for (i = 0, len = clients.length; i < len; i++) {
          c = clients[i];
          rejectClient(c, reason);
        }
      });
    } else if (!Promise.suppressUncaughtRejectionError && typeof console !== 'undefined') {
      console.log('Broken Promise, please catch rejections: ', reason, reason ? reason.stack : null);
    }
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var a, client, p, s;
    p = new Promise;
    client = {
      y: onFulfilled,
      n: onRejected,
      p: p
    };
    if (this.state === STATE_PENDING) {
      if (this.c) {
        this.c.push(client);
      } else {
        this.c = [client];
      }
    } else {
      s = this.state;
      a = this.v;
      soon$1(function() {
        if (s === STATE_FULFILLED) {
          resolveClient(client, a);
        } else {
          rejectClient(client, a);
        }
      });
    }
    return p;
  };

  Promise.prototype["catch"] = function(cfn) {
    return this.then(null, cfn);
  };

  Promise.prototype["finally"] = function(cfn) {
    return this.then(cfn, cfn);
  };

  Promise.prototype.timeout = function(ms, msg) {
    msg = msg || 'timeout';
    return new Promise((function(_this) {
      return function(resolve, reject) {
        setTimeout(function() {
          return reject(Error(msg));
        }, ms);
        _this.then(function(val) {
          resolve(val);
        }, function(err) {
          reject(err);
        });
      };
    })(this));
  };

  Promise.prototype.callback = function(cb) {
    if (typeof cb === 'function') {
      this.then(function(val) {
        return cb(null, val);
      });
      this["catch"](function(err) {
        return cb(err, null);
      });
    }
    return this;
  };

  return Promise;

})();

var Promise$2 = Promise$1;

// src/helpers.coffee
var resolve = function(val) {
  var z;
  z = new Promise$2;
  z.resolve(val);
  return z;
};

var reject = function(err) {
  var z;
  z = new Promise$2;
  z.reject(err);
  return z;
};

var all = function(ps) {
  var i, j, len, p, rc, resolvePromise, results, retP;
  results = [];
  rc = 0;
  retP = new Promise$2();
  resolvePromise = function(p, i) {
    if (!p || typeof p.then !== 'function') {
      p = resolve(p);
    }
    p.then(function(yv) {
      results[i] = yv;
      rc++;
      if (rc === ps.length) {
        retP.resolve(results);
      }
    }, function(nv) {
      retP.reject(nv);
    });
  };
  for (i = j = 0, len = ps.length; j < len; i = ++j) {
    p = ps[i];
    resolvePromise(p, i);
  }
  if (!ps.length) {
    retP.resolve(results);
  }
  return retP;
};

var reflect = function(promise) {
  return new Promise$2(function(resolve, reject) {
    return promise.then(function(value) {
      return resolve(new PromiseInspection$1({
        state: 'fulfilled',
        value: value
      }));
    })["catch"](function(err) {
      return resolve(new PromiseInspection$1({
        state: 'rejected',
        reason: err
      }));
    });
  });
};

var settle = function(promises) {
  return all(promises.map(reflect));
};

// src/index.coffee
Promise$2.all = all;

Promise$2.reflect = reflect;

Promise$2.reject = reject;

Promise$2.resolve = resolve;

Promise$2.settle = settle;

Promise$2.soon = soon$1;

// node_modules/es-object-assign/index.mjs
var getOwnPropertySymbols;
var hasOwnProperty;
var objectAssign;
var propIsEnumerable;
var shouldUseNative;
var toObject;
var slice = [].slice;

getOwnPropertySymbols = Object.getOwnPropertySymbols;

hasOwnProperty = Object.prototype.hasOwnProperty;

propIsEnumerable = Object.prototype.propertyIsEnumerable;

toObject = function(val) {
  if (val === null || val === void 0) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
};

shouldUseNative = function() {
  var err, i, j, k, len, letter, order2, ref, test1, test2, test3;
  try {
    if (!Object.assign) {
      return false;
    }
    test1 = new String('abc');
    test1[5] = 'de';
    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }
    test2 = {};
    for (i = j = 0; j <= 9; i = ++j) {
      test2['_' + String.fromCharCode(i)] = i;
    }
    order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join('') !== '0123456789') {
      return false;
    }
    test3 = {};
    ref = 'abcdefghijklmnopqrst'.split('');
    for (k = 0, len = ref.length; k < len; k++) {
      letter = ref[k];
      test3[letter] = letter;
    }
    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }
    return true;
  } catch (error) {
    err = error;
    return false;
  }
};

var index = objectAssign = (function() {
  if (shouldUseNative()) {
    return Object.assign;
  }
  return function() {
    var from, j, k, key, len, len1, ref, source, sources, symbol, target, to;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    to = toObject(target);
    for (j = 0, len = sources.length; j < len; j++) {
      source = sources[j];
      from = Object(source);
      for (key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnPropertySymbols) {
        ref = getOwnPropertySymbols(from);
        for (k = 0, len1 = ref.length; k < len1; k++) {
          symbol = ref[k];
          if (propIsEnumerable.call(from, symbol)) {
            to[symbol] = from[symbol];
          }
        }
      }
    }
    return to;
  };
})();

// node_modules/es-xhr-promise/dist/lib.mjs
// src/parse-headers.coffee
var isArray;
var parseHeaders;
var trim;

trim = function(s) {
  return s.replace(/^\s*|\s*$/g, '');
};

isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

var parseHeaders$1 = parseHeaders = function(headers) {
  var i, index$$1, key, len, ref, result, row, value;
  if (!headers) {
    return {};
  }
  result = {};
  ref = trim(headers).split('\n');
  for (i = 0, len = ref.length; i < len; i++) {
    row = ref[i];
    index$$1 = row.indexOf(':');
    key = trim(row.slice(0, index$$1)).toLowerCase();
    value = trim(row.slice(index$$1 + 1));
    if (typeof result[key] === 'undefined') {
      result[key] = value;
    } else if (isArray(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [result[key], value];
    }
    return;
  }
  return result;
};

// src/index.coffee

/*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/xhr-promise/blob/master/LICENSE
 */
var XhrPromise;
var defaults;

defaults = {
  method: 'GET',
  headers: {},
  data: null,
  username: null,
  password: null,
  async: true
};


/*
 * Module to wrap an XhrPromise in a promise.
 */

XhrPromise = (function() {
  function XhrPromise() {}

  XhrPromise.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';

  XhrPromise.Promise = Promise$2;


  /*
   * XhrPromise.send(options) -> Promise
   * - options (Object): URL, method, data, etc.
   *
   * Create the XHR object and wire up event handlers to use a promise.
   */

  XhrPromise.prototype.send = function(options) {
    if (options == null) {
      options = {};
    }
    options = index({}, defaults, options);
    return new Promise$2((function(_this) {
      return function(resolve, reject) {
        var e, header, ref, value, xhr;
        if (!XMLHttpRequest) {
          _this._handleError('browser', reject, null, "browser doesn't support XMLHttpRequest");
          return;
        }
        if (typeof options.url !== 'string' || options.url.length === 0) {
          _this._handleError('url', reject, null, 'URL is a required parameter');
          return;
        }
        _this._xhr = xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var responseText;
          _this._detachWindowUnload();
          try {
            responseText = _this._getResponseText();
          } catch (error) {
            _this._handleError('parse', reject, null, 'invalid JSON response');
            return;
          }
          return resolve({
            url: _this._getResponseUrl(),
            headers: _this._getHeaders(),
            responseText: responseText,
            status: xhr.status,
            statusText: xhr.statusText,
            xhr: xhr
          });
        };
        xhr.onerror = function() {
          return _this._handleError('error', reject);
        };
        xhr.ontimeout = function() {
          return _this._handleError('timeout', reject);
        };
        xhr.onabort = function() {
          return _this._handleError('abort', reject);
        };
        _this._attachWindowUnload();
        xhr.open(options.method, options.url, options.async, options.username, options.password);
        if ((options.data != null) && !options.headers['Content-Type']) {
          options.headers['Content-Type'] = _this.constructor.DEFAULT_CONTENT_TYPE;
        }
        ref = options.headers;
        for (header in ref) {
          value = ref[header];
          xhr.setRequestHeader(header, value);
        }
        try {
          return xhr.send(options.data);
        } catch (error) {
          e = error;
          return _this._handleError('send', reject, null, e.toString());
        }
      };
    })(this));
  };


  /*
   * XhrPromise.getXHR() -> XhrPromise
   */

  XhrPromise.prototype.getXHR = function() {
    return this._xhr;
  };


  /*
   * XhrPromise._attachWindowUnload()
   *
   * Fix for IE 9 and IE 10
   * Internet Explorer freezes when you close a webpage during an XHR request
   * https://support.microsoft.com/kb/2856746
   *
   */

  XhrPromise.prototype._attachWindowUnload = function() {
    this._unloadHandler = this._handleWindowUnload.bind(this);
    if (window.attachEvent) {
      return window.attachEvent('onunload', this._unloadHandler);
    }
  };


  /*
   * XhrPromise._detachWindowUnload()
   */

  XhrPromise.prototype._detachWindowUnload = function() {
    if (window.detachEvent) {
      return window.detachEvent('onunload', this._unloadHandler);
    }
  };


  /*
   * XhrPromise._getHeaders() -> Object
   */

  XhrPromise.prototype._getHeaders = function() {
    return parseHeaders$1(this._xhr.getAllResponseHeaders());
  };


  /*
   * XhrPromise._getResponseText() -> Mixed
   *
   * Parses response text JSON if present.
   */

  XhrPromise.prototype._getResponseText = function() {
    var responseText;
    responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
    switch (this._xhr.getResponseHeader('Content-Type')) {
      case 'application/json':
      case 'text/javascript':
        responseText = JSON.parse(responseText + '');
    }
    return responseText;
  };


  /*
   * XhrPromise._getResponseUrl() -> String
   *
   * Actual response URL after following redirects.
   */

  XhrPromise.prototype._getResponseUrl = function() {
    if (this._xhr.responseURL != null) {
      return this._xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
      return this._xhr.getResponseHeader('X-Request-URL');
    }
    return '';
  };


  /*
   * XhrPromise._handleError(reason, reject, status, statusText)
   * - reason (String)
   * - reject (Function)
   * - status (String)
   * - statusText (String)
   */

  XhrPromise.prototype._handleError = function(reason, reject, status, statusText) {
    this._detachWindowUnload();
    return reject({
      reason: reason,
      status: status || this._xhr.status,
      statusText: statusText || this._xhr.statusText,
      xhr: this._xhr
    });
  };


  /*
   * XhrPromise._handleWindowUnload()
   */

  XhrPromise.prototype._handleWindowUnload = function() {
    return this._xhr.abort();
  };

  return XhrPromise;

})();

var XhrPromise$1 = XhrPromise;

// node_modules/es-tostring/index.mjs
var toString = function(obj) {
  return Object.prototype.toString.call(obj)
};

// node_modules/es-is/number.js
// Generated by CoffeeScript 1.12.5
var isNumber;

var isNumber$1 = isNumber = function(value) {
  return toString(value) === '[object Number]';
};

// node_modules/es-cookies/node_modules/es-object-assign/lib/es-object-assign.mjs
// src/index.coffee
var getOwnSymbols;
var objectAssign$2;
var shouldUseNative$1;
var toObject$1;
var slice$2 = [].slice;

getOwnSymbols = Object.getOwnPropertySymbols;

toObject$1 = function(val) {
  if (val === null || val === void 0) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
};

shouldUseNative$1 = function() {
  var err, i, j, k, len, letter, order2, ref, test1, test2, test3;
  try {
    if (!Object.assign) {
      return false;
    }
    test1 = new String('abc');
    test1[5] = 'de';
    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }
    test2 = {};
    for (i = j = 0; j <= 9; i = ++j) {
      test2['_' + String.fromCharCode(i)] = i;
    }
    order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join('') !== '0123456789') {
      return false;
    }
    test3 = {};
    ref = 'abcdefghijklmnopqrst'.split('');
    for (k = 0, len = ref.length; k < len; k++) {
      letter = ref[k];
      test3[letter] = letter;
    }
    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }
    return true;
  } catch (error) {
    err = error;
    return false;
  }
};

var index$2 = objectAssign$2 = (function() {
  if (shouldUseNative$1()) {
    return Object.assign;
  }
  return function() {
    var from, j, k, key, len, len1, ref, source, sources, symbol, target, to;
    target = arguments[0], sources = 2 <= arguments.length ? slice$2.call(arguments, 1) : [];
    to = toObject$1(target);
    for (j = 0, len = sources.length; j < len; j++) {
      source = sources[j];
      from = Object(source);
      for (key in from) {
        if (Object.prototype.hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnSymbols) {
        ref = getOwnSymbols(from);
        for (k = 0, len1 = ref.length; k < len1; k++) {
          symbol = ref[k];
          if (Object.prototype.propIsEnumerable.call(from, symbol)) {
            to[symbol] = from[symbol];
          }
        }
      }
    }
    return to;
  };
})();

// node_modules/es-cookies/lib/cookies.mjs
// src/cookies.coffee
var Cookies;

Cookies = (function() {
  function Cookies(defaults) {
    this.defaults = defaults != null ? defaults : {};
    this.get = (function(_this) {
      return function(key) {
        return _this.read(key);
      };
    })(this);
    this.getJSON = (function(_this) {
      return function(key) {
        var err;
        try {
          return JSON.parse(_this.read(key));
        } catch (error) {
          err = error;
          return {};
        }
      };
    })(this);
    this.remove = (function(_this) {
      return function(key, attrs) {
        return _this.write(key, '', index$2({
          expires: -1
        }, attrs));
      };
    })(this);
    this.set = (function(_this) {
      return function(key, value, attrs) {
        return _this.write(key, value, attrs);
      };
    })(this);
  }

  Cookies.prototype.read = function(key) {
    var cookie, cookies, err, i, kv, len, name, parts, rdecode, result;
    if (!key) {
      result = {};
    }
    cookies = document.cookie ? document.cookie.split('; ') : [];
    rdecode = /(%[0-9A-Z]{2})+/g;
    for (i = 0, len = cookies.length; i < len; i++) {
      kv = cookies[i];
      parts = kv.split('=');
      cookie = parts.slice(1).join('=');
      if (cookie.charAt(0) === '"') {
        cookie = cookie.slice(1, -1);
      }
      try {
        name = parts[0].replace(rdecode, decodeURIComponent);
        cookie = cookie.replace(rdecode, decodeURIComponent);
        if (key === name) {
          return cookie;
        }
        if (!key) {
          result[name] = cookie;
        }
      } catch (error) {
        err = error;
      }
    }
    return result;
  };

  Cookies.prototype.write = function(key, value, attrs) {
    var attr, err, expires, name, result, strAttrs;
    attrs = index$2({
      path: '/'
    }, this.defaults, attrs);
    if (isNumber$1(attrs.expires)) {
      expires = new Date;
      expires.setMilliseconds(expires.getMilliseconds() + attrs.expires * 864e+5);
      attrs.expires = expires;
    }
    attrs.expires = attrs.expires ? attrs.expires.toUTCString() : '';
    try {
      result = JSON.stringify(value);
      if (/^[\{\[]/.test(result)) {
        value = result;
      }
    } catch (error) {
      err = error;
    }
    value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
    key = encodeURIComponent(String(key));
    key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
    key = key.replace(/[\(\)]/g, escape);
    strAttrs = '';
    for (name in attrs) {
      attr = attrs[name];
      if (!attr) {
        continue;
      }
      strAttrs += '; ' + name;
      if (attr === true) {
        continue;
      }
      strAttrs += '=' + attr;
    }
    return document.cookie = key + '=' + value + strAttrs;
  };

  return Cookies;

})();

var Cookies$1 = Cookies;

// src/index.coffee
var index$1 = new Cookies$1();

// src/client/client.coffee
var Client$1;
var slice$1 = [].slice;

Client$1 = (function() {
  function Client(opts) {
    var k, v;
    if (opts == null) {
      opts = {};
    }
    this.opts = {
      debug: false,
      endpoint: 'https://api.hanzo.io',
      session: {
        name: 'hzo',
        expires: 7 * 24 * 3600 * 1000
      }
    };
    for (k in opts) {
      v = opts[k];
      this.opts[k] = v;
    }
  }

  Client.prototype.getKey = function() {
    return this.opts.key;
  };

  Client.prototype.setKey = function(key) {
    return this.opts.key = key;
  };

  Client.prototype.getCustomerToken = function() {
    var session;
    if ((session = index$1.getJSON(this.opts.session.name)) != null) {
      if (session.customerToken != null) {
        this.customerToken = session.customerToken;
      }
    }
    return this.customerToken;
  };

  Client.prototype.setCustomerToken = function(key) {
    index$1.set(this.opts.session.name, {
      customerToken: key
    }, {
      expires: this.opts.session.expires
    });
    return this.customerToken = key;
  };

  Client.prototype.deleteCustomerToken = function() {
    index$1.set(this.opts.session.name, {
      customerToken: null
    }, {
      expires: this.opts.session.expires
    });
    return this.customerToken = null;
  };

  Client.prototype.url = function(url, data, key) {
    if (isFunction(url)) {
      url = url.call(this, data);
    }
    return updateQuery(this.opts.endpoint + url, {
      token: key
    });
  };

  Client.prototype.log = function() {
    var args;
    args = 1 <= arguments.length ? slice$1.call(arguments, 0) : [];
    args.unshift('hanzo.js>');
    if (this.opts.debug && (typeof console !== "undefined" && console !== null)) {
      return console.log.apply(console, args);
    }
  };

  return Client;

})();

var Client$2 = Client$1;

// src/client/browser.coffee
var BrowserClient;
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp = {}.hasOwnProperty;

BrowserClient = (function(superClass) {
  extend(BrowserClient, superClass);

  function BrowserClient(opts) {
    if (!(this instanceof BrowserClient)) {
      return new BrowserClient(opts);
    }
    BrowserClient.__super__.constructor.call(this, opts);
    this.getCustomerToken();
  }

  BrowserClient.prototype.request = function(blueprint, data, key) {
    var opts;
    if (data == null) {
      data = {};
    }
    if (key == null) {
      key = this.getKey();
    }
    opts = {
      url: this.url(blueprint.url, data, key),
      method: blueprint.method
    };
    if (blueprint.method !== 'GET') {
      opts.headers = {
        'Content-Type': 'application/json'
      };
    }
    if (blueprint.method === 'GET') {
      opts.url = updateQuery(opts.url, data);
    } else {
      opts.data = JSON.stringify(data);
    }
    this.log('request', {
      key: key,
      opts: opts
    });
    return (new XhrPromise$1).send(opts).then((function(_this) {
      return function(res) {
        _this.log('response', res);
        res.data = res.responseText;
        return res;
      };
    })(this))["catch"]((function(_this) {
      return function(res) {
        var err, ref;
        try {
          res.data = (ref = res.responseText) != null ? ref : JSON.parse(res.xhr.responseText);
        } catch (error) {
          err = error;
        }
        err = newError(data, res, err);
        _this.log('response', res);
        _this.log('error', err);
        throw err;
      };
    })(this));
  };

  return BrowserClient;

})(Client$2);

var Client = BrowserClient;

// src/blueprints/url.coffee
var sp;

var storePrefixed = sp = function(u) {
  return function(x) {
    var url;
    if (isFunction(u)) {
      url = u(x);
    } else {
      url = u;
    }
    if (this.storeId != null) {
      return ("/store/" + this.storeId) + url;
    } else {
      return url;
    }
  };
};

var byId = function(name) {
  switch (name) {
    case 'coupon':
      return sp(function(x) {
        var ref;
        return "/coupon/" + ((ref = x.code) != null ? ref : x);
      });
    case 'collection':
      return sp(function(x) {
        var ref;
        return "/collection/" + ((ref = x.slug) != null ? ref : x);
      });
    case 'product':
      return sp(function(x) {
        var ref, ref1;
        return "/product/" + ((ref = (ref1 = x.id) != null ? ref1 : x.slug) != null ? ref : x);
      });
    case 'variant':
      return sp(function(x) {
        var ref, ref1;
        return "/variant/" + ((ref = (ref1 = x.id) != null ? ref1 : x.sku) != null ? ref : x);
      });
    case 'site':
      return function(x) {
        var ref, ref1;
        return "/site/" + ((ref = (ref1 = x.id) != null ? ref1 : x.name) != null ? ref : x);
      };
    default:
      return function(x) {
        var ref;
        return "/" + name + "/" + ((ref = x.id) != null ? ref : x);
      };
  }
};

// src/blueprints/browser.coffee
var blueprints;
var createBlueprint;
var fn;
var i;
var len;
var model;
var models;

createBlueprint = function(name) {
  var endpoint;
  endpoint = "/" + name;
  return {
    list: {
      url: endpoint,
      method: GET,
      expects: statusOk
    },
    get: {
      url: byId(name),
      method: GET,
      expects: statusOk
    }
  };
};

blueprints = {
  account: {
    get: {
      url: '/account',
      method: GET,
      expects: statusOk,
      useCustomerToken: true
    },
    update: {
      url: '/account',
      method: PATCH,
      expects: statusOk,
      useCustomerToken: true
    },
    exists: {
      url: function(x) {
        var ref, ref1, ref2;
        return "/account/exists/" + ((ref = (ref1 = (ref2 = x.email) != null ? ref2 : x.username) != null ? ref1 : x.id) != null ? ref : x);
      },
      method: GET,
      expects: statusOk,
      process: function(res) {
        return res.data.exists;
      }
    },
    create: {
      url: '/account/create',
      method: POST,
      expects: statusCreated
    },
    enable: {
      url: function(x) {
        var ref;
        return "/account/enable/" + ((ref = x.tokenId) != null ? ref : x);
      },
      method: POST,
      expects: statusOk
    },
    login: {
      url: '/account/login',
      method: POST,
      expects: statusOk,
      process: function(res) {
        this.setCustomerToken(res.data.token);
        return res;
      }
    },
    logout: function() {
      return this.deleteCustomerToken();
    },
    reset: {
      url: '/account/reset',
      method: POST,
      expects: statusOk,
      useCustomerToken: true
    },
    updateOrder: {
      url: function(x) {
        var ref, ref1;
        return "/account/order/" + ((ref = (ref1 = x.orderId) != null ? ref1 : x.id) != null ? ref : x);
      },
      method: PATCH,
      expects: statusOk,
      useCustomerToken: true
    },
    confirm: {
      url: function(x) {
        var ref;
        return "/account/confirm/" + ((ref = x.tokenId) != null ? ref : x);
      },
      method: POST,
      expects: statusOk,
      useCustomerToken: true
    }
  },
  cart: {
    create: {
      url: '/cart',
      method: POST,
      expects: statusCreated
    },
    update: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x);
      },
      method: PATCH,
      expects: statusOk
    },
    discard: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x) + "/discard";
      },
      method: POST,
      expects: statusOk
    },
    set: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x) + "/set";
      },
      method: POST,
      expects: statusOk
    }
  },
  review: {
    create: {
      url: '/review',
      method: POST,
      expects: statusCreated
    },
    get: {
      url: function(x) {
        var ref;
        return "/review/" + ((ref = x.id) != null ? ref : x);
      },
      method: GET,
      expects: statusOk
    }
  },
  checkout: {
    authorize: {
      url: storePrefixed('/checkout/authorize'),
      method: POST,
      expects: statusOk
    },
    capture: {
      url: storePrefixed(function(x) {
        var ref;
        return "/checkout/capture/" + ((ref = x.orderId) != null ? ref : x);
      }),
      method: POST,
      expects: statusOk
    },
    charge: {
      url: storePrefixed('/checkout/charge'),
      method: POST,
      expects: statusOk
    },
    paypal: {
      url: storePrefixed('/checkout/paypal'),
      method: POST,
      expects: statusOk
    }
  },
  referrer: {
    create: {
      url: '/referrer',
      method: POST,
      expects: statusCreated
    },
    get: {
      url: function(x) {
        var ref;
        return "/referrer/" + ((ref = x.id) != null ? ref : x);
      },
      method: GET,
      expects: statusOk
    }
  }
};

models = ['collection', 'coupon', 'product', 'variant'];

fn = function(model) {
  return blueprints[model] = createBlueprint(model);
};
for (i = 0, len = models.length; i < len; i++) {
  model = models[i];
  fn(model);
}

var blueprints$1 = blueprints;

// src/browser.coffee
var Hanzo;

Api$1.BLUEPRINTS = blueprints$1;

Api$1.CLIENT = Client;

Hanzo = function(opts) {
  if (opts == null) {
    opts = {};
  }
  if (opts.client == null) {
    opts.client = new Client(opts);
  }
  if (opts.blueprints == null) {
    opts.blueprints = blueprints$1;
  }
  return new Api$1(opts);
};

Hanzo.Api = Api$1;

Hanzo.Client = Client;

var Hanzo$1 = Hanzo;

exports['default'] = Hanzo$1;
exports.Api = Api$1;
exports.Client = Client;

}((this.Hanzo = this.Hanzo || {})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuem8uanMiLCJzb3VyY2VzIjpbInNyYy91dGlscy5jb2ZmZWUiLCJzcmMvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9wcm9taXNlLWluc3BlY3Rpb24uY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXhoci1wcm9taXNlL25vZGVfbW9kdWxlcy9icm9rZW4vc3JjL3V0aWxzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9zb29uLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9wcm9taXNlLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9oZWxwZXJzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtb2JqZWN0LWFzc2lnbi9pbmRleC5tanMiLCJub2RlX21vZHVsZXMvZXMteGhyLXByb21pc2Uvc3JjL3BhcnNlLWhlYWRlcnMuY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXhoci1wcm9taXNlL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtdG9zdHJpbmcvaW5kZXgubWpzIiwibm9kZV9tb2R1bGVzL2VzLWlzL3NyYy9udW1iZXIuY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLWNvb2tpZXMvbm9kZV9tb2R1bGVzL2VzLW9iamVjdC1hc3NpZ24vc3JjL2luZGV4LmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL3NyYy9jb29raWVzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL3NyYy9pbmRleC5jb2ZmZWUiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvY2xpZW50L2Jyb3dzZXIuY29mZmVlIiwic3JjL2JsdWVwcmludHMvdXJsLmNvZmZlZSIsInNyYy9ibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwic3JjL2Jyb3dzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMgSGVscGVyc1xuZXhwb3J0IGlzRnVuY3Rpb24gPSAoZm4pIC0+IHR5cGVvZiBmbiBpcyAnZnVuY3Rpb24nXG5leHBvcnQgaXNTdHJpbmcgICA9IChzKSAgLT4gdHlwZW9mIHMgIGlzICdzdHJpbmcnXG5cbiMgRmV3IHN0YXR1cyBjb2RlcyB3ZSB1c2UgdGhyb3VnaG91dCBjb2RlIGJhc2VcbmV4cG9ydCBzdGF0dXNPayAgICAgICAgPSAocmVzKSAtPiByZXMuc3RhdHVzIGlzIDIwMFxuZXhwb3J0IHN0YXR1c0NyZWF0ZWQgICA9IChyZXMpIC0+IHJlcy5zdGF0dXMgaXMgMjAxXG5leHBvcnQgc3RhdHVzTm9Db250ZW50ID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDRcblxuIyBBbGxvdyBtZXRob2QgbmFtZXMgdG8gYmUgbWluaWZpZWRcbmV4cG9ydCBHRVQgICA9ICdHRVQnXG5leHBvcnQgUE9TVCAgPSAnUE9TVCdcbmV4cG9ydCBQQVRDSCA9ICdQQVRDSCdcblxuIyBUaHJvdyBcImZhdFwiIGVycm9ycy5cbmV4cG9ydCBuZXdFcnJvciA9IChkYXRhLCByZXMgPSB7fSwgZXJyKSAtPlxuICBtZXNzYWdlID0gcmVzLmRhdGE/LmVycm9yPy5tZXNzYWdlID8gJ1JlcXVlc3QgZmFpbGVkJ1xuXG4gIHVubGVzcyBlcnI/XG4gICAgZXJyID0gbmV3IEVycm9yIG1lc3NhZ2VcblxuICBlcnIuZGF0YSAgICAgICAgID0gcmVzLmRhdGFcbiAgZXJyLm1zZyAgICAgICAgICA9IG1lc3NhZ2VcbiAgZXJyLnJlcSAgICAgICAgICA9IGRhdGFcbiAgZXJyLnJlc3BvbnNlVGV4dCA9IHJlcy5kYXRhXG4gIGVyci5zdGF0dXMgICAgICAgPSByZXMuc3RhdHVzXG4gIGVyci50eXBlICAgICAgICAgPSByZXMuZGF0YT8uZXJyb3I/LnR5cGVcbiAgZXJyXG5cbiMgVXBkYXRlIHBhcmFtIGluIHF1ZXJ5XG51cGRhdGVQYXJhbSA9ICh1cmwsIGtleSwgdmFsdWUpIC0+XG4gIHJlID0gbmV3IFJlZ0V4cCgnKFs/Jl0pJyArIGtleSArICc9Lio/KCZ8I3wkKSguKiknLCAnZ2knKVxuXG4gIGlmIHJlLnRlc3QgdXJsXG4gICAgaWYgdmFsdWU/XG4gICAgICB1cmwucmVwbGFjZSByZSwgJyQxJyArIGtleSArICc9JyArIHZhbHVlICsgJyQyJDMnXG4gICAgZWxzZVxuICAgICAgaGFzaCA9IHVybC5zcGxpdCAnIydcbiAgICAgIHVybCA9IGhhc2hbMF0ucmVwbGFjZShyZSwgJyQxJDMnKS5yZXBsYWNlKC8oJnxcXD8pJC8sICcnKVxuICAgICAgdXJsICs9ICcjJyArIGhhc2hbMV0gaWYgaGFzaFsxXT9cbiAgICAgIHVybFxuICBlbHNlXG4gICAgaWYgdmFsdWU/XG4gICAgICBzZXBhcmF0b3IgPSBpZiB1cmwuaW5kZXhPZignPycpICE9IC0xIHRoZW4gJyYnIGVsc2UgJz8nXG4gICAgICBoYXNoID0gdXJsLnNwbGl0ICcjJ1xuICAgICAgdXJsID0gaGFzaFswXSArIHNlcGFyYXRvciArIGtleSArICc9JyArIHZhbHVlXG4gICAgICB1cmwgKz0gJyMnICsgaGFzaFsxXSBpZiBoYXNoWzFdP1xuICAgICAgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgVXBkYXRlIHF1ZXJ5IG9uIHVybFxuZXhwb3J0IHVwZGF0ZVF1ZXJ5ID0gKHVybCwgZGF0YSkgLT5cbiAgcmV0dXJuIHVybCBpZiB0eXBlb2YgZGF0YSAhPSAnb2JqZWN0J1xuXG4gIGZvciBrLHYgb2YgZGF0YVxuICAgIHVybCA9IHVwZGF0ZVBhcmFtIHVybCwgaywgdlxuICB1cmxcbiIsImltcG9ydCB7R0VULCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgbmV3RXJyb3IsIHN0YXR1c09rfSBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBBcGlcbiAgQEJMVUVQUklOVFMgPSB7fVxuICBAQ0xJRU5UICAgICA9IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IEFwaSBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQXBpXG5cbiAgICB7Ymx1ZXByaW50cywgY2xpZW50fSA9IG9wdHNcblxuICAgIEBjbGllbnQgPSBjbGllbnQgb3IgbmV3IEBjb25zdHJ1Y3Rvci5DTElFTlQgb3B0c1xuXG4gICAgYmx1ZXByaW50cyA/PSBAY29uc3RydWN0b3IuQkxVRVBSSU5UU1xuICAgIEBhZGRCbHVlcHJpbnRzIGssIHYgZm9yIGssIHYgb2YgYmx1ZXByaW50c1xuXG4gIGFkZEJsdWVwcmludHM6IChhcGksIGJsdWVwcmludHMpIC0+XG4gICAgQFthcGldID89IHt9XG4gICAgZm9yIG5hbWUsIGJwIG9mIGJsdWVwcmludHNcbiAgICAgIEBhZGRCbHVlcHJpbnQgYXBpLCBuYW1lLCBicFxuICAgIHJldHVyblxuXG4gIGFkZEJsdWVwcmludDogKGFwaSwgbmFtZSwgYnApIC0+XG4gICAgIyBOb3JtYWwgbWV0aG9kXG4gICAgaWYgaXNGdW5jdGlvbiBicFxuICAgICAgcmV0dXJuIEBbYXBpXVtuYW1lXSA9ID0+IGJwLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICAgIyBCbHVlcHJpbnQgbWV0aG9kXG4gICAgYnAuZXhwZWN0cyA/PSBzdGF0dXNPa1xuICAgIGJwLm1ldGhvZCAgPz0gR0VUXG5cbiAgICBtZXRob2QgPSAoZGF0YSwgY2IpID0+XG4gICAgICBrZXkgPSB1bmRlZmluZWRcbiAgICAgIGlmIGJwLnVzZUN1c3RvbWVyVG9rZW5cbiAgICAgICAga2V5ID0gQGNsaWVudC5nZXRDdXN0b21lclRva2VuKClcbiAgICAgIEBjbGllbnQucmVxdWVzdCBicCwgZGF0YSwga2V5XG4gICAgICAgIC50aGVuIChyZXMpID0+XG4gICAgICAgICAgaWYgcmVzLmRhdGE/LmVycm9yP1xuICAgICAgICAgICAgdGhyb3cgbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgICAgdW5sZXNzIGJwLmV4cGVjdHMgcmVzXG4gICAgICAgICAgICB0aHJvdyBuZXdFcnJvciBkYXRhLCByZXNcbiAgICAgICAgICBpZiBicC5wcm9jZXNzP1xuICAgICAgICAgICAgYnAucHJvY2Vzcy5jYWxsIEAsIHJlc1xuICAgICAgICAgIHJlcy5kYXRhID8gcmVzLmJvZHlcbiAgICAgICAgLmNhbGxiYWNrIGNiXG5cbiAgICBAW2FwaV1bbmFtZV0gPSBtZXRob2RcblxuICBzZXRLZXk6IChrZXkpIC0+XG4gICAgQGNsaWVudC5zZXRLZXkga2V5XG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBAY2xpZW50LnNldEN1c3RvbWVyVG9rZW4ga2V5XG5cbiAgZGVsZXRlQ3VzdG9tZXJUb2tlbjogLT5cbiAgICBAY2xpZW50LmRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gIHNldFN0b3JlOiAoaWQpIC0+XG4gICAgQHN0b3JlSWQgPSBpZFxuICAgIEBjbGllbnQuc2V0U3RvcmUgaWRcblxuZXhwb3J0IGRlZmF1bHQgQXBpXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9taXNlSW5zcGVjdGlvblxuICBjb25zdHJ1Y3RvcjogKHtAc3RhdGUsIEB2YWx1ZSwgQHJlYXNvbn0pIC0+XG5cbiAgaXNGdWxmaWxsZWQ6IC0+XG4gICAgQHN0YXRlIGlzICdmdWxmaWxsZWQnXG5cbiAgaXNSZWplY3RlZDogLT5cbiAgICBAc3RhdGUgaXMgJ3JlamVjdGVkJ1xuIiwiIyBMZXQgdGhlIG9iZmlzY2F0b3IgY29tcHJlc3MgdGhlc2UgZG93biBieSBhc3NpZ25pbmcgdGhlbSB0byB2YXJpYWJsZXNcbmV4cG9ydCBfdW5kZWZpbmVkICAgICAgID0gdW5kZWZpbmVkXG5leHBvcnQgX3VuZGVmaW5lZFN0cmluZyA9ICd1bmRlZmluZWQnXG4iLCJpbXBvcnQge191bmRlZmluZWQsIF91bmRlZmluZWRTdHJpbmd9IGZyb20gJy4vdXRpbHMnXG5cbiMgU2VlIGh0dHA6Ly93d3cuYmx1ZWphdmEuY29tLzROUy9TcGVlZC11cC15b3VyLVdlYnNpdGVzLXdpdGgtYS1GYXN0ZXItc2V0VGltZW91dC11c2luZy1zb29uXG4jIFRoaXMgaXMgYSB2ZXJ5IGZhc3QgXCJhc3luY2hyb25vdXNcIiBmbG93IGNvbnRyb2wgLSBpLmUuIGl0IHlpZWxkcyB0aGUgdGhyZWFkXG4jIGFuZCBleGVjdXRlcyBsYXRlciwgYnV0IG5vdCBtdWNoIGxhdGVyLiBJdCBpcyBmYXIgZmFzdGVyIGFuZCBsaWdodGVyIHRoYW5cbiMgdXNpbmcgc2V0VGltZW91dChmbiwwKSBmb3IgeWllbGRpbmcgdGhyZWFkcy4gIEl0cyBhbHNvIGZhc3RlciB0aGFuIG90aGVyXG4jIHNldEltbWVkaWF0ZSBzaGltcywgYXMgaXQgdXNlcyBNdXRhdGlvbiBPYnNlcnZlciBhbmQgXCJtYWlubGluZXNcIiBzdWNjZXNzaXZlXG4jIGNhbGxzIGludGVybmFsbHkuXG4jXG4jIFdBUk5JTkc6IFRoaXMgZG9lcyBub3QgeWllbGQgdG8gdGhlIGJyb3dzZXIgVUkgbG9vcCwgc28gYnkgdXNpbmcgdGhpc1xuIyAgICAgICAgICByZXBlYXRlZGx5IHlvdSBjYW4gc3RhcnZlIHRoZSBVSSBhbmQgYmUgdW5yZXNwb25zaXZlIHRvIHRoZSB1c2VyLlxuI1xuIyBUaGlzIGlzIGFuIGV2ZW4gRkFTVEVSIHZlcnNpb24gb2YgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYmx1ZWphdmEvOWI5NTQyZDFkYTJhMTY0ZDA0NTZcbiMgdGhhdCBnaXZlcyB1cCBwYXNzaW5nIGNvbnRleHQgYW5kIGFyZ3VtZW50cywgaW4gZXhjaGFuZ2UgZm9yIGEgMjV4IHNwZWVkXG4jIGluY3JlYXNlLiAoVXNlIGFub24gZnVuY3Rpb24gdG8gcGFzcyBjb250ZXh0L2FyZ3MpXG5zb29uID0gZG8gLT5cbiAgIyBGdW5jdGlvbiBxdWV1ZVxuICBmcSAgICAgICAgID0gW11cblxuICAjIEF2b2lkIHVzaW5nIHNoaWZ0KCkgYnkgbWFpbnRhaW5pbmcgYSBzdGFydCBwb2ludGVyIC0gYW5kIHJlbW92ZSBpdGVtcyBpblxuICAjIGNodW5rcyBvZiAxMDI0IChidWZmZXJTaXplKVxuICBmcVN0YXJ0ICAgID0gMFxuICBidWZmZXJTaXplID0gMTAyNFxuXG4gIGNhbGxRdWV1ZSA9IC0+XG4gICAgIyBUaGlzIGFwcHJvYWNoIGFsbG93cyBuZXcgeWllbGRzIHRvIHBpbGUgb24gZHVyaW5nIHRoZSBleGVjdXRpb24gb2YgdGhlc2VcbiAgICB3aGlsZSBmcS5sZW5ndGggLSBmcVN0YXJ0XG4gICAgICB0cnlcbiAgICAgICAgIyBObyBjb250ZXh0IG9yIGFyZ3MuLi5cbiAgICAgICAgZnFbZnFTdGFydF0oKVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIHVubGVzcyB0eXBlb2YgY29uc29sZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyXG5cbiAgICAgICMgSW5jcmVhc2Ugc3RhcnQgcG9pbnRlciBhbmQgZGVyZWZlcmVuY2UgZnVuY3Rpb24ganVzdCBjYWxsZWRcbiAgICAgIGZxW2ZxU3RhcnQrK10gPSBfdW5kZWZpbmVkXG5cbiAgICAgIGlmIGZxU3RhcnQgPT0gYnVmZmVyU2l6ZVxuICAgICAgICBmcS5zcGxpY2UgMCwgYnVmZmVyU2l6ZVxuICAgICAgICBmcVN0YXJ0ID0gMFxuXG4gICAgcmV0dXJuXG5cbiAgIyBSdW4gdGhlIGNhbGxRdWV1ZSBmdW5jdGlvbiBhc3luY2hyb25vdXNseSwgYXMgZmFzdCBhcyBwb3NzaWJsZVxuICBjcVlpZWxkID0gZG8gLT5cbiAgICAjIFRoaXMgaXMgdGhlIGZhc3Rlc3Qgd2F5IGJyb3dzZXJzIGhhdmUgdG8geWllbGQgcHJvY2Vzc2luZ1xuICAgIGlmIHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9IF91bmRlZmluZWRTdHJpbmdcbiAgICAgICMgRmlyc3QsIGNyZWF0ZSBhIGRpdiBub3QgYXR0YWNoZWQgdG8gRE9NIHRvICdvYnNlcnZlJ1xuICAgICAgZGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgICBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyIGNhbGxRdWV1ZVxuICAgICAgbW8ub2JzZXJ2ZSBkZCwgYXR0cmlidXRlczogdHJ1ZVxuXG4gICAgICByZXR1cm4gLT5cbiAgICAgICAgZGQuc2V0QXR0cmlidXRlICdhJywgMFxuICAgICAgICByZXR1cm5cblxuICAgICMgSWYgTm8gTXV0YXRpb25PYnNlcnZlciAtIHRoaXMgaXMgdGhlIG5leHQgYmVzdCB0aGluZyAtIGhhbmRsZXMgTm9kZSBhbmQgTVNJRVxuICAgIGlmIHR5cGVvZiBzZXRJbW1lZGlhdGUgIT0gX3VuZGVmaW5lZFN0cmluZ1xuICAgICAgcmV0dXJuIC0+XG4gICAgICAgIHNldEltbWVkaWF0ZSBjYWxsUXVldWVcbiAgICAgICAgcmV0dXJuXG5cbiAgICAjIEZpbmFsIGZhbGxiYWNrIC0gc2hvdWxkbid0IGJlIHVzZWQgZm9yIG11Y2ggZXhjZXB0IHZlcnkgb2xkIGJyb3dzZXJzXG4gICAgLT5cbiAgICAgIHNldFRpbWVvdXQgY2FsbFF1ZXVlLCAwXG4gICAgICByZXR1cm5cblxuXG4gICMgVGhpcyBpcyB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGFzc2lnbmVkIHRvIHNvb24gaXQgdGFrZXMgdGhlIGZ1bmN0aW9uIHRvXG4gICMgY2FsbCBhbmQgZXhhbWluZXMgYWxsIGFyZ3VtZW50cy5cbiAgKGZuKSAtPlxuICAgICMgUHVzaCB0aGUgZnVuY3Rpb24gYW5kIGFueSByZW1haW5pbmcgYXJndW1lbnRzIGFsb25nIHdpdGggY29udGV4dFxuICAgIGZxLnB1c2ggZm5cblxuICAgICMgVXBvbiBhZGRpbmcgb3VyIGZpcnN0IGVudHJ5LCBraWNrIG9mZiB0aGUgY2FsbGJhY2tcbiAgICBpZiBmcS5sZW5ndGggLSBmcVN0YXJ0ID09IDFcbiAgICAgIGNxWWllbGQoKVxuICAgIHJldHVyblxuXG5leHBvcnQgZGVmYXVsdCBzb29uXG4iLCIjIExhcmdlbHkgY29waWVkIGZyb20gWm91c2FuOiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWphdmEvem91c2FuXG5pbXBvcnQgUHJvbWlzZUluc3BlY3Rpb24gZnJvbSAnLi9wcm9taXNlLWluc3BlY3Rpb24nXG5pbXBvcnQgc29vbiBmcm9tICcuL3Nvb24nXG5cbiMgTGV0IHRoZSBvYmZpc2NhdG9yIGNvbXByZXNzIHRoZXNlIGRvd24gYnkgYXNzaWduaW5nIHRoZW0gdG8gdmFyaWFibGVzXG5fdW5kZWZpbmVkICAgICAgID0gdW5kZWZpbmVkXG5fdW5kZWZpbmVkU3RyaW5nID0gJ3VuZGVmaW5lZCdcblxuIyBUaGVzZSBhcmUgdGhlIHRocmVlIHBvc3NpYmxlIHN0YXRlcyAoUEVORElORyByZW1haW5zIHVuZGVmaW5lZCAtIGFzIGludGVuZGVkKVxuIyBhIHByb21pc2UgY2FuIGJlIGluLiAgVGhlIHN0YXRlIGlzIHN0b3JlZCBpbiB0aGlzLnN0YXRlIGFzIHJlYWQtb25seVxuU1RBVEVfUEVORElORyAgID0gX3VuZGVmaW5lZFxuU1RBVEVfRlVMRklMTEVEID0gJ2Z1bGZpbGxlZCdcblNUQVRFX1JFSkVDVEVEICA9ICdyZWplY3RlZCdcblxucmVzb2x2ZUNsaWVudCA9IChjLCBhcmcpIC0+XG4gIGlmIHR5cGVvZiBjLnkgPT0gJ2Z1bmN0aW9uJ1xuICAgIHRyeVxuICAgICAgeXJldCA9IGMueS5jYWxsKF91bmRlZmluZWQsIGFyZylcbiAgICAgIGMucC5yZXNvbHZlIHlyZXRcbiAgICBjYXRjaCBlcnJcbiAgICAgIGMucC5yZWplY3QgZXJyXG4gIGVsc2VcbiAgICAjIHBhc3MgdGhpcyBhbG9uZy4uLlxuICAgIGMucC5yZXNvbHZlIGFyZ1xuICByZXR1cm5cblxucmVqZWN0Q2xpZW50ID0gKGMsIHJlYXNvbikgLT5cbiAgaWYgdHlwZW9mIGMubiA9PSAnZnVuY3Rpb24nXG4gICAgdHJ5XG4gICAgICB5cmV0ID0gYy5uLmNhbGwoX3VuZGVmaW5lZCwgcmVhc29uKVxuICAgICAgYy5wLnJlc29sdmUgeXJldFxuICAgIGNhdGNoIGVyclxuICAgICAgYy5wLnJlamVjdCBlcnJcbiAgZWxzZVxuICAgICMgcGFzcyB0aGlzIGFsb25nLi4uXG4gICAgYy5wLnJlamVjdCByZWFzb25cbiAgcmV0dXJuXG5cblxuY2xhc3MgUHJvbWlzZVxuICBjb25zdHJ1Y3RvcjogKGZuKSAtPlxuICAgIGlmIGZuXG4gICAgICBmbiAoYXJnKSA9PlxuICAgICAgICBAcmVzb2x2ZSBhcmdcbiAgICAgICwgKGFyZykgPT5cbiAgICAgICAgQHJlamVjdCBhcmdcblxuICByZXNvbHZlOiAodmFsdWUpIC0+XG4gICAgaWYgQHN0YXRlICE9IFNUQVRFX1BFTkRJTkdcbiAgICAgIHJldHVyblxuXG4gICAgaWYgdmFsdWUgPT0gQFxuICAgICAgcmV0dXJuIEByZWplY3QgbmV3IFR5cGVFcnJvciAnQXR0ZW1wdCB0byByZXNvbHZlIHByb21pc2Ugd2l0aCBzZWxmJ1xuXG4gICAgaWYgdmFsdWUgYW5kICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyBvciB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpXG4gICAgICB0cnlcbiAgICAgICAgIyBGaXJzdCB0aW1lIHRocm91Z2g/XG4gICAgICAgIGZpcnN0ID0gdHJ1ZVxuICAgICAgICBuZXh0ID0gdmFsdWUudGhlblxuXG4gICAgICAgIGlmIHR5cGVvZiBuZXh0ID09ICdmdW5jdGlvbidcbiAgICAgICAgICAjIEFuZCBjYWxsIHRoZSB2YWx1ZS50aGVuICh3aGljaCBpcyBub3cgaW4gXCJ0aGVuXCIpIHdpdGggdmFsdWUgYXMgdGhlXG4gICAgICAgICAgIyBjb250ZXh0IGFuZCB0aGUgcmVzb2x2ZS9yZWplY3QgZnVuY3Rpb25zIHBlciB0aGVuYWJsZSBzcGVjXG4gICAgICAgICAgbmV4dC5jYWxsIHZhbHVlLCAocmEpID0+XG4gICAgICAgICAgICBpZiBmaXJzdFxuICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlIGlmIGZpcnN0XG4gICAgICAgICAgICAgIEByZXNvbHZlIHJhXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAsIChycikgPT5cbiAgICAgICAgICAgIGlmIGZpcnN0XG4gICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgICAgICAgQHJlamVjdCByclxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgcmV0dXJuXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgQHJlamVjdCBlcnIgaWYgZmlyc3RcbiAgICAgICAgcmV0dXJuXG5cbiAgICBAc3RhdGUgPSBTVEFURV9GVUxGSUxMRURcbiAgICBAdiAgICAgPSB2YWx1ZVxuXG4gICAgaWYgY2xpZW50cyA9IEBjXG4gICAgICBzb29uID0+XG4gICAgICAgIHJlc29sdmVDbGllbnQgYywgdmFsdWUgZm9yIGMgaW4gY2xpZW50c1xuICAgICAgICByZXR1cm5cbiAgICByZXR1cm5cblxuICByZWplY3Q6IChyZWFzb24pIC0+XG4gICAgcmV0dXJuIGlmIEBzdGF0ZSAhPSBTVEFURV9QRU5ESU5HXG5cbiAgICBAc3RhdGUgPSBTVEFURV9SRUpFQ1RFRFxuICAgIEB2ICAgICA9IHJlYXNvblxuXG4gICAgaWYgY2xpZW50cyA9IEBjXG4gICAgICBzb29uIC0+XG4gICAgICAgIHJlamVjdENsaWVudCBjLCByZWFzb24gZm9yIGMgaW4gY2xpZW50c1xuICAgICAgICByZXR1cm5cbiAgICBlbHNlIGlmICFQcm9taXNlLnN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciBhbmQgdHlwZW9mIGNvbnNvbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIGNvbnNvbGUubG9nICdCcm9rZW4gUHJvbWlzZSwgcGxlYXNlIGNhdGNoIHJlamVjdGlvbnM6ICcsIHJlYXNvbiwgaWYgcmVhc29uIHRoZW4gcmVhc29uLnN0YWNrIGVsc2UgbnVsbFxuXG4gICAgcmV0dXJuXG5cbiAgdGhlbjogKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSAtPlxuICAgIHAgPSBuZXcgUHJvbWlzZVxuXG4gICAgY2xpZW50ID1cbiAgICAgIHk6IG9uRnVsZmlsbGVkXG4gICAgICBuOiBvblJlamVjdGVkXG4gICAgICBwOiBwXG5cbiAgICBpZiBAc3RhdGUgPT0gU1RBVEVfUEVORElOR1xuICAgICAgIyBXZSBhcmUgcGVuZGluZywgc28gY2xpZW50IG11c3Qgd2FpdCAtIHNvIHB1c2ggY2xpZW50IHRvIGVuZCBvZiB0aGlzLmNcbiAgICAgICMgYXJyYXkgKGNyZWF0ZSBpZiBuZWNlc3NhcnkgZm9yIGVmZmljaWVuY3kpXG4gICAgICBpZiBAY1xuICAgICAgICBAYy5wdXNoIGNsaWVudFxuICAgICAgZWxzZVxuICAgICAgICBAYyA9IFsgY2xpZW50IF1cbiAgICBlbHNlXG4gICAgICBzID0gQHN0YXRlXG4gICAgICBhID0gQHZcbiAgICAgIHNvb24gLT5cbiAgICAgICAgIyBXZSBhcmUgbm90IHBlbmRpbmcsIHNvIHlpZWxkIHNjcmlwdCBhbmQgcmVzb2x2ZS9yZWplY3QgYXMgbmVlZGVkXG4gICAgICAgIGlmIHMgPT0gU1RBVEVfRlVMRklMTEVEXG4gICAgICAgICAgcmVzb2x2ZUNsaWVudCBjbGllbnQsIGFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlamVjdENsaWVudCBjbGllbnQsIGFcbiAgICAgICAgcmV0dXJuXG4gICAgcFxuXG4gIGNhdGNoOiAoY2ZuKSAtPlxuICAgIEB0aGVuIG51bGwsIGNmblxuXG4gIGZpbmFsbHk6IChjZm4pIC0+XG4gICAgQHRoZW4gY2ZuLCBjZm5cblxuICB0aW1lb3V0OiAobXMsIG1zZykgLT5cbiAgICBtc2cgPSBtc2cgb3IgJ3RpbWVvdXQnXG5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAjIFRoaXMgd2lsbCBmYWlsIHNpbGVudGx5IGlmIHByb21pc2UgYWxyZWFkeSByZXNvbHZlZCBvciByZWplY3RlZFxuICAgICAgICByZWplY3QgRXJyb3IobXNnKVxuICAgICAgLCBtc1xuXG4gICAgICAjIFRoaXMgd2lsbCBmYWlsIHNpbGVudGx5IGlmIHByb21pc2UgYWxyZWFkeSB0aW1lZCBvdXRcbiAgICAgIEB0aGVuICh2YWwpIC0+XG4gICAgICAgIHJlc29sdmUgdmFsXG4gICAgICAgIHJldHVyblxuICAgICAgLCAoZXJyKSAtPlxuICAgICAgICByZWplY3QgZXJyXG4gICAgICAgIHJldHVyblxuICAgICAgcmV0dXJuXG5cbiAgY2FsbGJhY2s6IChjYikgLT5cbiAgICBpZiB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgQHRoZW4gICh2YWwpIC0+IGNiIG51bGwsIHZhbFxuICAgICAgQGNhdGNoIChlcnIpIC0+IGNiIGVyciwgbnVsbFxuICAgIEBcblxuZXhwb3J0IGRlZmF1bHQgUHJvbWlzZVxuIiwiaW1wb3J0IFByb21pc2UgZnJvbSAnLi9wcm9taXNlJ1xuaW1wb3J0IFByb21pc2VJbnNwZWN0aW9uIGZyb20gJy4vcHJvbWlzZS1pbnNwZWN0aW9uJ1xuXG5leHBvcnQgcmVzb2x2ZSA9ICh2YWwpIC0+XG4gIHogPSBuZXcgUHJvbWlzZVxuICB6LnJlc29sdmUgdmFsXG4gIHpcblxuZXhwb3J0IHJlamVjdCA9IChlcnIpIC0+XG4gIHogPSBuZXcgUHJvbWlzZVxuICB6LnJlamVjdCBlcnJcbiAgelxuXG5leHBvcnQgYWxsID0gKHBzKSAtPlxuICAjIFNlc3VsdHMgYW5kIHJlc29sdmVkIGNvdW50XG4gIHJlc3VsdHMgPSBbXVxuICByYyAgICAgID0gMFxuICByZXRQICAgID0gbmV3IFByb21pc2UoKVxuXG4gIHJlc29sdmVQcm9taXNlID0gKHAsIGkpIC0+XG4gICAgaWYgIXAgb3IgdHlwZW9mIHAudGhlbiAhPSAnZnVuY3Rpb24nXG4gICAgICBwID0gcmVzb2x2ZShwKVxuXG4gICAgcC50aGVuICh5dikgLT5cbiAgICAgIHJlc3VsdHNbaV0gPSB5dlxuICAgICAgcmMrK1xuICAgICAgaWYgcmMgPT0gcHMubGVuZ3RoXG4gICAgICAgIHJldFAucmVzb2x2ZSByZXN1bHRzXG4gICAgICByZXR1cm5cblxuICAgICwgKG52KSAtPlxuICAgICAgcmV0UC5yZWplY3QgbnZcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuXG5cbiAgcmVzb2x2ZVByb21pc2UgcCwgaSBmb3IgcCwgaSBpbiBwc1xuXG4gICMgRm9yIHplcm8gbGVuZ3RoIGFycmF5cywgcmVzb2x2ZSBpbW1lZGlhdGVseVxuICBpZiAhcHMubGVuZ3RoXG4gICAgcmV0UC5yZXNvbHZlIHJlc3VsdHNcblxuICByZXRQXG5cbmV4cG9ydCByZWZsZWN0ID0gKHByb21pc2UpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgcHJvbWlzZVxuICAgICAgLnRoZW4gKHZhbHVlKSAtPlxuICAgICAgICByZXNvbHZlIG5ldyBQcm9taXNlSW5zcGVjdGlvblxuICAgICAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJ1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICAgIHJlc29sdmUgbmV3IFByb21pc2VJbnNwZWN0aW9uXG4gICAgICAgICAgc3RhdGU6ICdyZWplY3RlZCdcbiAgICAgICAgICByZWFzb246IGVyclxuXG5leHBvcnQgc2V0dGxlID0gKHByb21pc2VzKSAtPlxuICBhbGwgcHJvbWlzZXMubWFwIHJlZmxlY3RcbiIsImltcG9ydCBQcm9taXNlSW5zcGVjdGlvbiBmcm9tICcuL3Byb21pc2UtaW5zcGVjdGlvbidcbmltcG9ydCBQcm9taXNlIGZyb20gJy4vcHJvbWlzZSdcbmltcG9ydCBzb29uIGZyb20gJy4vc29vbidcbmltcG9ydCB7YWxsLCByZWZsZWN0LCByZWplY3QsIHJlc29sdmUsIHNldHRsZX0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5Qcm9taXNlLmFsbCA9IGFsbFxuUHJvbWlzZS5yZWZsZWN0ID0gcmVmbGVjdFxuUHJvbWlzZS5yZWplY3QgPSByZWplY3RcblByb21pc2UucmVzb2x2ZSA9IHJlc29sdmVcblByb21pc2Uuc2V0dGxlID0gc2V0dGxlXG5Qcm9taXNlLnNvb24gPSBzb29uXG5cbmV4cG9ydCBkZWZhdWx0IFByb21pc2VcbiIsInZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHk7XG52YXIgb2JqZWN0QXNzaWduO1xudmFyIHByb3BJc0VudW1lcmFibGU7XG52YXIgc2hvdWxkVXNlTmF0aXZlO1xudmFyIHRvT2JqZWN0O1xudmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbmdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbmhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxucHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbnRvT2JqZWN0ID0gZnVuY3Rpb24odmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICB9XG4gIHJldHVybiBPYmplY3QodmFsKTtcbn07XG5cbnNob3VsZFVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXJyLCBpLCBqLCBrLCBsZW4sIGxldHRlciwgb3JkZXIyLCByZWYsIHRlc3QxLCB0ZXN0MiwgdGVzdDM7XG4gIHRyeSB7XG4gICAgaWYgKCFPYmplY3QuYXNzaWduKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7XG4gICAgdGVzdDFbNV0gPSAnZGUnO1xuICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF0gPT09ICc1Jykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZXN0MiA9IHt9O1xuICAgIGZvciAoaSA9IGogPSAwOyBqIDw9IDk7IGkgPSArK2opIHtcbiAgICAgIHRlc3QyWydfJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoaSldID0gaTtcbiAgICB9XG4gICAgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gdGVzdDJbbl07XG4gICAgfSk7XG4gICAgaWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlc3QzID0ge307XG4gICAgcmVmID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJyk7XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBsZXR0ZXIgPSByZWZba107XG4gICAgICB0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlcnIgPSBlcnJvcjtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbnZhciBpbmRleCA9IG9iamVjdEFzc2lnbiA9IChmdW5jdGlvbigpIHtcbiAgaWYgKHNob3VsZFVzZU5hdGl2ZSgpKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ247XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBmcm9tLCBqLCBrLCBrZXksIGxlbiwgbGVuMSwgcmVmLCBzb3VyY2UsIHNvdXJjZXMsIHN5bWJvbCwgdGFyZ2V0LCB0bztcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbMF0sIHNvdXJjZXMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG4gICAgZm9yIChqID0gMCwgbGVuID0gc291cmNlcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgc291cmNlID0gc291cmNlc1tqXTtcbiAgICAgIGZyb20gPSBPYmplY3Qoc291cmNlKTtcbiAgICAgIGZvciAoa2V5IGluIGZyb20pIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICAgICAgICAgIHRvW2tleV0gPSBmcm9tW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICAgICAgcmVmID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuICAgICAgICBmb3IgKGsgPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgICAgIHN5bWJvbCA9IHJlZltrXTtcbiAgICAgICAgICBpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbCkpIHtcbiAgICAgICAgICAgIHRvW3N5bWJvbF0gPSBmcm9tW3N5bWJvbF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bztcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGluZGV4O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIiwidHJpbSA9IChzKSAtPlxuICBzLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcblxuaXNBcnJheSA9IChvYmopIC0+XG4gIE9iamVjdDo6dG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSdcblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VIZWFkZXJzID0gKGhlYWRlcnMpIC0+XG4gIHJldHVybiB7fSB1bmxlc3MgaGVhZGVyc1xuXG4gIHJlc3VsdCA9IHt9XG5cbiAgZm9yIHJvdyBpbiB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgIGluZGV4ID0gcm93LmluZGV4T2YoJzonKVxuICAgIGtleSA9IHRyaW0ocm93LnNsaWNlKDAsIGluZGV4KSkudG9Mb3dlckNhc2UoKVxuICAgIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcbiAgICBpZiB0eXBlb2YgcmVzdWx0W2tleV0gPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVcbiAgICBlbHNlIGlmIGlzQXJyYXkocmVzdWx0W2tleV0pXG4gICAgICByZXN1bHRba2V5XS5wdXNoIHZhbHVlXG4gICAgZWxzZVxuICAgICAgcmVzdWx0W2tleV0gPSBbXG4gICAgICAgIHJlc3VsdFtrZXldXG4gICAgICAgIHZhbHVlXG4gICAgICBdXG4gICAgcmV0dXJuXG4gIHJlc3VsdFxuIiwiIyMjXG4jIENvcHlyaWdodCAyMDE1IFNjb3R0IEJyYWR5XG4jIE1JVCBMaWNlbnNlXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGJyYWR5L3hoci1wcm9taXNlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiMjI1xuXG5pbXBvcnQgUHJvbWlzZSAgICAgIGZyb20gJ2Jyb2tlbidcbmltcG9ydCBvYmplY3RBc3NpZ24gZnJvbSAnZXMtb2JqZWN0LWFzc2lnbidcbmltcG9ydCBwYXJzZUhlYWRlcnMgZnJvbSAnLi9wYXJzZS1oZWFkZXJzJ1xuXG5kZWZhdWx0cyA9XG4gIG1ldGhvZDogICAnR0VUJ1xuICBoZWFkZXJzOiAge31cbiAgZGF0YTogICAgIG51bGxcbiAgdXNlcm5hbWU6IG51bGxcbiAgcGFzc3dvcmQ6IG51bGxcbiAgYXN5bmM6ICAgIHRydWVcblxuIyMjXG4jIE1vZHVsZSB0byB3cmFwIGFuIFhoclByb21pc2UgaW4gYSBwcm9taXNlLlxuIyMjXG5jbGFzcyBYaHJQcm9taXNlXG5cbiAgQERFRkFVTFRfQ09OVEVOVF9UWVBFOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04J1xuXG4gIEBQcm9taXNlOiBQcm9taXNlXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMgUHVibGljIG1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLnNlbmQob3B0aW9ucykgLT4gUHJvbWlzZVxuICAjIC0gb3B0aW9ucyAoT2JqZWN0KTogVVJMLCBtZXRob2QsIGRhdGEsIGV0Yy5cbiAgI1xuICAjIENyZWF0ZSB0aGUgWEhSIG9iamVjdCBhbmQgd2lyZSB1cCBldmVudCBoYW5kbGVycyB0byB1c2UgYSBwcm9taXNlLlxuICAjIyNcbiAgc2VuZDogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBvcHRpb25zID0gb2JqZWN0QXNzaWduIHt9LCBkZWZhdWx0cywgb3B0aW9uc1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHVubGVzcyBYTUxIdHRwUmVxdWVzdFxuICAgICAgICBAX2hhbmRsZUVycm9yICdicm93c2VyJywgcmVqZWN0LCBudWxsLCBcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0XCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIHR5cGVvZiBvcHRpb25zLnVybCBpc250ICdzdHJpbmcnIHx8IG9wdGlvbnMudXJsLmxlbmd0aCBpcyAwXG4gICAgICAgIEBfaGFuZGxlRXJyb3IgJ3VybCcsIHJlamVjdCwgbnVsbCwgJ1VSTCBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlcidcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgICMgWE1MSHR0cFJlcXVlc3QgaXMgc3VwcG9ydGVkIGJ5IElFIDcrXG4gICAgICBAX3hociA9IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgICMgc3VjY2VzcyBoYW5kbGVyXG4gICAgICB4aHIub25sb2FkID0gPT5cbiAgICAgICAgQF9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlc3BvbnNlVGV4dCA9IEBfZ2V0UmVzcG9uc2VUZXh0KClcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICBAX2hhbmRsZUVycm9yICdwYXJzZScsIHJlamVjdCwgbnVsbCwgJ2ludmFsaWQgSlNPTiByZXNwb25zZSdcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXNvbHZlXG4gICAgICAgICAgdXJsOiAgICAgICAgICBAX2dldFJlc3BvbnNlVXJsKClcbiAgICAgICAgICBoZWFkZXJzOiAgICAgIEBfZ2V0SGVhZGVycygpXG4gICAgICAgICAgcmVzcG9uc2VUZXh0OiByZXNwb25zZVRleHRcbiAgICAgICAgICBzdGF0dXM6ICAgICAgIHhoci5zdGF0dXNcbiAgICAgICAgICBzdGF0dXNUZXh0OiAgIHhoci5zdGF0dXNUZXh0XG4gICAgICAgICAgeGhyOiAgICAgICAgICB4aHJcblxuICAgICAgIyBlcnJvciBoYW5kbGVyc1xuICAgICAgeGhyLm9uZXJyb3IgICA9ID0+IEBfaGFuZGxlRXJyb3IgJ2Vycm9yJywgICByZWplY3RcbiAgICAgIHhoci5vbnRpbWVvdXQgPSA9PiBAX2hhbmRsZUVycm9yICd0aW1lb3V0JywgcmVqZWN0XG4gICAgICB4aHIub25hYm9ydCAgID0gPT4gQF9oYW5kbGVFcnJvciAnYWJvcnQnLCAgIHJlamVjdFxuXG4gICAgICBAX2F0dGFjaFdpbmRvd1VubG9hZCgpXG5cbiAgICAgIHhoci5vcGVuIG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgb3B0aW9ucy5hc3luYywgb3B0aW9ucy51c2VybmFtZSwgb3B0aW9ucy5wYXNzd29yZFxuXG4gICAgICBpZiBvcHRpb25zLmRhdGE/ICYmICFvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBAY29uc3RydWN0b3IuREVGQVVMVF9DT05URU5UX1RZUEVcblxuICAgICAgZm9yIGhlYWRlciwgdmFsdWUgb2Ygb3B0aW9ucy5oZWFkZXJzXG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpXG5cbiAgICAgIHRyeVxuICAgICAgICB4aHIuc2VuZChvcHRpb25zLmRhdGEpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIEBfaGFuZGxlRXJyb3IgJ3NlbmQnLCByZWplY3QsIG51bGwsIGUudG9TdHJpbmcoKVxuXG4gICMjI1xuICAjIFhoclByb21pc2UuZ2V0WEhSKCkgLT4gWGhyUHJvbWlzZVxuICAjIyNcbiAgZ2V0WEhSOiAtPiBAX3hoclxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMjIFBzdWVkby1wcml2YXRlIG1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fYXR0YWNoV2luZG93VW5sb2FkKClcbiAgI1xuICAjIEZpeCBmb3IgSUUgOSBhbmQgSUUgMTBcbiAgIyBJbnRlcm5ldCBFeHBsb3JlciBmcmVlemVzIHdoZW4geW91IGNsb3NlIGEgd2VicGFnZSBkdXJpbmcgYW4gWEhSIHJlcXVlc3RcbiAgIyBodHRwczovL3N1cHBvcnQubWljcm9zb2Z0LmNvbS9rYi8yODU2NzQ2XG4gICNcbiAgIyMjXG4gIF9hdHRhY2hXaW5kb3dVbmxvYWQ6IC0+XG4gICAgQF91bmxvYWRIYW5kbGVyID0gQF9oYW5kbGVXaW5kb3dVbmxvYWQuYmluZChAKVxuICAgIHdpbmRvdy5hdHRhY2hFdmVudCAnb251bmxvYWQnLCBAX3VubG9hZEhhbmRsZXIgaWYgd2luZG93LmF0dGFjaEV2ZW50XG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fZGV0YWNoV2luZG93VW5sb2FkKClcbiAgIyMjXG4gIF9kZXRhY2hXaW5kb3dVbmxvYWQ6IC0+XG4gICAgd2luZG93LmRldGFjaEV2ZW50ICdvbnVubG9hZCcsIEBfdW5sb2FkSGFuZGxlciBpZiB3aW5kb3cuZGV0YWNoRXZlbnRcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRIZWFkZXJzKCkgLT4gT2JqZWN0XG4gICMjI1xuICBfZ2V0SGVhZGVyczogLT5cbiAgICBwYXJzZUhlYWRlcnMgQF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKClcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRSZXNwb25zZVRleHQoKSAtPiBNaXhlZFxuICAjXG4gICMgUGFyc2VzIHJlc3BvbnNlIHRleHQgSlNPTiBpZiBwcmVzZW50LlxuICAjIyNcbiAgX2dldFJlc3BvbnNlVGV4dDogLT5cbiAgICAjIEFjY2Vzc2luZyBiaW5hcnktZGF0YSByZXNwb25zZVRleHQgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpbiBJRTlcbiAgICByZXNwb25zZVRleHQgPSBpZiB0eXBlb2YgQF94aHIucmVzcG9uc2VUZXh0IGlzICdzdHJpbmcnIHRoZW4gQF94aHIucmVzcG9uc2VUZXh0IGVsc2UgJydcblxuICAgIHN3aXRjaCBAX3hoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJylcbiAgICAgIHdoZW4gJ2FwcGxpY2F0aW9uL2pzb24nLCAndGV4dC9qYXZhc2NyaXB0J1xuICAgICAgICAjIFdvcmthcm91bmQgQW5kcm9pZCAyLjMgZmFpbHVyZSB0byBzdHJpbmctY2FzdCBudWxsIGlucHV0XG4gICAgICAgIHJlc3BvbnNlVGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0ICsgJycpXG5cbiAgICByZXNwb25zZVRleHRcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRSZXNwb25zZVVybCgpIC0+IFN0cmluZ1xuICAjXG4gICMgQWN0dWFsIHJlc3BvbnNlIFVSTCBhZnRlciBmb2xsb3dpbmcgcmVkaXJlY3RzLlxuICAjIyNcbiAgX2dldFJlc3BvbnNlVXJsOiAtPlxuICAgIHJldHVybiBAX3hoci5yZXNwb25zZVVSTCBpZiBAX3hoci5yZXNwb25zZVVSTD9cblxuICAgICMgQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgcmV0dXJuIEBfeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJykgaWYgL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoQF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG5cbiAgICAnJ1xuXG4gICMjI1xuICAjIFhoclByb21pc2UuX2hhbmRsZUVycm9yKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpXG4gICMgLSByZWFzb24gKFN0cmluZylcbiAgIyAtIHJlamVjdCAoRnVuY3Rpb24pXG4gICMgLSBzdGF0dXMgKFN0cmluZylcbiAgIyAtIHN0YXR1c1RleHQgKFN0cmluZylcbiAgIyMjXG4gIF9oYW5kbGVFcnJvcjogKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpIC0+XG4gICAgQF9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgcmVqZWN0XG4gICAgICByZWFzb246ICAgICByZWFzb25cbiAgICAgIHN0YXR1czogICAgIHN0YXR1cyAgICAgb3IgQF94aHIuc3RhdHVzXG4gICAgICBzdGF0dXNUZXh0OiBzdGF0dXNUZXh0IG9yIEBfeGhyLnN0YXR1c1RleHRcbiAgICAgIHhocjogICAgICAgIEBfeGhyXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5faGFuZGxlV2luZG93VW5sb2FkKClcbiAgIyMjXG4gIF9oYW5kbGVXaW5kb3dVbmxvYWQ6IC0+XG4gICAgQF94aHIuYWJvcnQoKVxuXG5leHBvcnQgZGVmYXVsdCBYaHJQcm9taXNlXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG59XG4iLCJpbXBvcnQgdG9TdHJpbmcgZnJvbSAnZXMtdG9zdHJpbmcnXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgbnVtYmVyLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIG51bWJlciwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgZGVmYXVsdCBpc051bWJlciA9ICh2YWx1ZSkgLT5cbiAgdG9TdHJpbmcodmFsdWUpID09ICdbb2JqZWN0IE51bWJlcl0nXG4iLCJnZXRPd25TeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9sc1xuXG50b09iamVjdCA9ICh2YWwpIC0+XG4gIGlmIHZhbCA9PSBudWxsIG9yIHZhbCA9PSB1bmRlZmluZWRcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpXG4gIE9iamVjdCB2YWxcblxuc2hvdWxkVXNlTmF0aXZlID0gLT5cbiAgdHJ5XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBPYmplY3QuYXNzaWduXG5cbiAgICAjIERldGVjdCBidWdneSBwcm9wZXJ0eSBlbnVtZXJhdGlvbiBvcmRlciBpbiBvbGRlciBWOCB2ZXJzaW9ucy5cblxuICAgICMgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuICAgIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJylcbiAgICB0ZXN0MVs1XSA9ICdkZSdcbiAgICByZXR1cm4gZmFsc2UgaWYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09ICc1J1xuXG4gICAgIyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG4gICAgdGVzdDIgPSB7fVxuICAgIGZvciBpIGluIFswLi45XVxuICAgICAgdGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpXG4gICAgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcCAobikgLT4gdGVzdDJbbl1cbiAgICByZXR1cm4gZmFsc2UgaWYgb3JkZXIyLmpvaW4oJycpICE9ICcwMTIzNDU2Nzg5J1xuXG4gICAgIyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG4gICAgdGVzdDMgPSB7fVxuICAgIGZvciBsZXR0ZXIgaW4gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJylcbiAgICAgIHRlc3QzW2xldHRlcl0gPSBsZXR0ZXJcbiAgICBpZiBPYmplY3Qua2V5cyhPYmplY3QuYXNzaWduKHt9LCB0ZXN0MykpLmpvaW4oJycpICE9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCdcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcbiAgY2F0Y2ggZXJyXG4gICAgIyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuICAgIGZhbHNlXG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdEFzc2lnbiA9IGRvIC0+XG4gIHJldHVybiBPYmplY3QuYXNzaWduIGlmIHNob3VsZFVzZU5hdGl2ZSgpXG5cbiAgKHRhcmdldCwgc291cmNlcy4uLikgLT5cbiAgICB0byA9IHRvT2JqZWN0IHRhcmdldFxuXG4gICAgZm9yIHNvdXJjZSBpbiBzb3VyY2VzXG4gICAgICBmcm9tID0gT2JqZWN0KHNvdXJjZSlcbiAgICAgIGZvciBrZXkgb2YgZnJvbVxuICAgICAgICBpZiBPYmplY3Q6Omhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KVxuICAgICAgICAgIHRvW2tleV0gPSBmcm9tW2tleV1cbiAgICAgIGlmIGdldE93blN5bWJvbHNcbiAgICAgICAgZm9yIHN5bWJvbCBpbiBnZXRPd25TeW1ib2xzKGZyb20pXG4gICAgICAgICAgaWYgT2JqZWN0Ojpwcm9wSXNFbnVtZXJhYmxlLmNhbGwgZnJvbSwgc3ltYm9sXG4gICAgICAgICAgICB0b1tzeW1ib2xdID0gZnJvbVtzeW1ib2xdXG4gICAgdG9cbiIsImltcG9ydCBpc051bWJlciAgICAgZnJvbSAnZXMtaXMvbnVtYmVyJ1xuaW1wb3J0IG9iamVjdEFzc2lnbiBmcm9tICdlcy1vYmplY3QtYXNzaWduJ1xuXG5cbmNsYXNzIENvb2tpZXNcbiAgY29uc3RydWN0b3I6IChAZGVmYXVsdHMgPSB7fSkgLT5cbiAgICBAZ2V0ICAgICA9IChrZXkpID0+IEByZWFkIGtleVxuICAgIEBnZXRKU09OID0gKGtleSkgPT5cbiAgICAgIHRyeVxuICAgICAgICBKU09OLnBhcnNlIEByZWFkIGtleVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIHt9XG5cbiAgICBAcmVtb3ZlID0gKGtleSwgYXR0cnMpICAgICAgICA9PiBAd3JpdGUga2V5LCAnJywgb2JqZWN0QXNzaWduIGV4cGlyZXM6IC0xLCBhdHRyc1xuICAgIEBzZXQgICAgPSAoa2V5LCB2YWx1ZSwgYXR0cnMpID0+IEB3cml0ZSBrZXksIHZhbHVlLCBhdHRyc1xuXG4gIHJlYWQ6IChrZXkpIC0+XG4gICAgdW5sZXNzIGtleVxuICAgICAgcmVzdWx0ID0ge31cblxuICAgICMgVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheSBpbiBjYXNlXG4gICAgIyB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuIGNhbGxpbmdcbiAgICAjIFwiZ2V0KClcIlxuICAgIGNvb2tpZXMgPSBpZiBkb2N1bWVudC5jb29raWUgdGhlbiBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgZWxzZSBbXVxuICAgIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2dcblxuICAgIGZvciBrdiBpbiBjb29raWVzXG4gICAgICBwYXJ0cyAgPSBrdi5zcGxpdCAnPSdcbiAgICAgIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4gJz0nXG5cbiAgICAgIGlmIGNvb2tpZS5jaGFyQXQoMCkgPT0gJ1wiJ1xuICAgICAgICBjb29raWUgPSBjb29raWUuc2xpY2UgMSwgLTFcblxuICAgICAgdHJ5XG4gICAgICAgIG5hbWUgICA9IHBhcnRzWzBdLnJlcGxhY2UgcmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50XG4gICAgICAgIGNvb2tpZSA9IGNvb2tpZS5yZXBsYWNlICAgcmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50XG5cbiAgICAgICAgaWYga2V5ID09IG5hbWVcbiAgICAgICAgICByZXR1cm4gY29va2llXG4gICAgICAgIHVubGVzcyBrZXlcbiAgICAgICAgICByZXN1bHRbbmFtZV0gPSBjb29raWVcblxuICAgICAgY2F0Y2ggZXJyXG5cbiAgICByZXN1bHRcblxuICB3cml0ZTogKGtleSwgdmFsdWUsIGF0dHJzKSAtPlxuICAgIGF0dHJzID0gb2JqZWN0QXNzaWduIHBhdGg6ICcvJywgQGRlZmF1bHRzLCBhdHRyc1xuXG4gICAgaWYgaXNOdW1iZXIgYXR0cnMuZXhwaXJlc1xuICAgICAgZXhwaXJlcyA9IG5ldyBEYXRlXG4gICAgICBleHBpcmVzLnNldE1pbGxpc2Vjb25kcyBleHBpcmVzLmdldE1pbGxpc2Vjb25kcygpICsgYXR0cnMuZXhwaXJlcyAqIDg2NGUrNVxuICAgICAgYXR0cnMuZXhwaXJlcyA9IGV4cGlyZXNcblxuICAgICMgV2UncmUgdXNpbmcgXCJleHBpcmVzXCIgYmVjYXVzZSBcIm1heC1hZ2VcIiBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG4gICAgYXR0cnMuZXhwaXJlcyA9IGlmIGF0dHJzLmV4cGlyZXMgdGhlbiBhdHRycy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgZWxzZSAnJ1xuXG4gICAgdHJ5XG4gICAgICByZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgICAgIGlmIC9eW1xce1xcW10vLnRlc3QocmVzdWx0KVxuICAgICAgICB2YWx1ZSA9IHJlc3VsdFxuICAgIGNhdGNoIGVyclxuXG4gICAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgIGtleSAgID0gZW5jb2RlVVJJQ29tcG9uZW50IFN0cmluZyBrZXlcbiAgICBrZXkgICA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpXG4gICAga2V5ICAgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKVxuXG4gICAgc3RyQXR0cnMgPSAnJ1xuXG4gICAgZm9yIG5hbWUsIGF0dHIgb2YgYXR0cnNcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBhdHRyXG4gICAgICBzdHJBdHRycyArPSAnOyAnICsgbmFtZVxuICAgICAgY29udGludWUgaWYgYXR0ciA9PSB0cnVlXG4gICAgICBzdHJBdHRycyArPSAnPScgKyBhdHRyXG5cbiAgICBkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0ckF0dHJzXG5cblxuZXhwb3J0IGRlZmF1bHQgQ29va2llc1xuIiwiaW1wb3J0IENvb2tpZXMgZnJvbSAnLi9jb29raWVzJ1xuZXhwb3J0IGRlZmF1bHQgbmV3IENvb2tpZXMoKVxuIiwiaW1wb3J0IGNvb2tpZXMgZnJvbSAnZXMtY29va2llcydcblxuaW1wb3J0IHtpc0Z1bmN0aW9uLCB1cGRhdGVRdWVyeX0gZnJvbSAnLi4vdXRpbHMnXG5cblxuY2xhc3MgQ2xpZW50XG4gIGNvbnN0cnVjdG9yOiAob3B0cyA9IHt9KSAtPlxuICAgIEBvcHRzID1cbiAgICAgIGRlYnVnOiAgICBmYWxzZVxuICAgICAgZW5kcG9pbnQ6ICdodHRwczovL2FwaS5oYW56by5pbydcbiAgICAgIHNlc3Npb246XG4gICAgICAgIG5hbWU6ICAgICdoem8nXG4gICAgICAgIGV4cGlyZXM6IDcgKiAyNCAqIDM2MDAgKiAxMDAwXG5cbiAgICBmb3Igayx2IG9mIG9wdHNcbiAgICAgIEBvcHRzW2tdID0gdlxuXG4gIGdldEtleTogLT5cbiAgICBAb3B0cy5rZXlcblxuICBzZXRLZXk6IChrZXkpIC0+XG4gICAgQG9wdHMua2V5ID0ga2V5XG5cbiAgZ2V0Q3VzdG9tZXJUb2tlbjogLT5cbiAgICBpZiAoc2Vzc2lvbiA9IGNvb2tpZXMuZ2V0SlNPTiBAb3B0cy5zZXNzaW9uLm5hbWUpP1xuICAgICAgQGN1c3RvbWVyVG9rZW4gPSBzZXNzaW9uLmN1c3RvbWVyVG9rZW4gaWYgc2Vzc2lvbi5jdXN0b21lclRva2VuP1xuICAgIEBjdXN0b21lclRva2VuXG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBjb29raWVzLnNldCBAb3B0cy5zZXNzaW9uLm5hbWUsIHtjdXN0b21lclRva2VuOiBrZXl9LCBleHBpcmVzOiBAb3B0cy5zZXNzaW9uLmV4cGlyZXNcbiAgICBAY3VzdG9tZXJUb2tlbiA9IGtleVxuXG4gIGRlbGV0ZUN1c3RvbWVyVG9rZW46IC0+XG4gICAgY29va2llcy5zZXQgQG9wdHMuc2Vzc2lvbi5uYW1lLCB7Y3VzdG9tZXJUb2tlbjogbnVsbH0sIGV4cGlyZXM6IEBvcHRzLnNlc3Npb24uZXhwaXJlc1xuICAgIEBjdXN0b21lclRva2VuID0gbnVsbFxuXG4gIHVybDogKHVybCwgZGF0YSwga2V5KSAtPlxuICAgIGlmIGlzRnVuY3Rpb24gdXJsXG4gICAgICB1cmwgPSB1cmwuY2FsbCBALCBkYXRhXG5cbiAgICB1cGRhdGVRdWVyeSAoQG9wdHMuZW5kcG9pbnQgKyB1cmwpLCB0b2tlbjoga2V5XG5cbiAgbG9nOiAoYXJncy4uLikgLT5cbiAgICBhcmdzLnVuc2hpZnQgJ2hhbnpvLmpzPidcbiAgICBpZiBAb3B0cy5kZWJ1ZyBhbmQgY29uc29sZT9cbiAgICAgIGNvbnNvbGUubG9nIGFyZ3MuLi5cblxuZXhwb3J0IGRlZmF1bHQgQ2xpZW50XG4iLCJpbXBvcnQgWGhyIGZyb20gJ2VzLXhoci1wcm9taXNlJ1xuXG5pbXBvcnQgQ2xpZW50ICAgICBmcm9tICcuL2NsaWVudCdcbmltcG9ydCB7bmV3RXJyb3IsIHVwZGF0ZVF1ZXJ5fSBmcm9tICcuLi91dGlscydcblxuY2xhc3MgQnJvd3NlckNsaWVudCBleHRlbmRzIENsaWVudFxuICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgcmV0dXJuIG5ldyBCcm93c2VyQ2xpZW50IG9wdHMgdW5sZXNzIEAgaW5zdGFuY2VvZiBCcm93c2VyQ2xpZW50XG4gICAgc3VwZXIgb3B0c1xuICAgIEBnZXRDdXN0b21lclRva2VuKClcblxuICByZXF1ZXN0OiAoYmx1ZXByaW50LCBkYXRhPXt9LCBrZXkgPSBAZ2V0S2V5KCkpIC0+XG4gICAgb3B0cyA9XG4gICAgICB1cmw6ICAgIEB1cmwgYmx1ZXByaW50LnVybCwgZGF0YSwga2V5XG4gICAgICBtZXRob2Q6IGJsdWVwcmludC5tZXRob2RcblxuICAgIGlmIGJsdWVwcmludC5tZXRob2QgIT0gJ0dFVCdcbiAgICAgIG9wdHMuaGVhZGVycyA9XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcblxuICAgIGlmIGJsdWVwcmludC5tZXRob2QgPT0gJ0dFVCdcbiAgICAgIG9wdHMudXJsICA9IHVwZGF0ZVF1ZXJ5IG9wdHMudXJsLCBkYXRhXG4gICAgZWxzZVxuICAgICAgb3B0cy5kYXRhID0gSlNPTi5zdHJpbmdpZnkgZGF0YVxuXG4gICAgQGxvZyAncmVxdWVzdCcsIGtleToga2V5LCBvcHRzOiBvcHRzXG5cbiAgICAobmV3IFhocikuc2VuZCBvcHRzXG4gICAgICAudGhlbiAocmVzKSA9PlxuICAgICAgICBAbG9nICdyZXNwb25zZScsIHJlc1xuICAgICAgICByZXMuZGF0YSA9IHJlcy5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzXG4gICAgICAuY2F0Y2ggKHJlcykgPT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzLmRhdGEgPSByZXMucmVzcG9uc2VUZXh0ID8gKEpTT04ucGFyc2UgcmVzLnhoci5yZXNwb25zZVRleHQpXG4gICAgICAgIGNhdGNoIGVyclxuXG4gICAgICAgIGVyciA9IG5ld0Vycm9yIGRhdGEsIHJlcywgZXJyXG4gICAgICAgIEBsb2cgJ3Jlc3BvbnNlJywgcmVzXG4gICAgICAgIEBsb2cgJ2Vycm9yJywgZXJyXG5cbiAgICAgICAgdGhyb3cgZXJyXG5cbmV4cG9ydCBkZWZhdWx0IEJyb3dzZXJDbGllbnRcbiIsImltcG9ydCB7aXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnXG5cbiMgV3JhcCBhIHVybCBmdW5jdGlvbiB0byBwcm92aWRlIHN0b3JlLXByZWZpeGVkIFVSTHNcbmV4cG9ydCBzdG9yZVByZWZpeGVkID0gc3AgPSAodSkgLT5cbiAgKHgpIC0+XG4gICAgaWYgaXNGdW5jdGlvbiB1XG4gICAgICB1cmwgPSB1IHhcbiAgICBlbHNlXG4gICAgICB1cmwgPSB1XG5cbiAgICBpZiBAc3RvcmVJZD9cbiAgICAgIFwiL3N0b3JlLyN7QHN0b3JlSWR9XCIgKyB1cmxcbiAgICBlbHNlXG4gICAgICB1cmxcblxuIyBSZXR1cm5zIGEgVVJMIGZvciBnZXR0aW5nIGEgc2luZ2xlXG5leHBvcnQgYnlJZCA9IChuYW1lKSAtPlxuICBzd2l0Y2ggbmFtZVxuICAgIHdoZW4gJ2NvdXBvbidcbiAgICAgIHNwICh4KSAtPiBcIi9jb3Vwb24vI3t4LmNvZGUgPyB4fVwiXG4gICAgd2hlbiAnY29sbGVjdGlvbidcbiAgICAgIHNwICh4KSAtPiBcIi9jb2xsZWN0aW9uLyN7eC5zbHVnID8geH1cIlxuICAgIHdoZW4gJ3Byb2R1Y3QnXG4gICAgICBzcCAoeCkgLT4gXCIvcHJvZHVjdC8je3guaWQgPyB4LnNsdWcgPyB4fVwiXG4gICAgd2hlbiAndmFyaWFudCdcbiAgICAgIHNwICh4KSAtPiBcIi92YXJpYW50LyN7eC5pZCA/IHguc2t1ID8geH1cIlxuICAgIHdoZW4gJ3NpdGUnXG4gICAgICAoeCkgLT4gXCIvc2l0ZS8je3guaWQgPyB4Lm5hbWUgPyB4fVwiXG4gICAgZWxzZVxuICAgICAgKHgpIC0+IFwiLyN7bmFtZX0vI3t4LmlkID8geH1cIlxuIiwiaW1wb3J0IHtcbiAgR0VUXG4gIFBPU1RcbiAgUEFUQ0hcbiAgaXNGdW5jdGlvblxuICBzdGF0dXNDcmVhdGVkXG4gIHN0YXR1c05vQ29udGVudFxuICBzdGF0dXNPa1xufSBmcm9tICcuLi91dGlscydcblxuaW1wb3J0IHtieUlkLCBzdG9yZVByZWZpeGVkfSBmcm9tICcuL3VybCdcblxuIyBPbmx5IGxpc3QsIGdldCBtZXRob2RzIG9mIGEgZmV3IG1vZGVscyBhcmUgc3VwcG9ydGVkIHdpdGggYSBwdWJsaXNoYWJsZSBrZXksXG4jIHNvIG9ubHkgdGhlc2UgbWV0aG9kcyBhcmUgZXhwb3NlZCBpbiB0aGUgYnJvd3Nlci5cbmNyZWF0ZUJsdWVwcmludCA9IChuYW1lKSAtPlxuICBlbmRwb2ludCA9IFwiLyN7bmFtZX1cIlxuXG4gIGxpc3Q6XG4gICAgdXJsOiAgICAgZW5kcG9pbnRcbiAgICBtZXRob2Q6ICBHRVRcbiAgICBleHBlY3RzOiBzdGF0dXNPa1xuICBnZXQ6XG4gICAgdXJsOiAgICAgYnlJZCBuYW1lXG4gICAgbWV0aG9kOiAgR0VUXG4gICAgZXhwZWN0czogc3RhdHVzT2tcblxuYmx1ZXByaW50cyA9XG4gICMgQUNDT1VOVFxuICBhY2NvdW50OlxuICAgIGdldDpcbiAgICAgIHVybDogICAgICcvYWNjb3VudCdcbiAgICAgIG1ldGhvZDogIEdFVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIHVwZGF0ZTpcbiAgICAgIHVybDogICAgICcvYWNjb3VudCdcbiAgICAgIG1ldGhvZDogIFBBVENIXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgdXNlQ3VzdG9tZXJUb2tlbjogdHJ1ZVxuXG4gICAgZXhpc3RzOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvZXhpc3RzLyN7eC5lbWFpbCA/IHgudXNlcm5hbWUgPyB4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgR0VUXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgcHJvY2VzczogKHJlcykgLT4gcmVzLmRhdGEuZXhpc3RzXG5cbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQvY3JlYXRlJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzQ3JlYXRlZFxuXG4gICAgZW5hYmxlOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvZW5hYmxlLyN7eC50b2tlbklkID8geH1cIlxuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIGxvZ2luOlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L2xvZ2luJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHByb2Nlc3M6IChyZXMpIC0+XG4gICAgICAgIEBzZXRDdXN0b21lclRva2VuIHJlcy5kYXRhLnRva2VuXG4gICAgICAgIHJlc1xuXG4gICAgbG9nb3V0OiAtPlxuICAgICAgQGRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gICAgcmVzZXQ6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQvcmVzZXQnXG4gICAgICBtZXRob2Q6ICBQT1NUXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgdXNlQ3VzdG9tZXJUb2tlbjogdHJ1ZVxuXG4gICAgdXBkYXRlT3JkZXI6XG4gICAgICB1cmw6ICAgICAoeCkgLT4gXCIvYWNjb3VudC9vcmRlci8je3gub3JkZXJJZCA/IHguaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICBQQVRDSFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIGNvbmZpcm06XG4gICAgICB1cmw6ICAgICAoeCkgLT4gXCIvYWNjb3VudC9jb25maXJtLyN7eC50b2tlbklkID8geH1cIlxuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAjIENBUlRcbiAgY2FydDpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAgJy9jYXJ0J1xuICAgICAgbWV0aG9kOiAgIFBPU1RcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNDcmVhdGVkXG4gICAgdXBkYXRlOlxuICAgICAgdXJsOiAgICAgICh4KSAtPiBcIi9jYXJ0LyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICBQQVRDSFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG4gICAgZGlzY2FyZDpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fS9kaXNjYXJkXCJcbiAgICAgIG1ldGhvZDogICBQT1NUXG4gICAgICBleHBlY3RzOiAgc3RhdHVzT2tcbiAgICBzZXQ6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH0vc2V0XCJcbiAgICAgIG1ldGhvZDogICBQT1NUXG4gICAgICBleHBlY3RzOiAgc3RhdHVzT2tcblxuICAjIFJFVklFV1NcbiAgcmV2aWV3OlxuICAgIGNyZWF0ZTpcbiAgICAgIHVybDogICAgICAnL3JldmlldydcbiAgICAgIG1ldGhvZDogICBQT1NUXG4gICAgICBleHBlY3RzOiAgc3RhdHVzQ3JlYXRlZFxuICAgIGdldDpcbiAgICAgIHVybDogICAgICAoeCktPiBcIi9yZXZpZXcvI3t4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgIEdFVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG5cbiAgIyBDSEVDS09VVFxuICBjaGVja291dDpcbiAgICBhdXRob3JpemU6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvYXV0aG9yaXplJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIGNhcHR1cmU6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICh4KSAtPiBcIi9jaGVja291dC9jYXB0dXJlLyN7eC5vcmRlcklkID8geH1cIlxuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIGNoYXJnZTpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgJy9jaGVja291dC9jaGFyZ2UnXG4gICAgICBtZXRob2Q6ICBQT1NUXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICAgcGF5cGFsOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAnL2NoZWNrb3V0L3BheXBhbCdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgIyBSRUZFUlJFUlxuICByZWZlcnJlcjpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAnL3JlZmVycmVyJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzQ3JlYXRlZFxuXG4gICAgZ2V0OlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL3JlZmVycmVyLyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIEdFVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuIyBNT0RFTFNcbm1vZGVscyA9IFtcbiAgJ2NvbGxlY3Rpb24nXG4gICdjb3Vwb24nXG4gICdwcm9kdWN0J1xuICAndmFyaWFudCdcbl1cblxuZm9yIG1vZGVsIGluIG1vZGVsc1xuICBkbyAobW9kZWwpIC0+XG4gICAgYmx1ZXByaW50c1ttb2RlbF0gPSBjcmVhdGVCbHVlcHJpbnQgbW9kZWxcblxuZXhwb3J0IGRlZmF1bHQgYmx1ZXByaW50c1xuIiwiaW1wb3J0IEFwaSAgICAgICAgZnJvbSAnLi9hcGknXG5pbXBvcnQgQ2xpZW50ICAgICBmcm9tICcuL2NsaWVudC9icm93c2VyJ1xuaW1wb3J0IGJsdWVwcmludHMgZnJvbSAnLi9ibHVlcHJpbnRzL2Jyb3dzZXInXG5cbkFwaS5CTFVFUFJJTlRTID0gYmx1ZXByaW50c1xuQXBpLkNMSUVOVCAgICAgPSBDbGllbnRcblxuSGFuem8gPSAob3B0cyA9IHt9KSAtPlxuICBvcHRzLmNsaWVudCAgICAgPz0gbmV3IENsaWVudCBvcHRzXG4gIG9wdHMuYmx1ZXByaW50cyA/PSBibHVlcHJpbnRzXG4gIG5ldyBBcGkgb3B0c1xuXG5IYW56by5BcGkgICAgICAgID0gQXBpXG5IYW56by5DbGllbnQgICAgID0gQ2xpZW50XG5cbmV4cG9ydCBkZWZhdWx0IEhhbnpvXG5leHBvcnQge0FwaSwgQ2xpZW50fVxuIl0sIm5hbWVzIjpbIl91bmRlZmluZWQiLCJfdW5kZWZpbmVkU3RyaW5nIiwiUHJvbWlzZSIsInNvb24iLCJQcm9taXNlSW5zcGVjdGlvbiIsImluZGV4Iiwib2JqZWN0QXNzaWduIiwicGFyc2VIZWFkZXJzIiwic2xpY2UiLCJ0b09iamVjdCIsInNob3VsZFVzZU5hdGl2ZSIsImlzTnVtYmVyIiwiQ29va2llcyIsIkNsaWVudCIsImNvb2tpZXMiLCJYaHIiLCJBcGkiLCJibHVlcHJpbnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsSUFBQTs7QUFBQSxBQUFBLElBQU8sVUFBUCxHQUFvQixTQUFDLEVBQUQ7U0FBUSxPQUFPLEVBQVAsS0FBYTs7O0FBQ3pDLEFBQUE7O0FBR0EsQUFBQSxJQUFPLFFBQVAsR0FBeUIsU0FBQyxHQUFEO1NBQVMsR0FBRyxDQUFDLE1BQUosS0FBYzs7O0FBQ2hELEFBQUEsSUFBTyxhQUFQLEdBQXlCLFNBQUMsR0FBRDtTQUFTLEdBQUcsQ0FBQyxNQUFKLEtBQWM7OztBQUNoRCxBQUFBOztBQUdBLEFBQUEsSUFBTyxHQUFQLEdBQWU7O0FBQ2Ys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
