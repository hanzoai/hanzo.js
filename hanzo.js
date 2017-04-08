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

// node_modules/es-is/dist/index.mjs
// src/index.coffee
var isActualNaN;
var isArgs;
var isFn;
var objProto;
var owns;
var symbolValueOf;
var toStr;

objProto = Object.prototype;

owns = objProto.hasOwnProperty;

toStr = objProto.toString;

symbolValueOf = void 0;

if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}

isActualNaN = function(value) {
  return value !== value;
};

var isEqual = function(value, other) {
  var key, type;
  if (value === other) {
    return true;
  }
  type = toStr.call(value);
  if (type !== toStr.call(other)) {
    return false;
  }
  if (type === '[object Object]') {
    for (key in value) {
      if (!isEqual(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!isEqual(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!isEqual(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }
  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }
  return false;
};

var isArrayLike = function(value) {
  return !!value && !isBool(value) && owns.call(value, 'length') && isFinite(value.length) && isNumber(value.length) && value.length >= 0;
};

var isArguments = isArgs = function(value) {
  var isOldArguments, isStandardArguments;
  isStandardArguments = toStr.call(value) === '[object Arguments]';
  isOldArguments = !isArray$1(value) && isArrayLike(value) && isObject(value) && isFn(value.callee);
  return isStandardArguments || isOldArguments;
};

var isArray$1 = Array.isArray || function(value) {
  return toStr.call(value) === '[object Array]';
};

var isBool = function(value) {
  return toStr.call(value) === '[object Boolean]';
};

var isFunction$1 = isFn = function(value) {
  var isAlert, str;
  isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  str = toStr.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

var isNumber = function(value) {
  return toStr.call(value) === '[object Number]';
};

var isObject = function(value) {
  return toStr.call(value) === '[object Object]';
};

// node_modules/es-cookies/lib/cookies.mjs
// src/cookies.coffee
var Cookies;

Cookies = (function() {
  function Cookies(defaults) {
    this.defaults = defaults != null ? defaults : {};
    this.get = (function(_this) {
      return function(key) {
        return _this.api(key);
      };
    })(this);
    this.remove = (function(_this) {
      return function(key, attrs) {
        return _this.api(key, '', index({
          expires: -1
        }, attrs));
      };
    })(this);
    this.set = (function(_this) {
      return function(key, value, attrs) {
        return _this.api(key, value, attrs);
      };
    })(this);
    this.getJSON = (function(_this) {
      return function(key) {
        var err, val;
        val = _this.api(key);
        if (val == null) {
          return {};
        }
        try {
          return JSON.parse(val);
        } catch (error) {
          err = error;
          return val;
        }
      };
    })(this);
  }

  Cookies.prototype.api = function(key, value, attrs) {
    var attr, cookie, cookies, err, expires, i, kv, len, name, parts, rdecode, result, strAttrs;
    if (typeof document === 'undefined') {
      return;
    }
    if (arguments.length > 1) {
      attrs = index({
        path: '/'
      }, this.defaults, attrs);
      if (isNumber(attrs.expires)) {
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
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuem8uanMiLCJzb3VyY2VzIjpbInNyYy91dGlscy5jb2ZmZWUiLCJzcmMvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9wcm9taXNlLWluc3BlY3Rpb24uY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXhoci1wcm9taXNlL25vZGVfbW9kdWxlcy9icm9rZW4vc3JjL3V0aWxzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9zb29uLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9wcm9taXNlLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9oZWxwZXJzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9ub2RlX21vZHVsZXMvYnJva2VuL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtb2JqZWN0LWFzc2lnbi9pbmRleC5tanMiLCJub2RlX21vZHVsZXMvZXMteGhyLXByb21pc2Uvc3JjL3BhcnNlLWhlYWRlcnMuY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXhoci1wcm9taXNlL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtaXMvc3JjL2luZGV4LmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL3NyYy9jb29raWVzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL3NyYy9pbmRleC5jb2ZmZWUiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvY2xpZW50L2Jyb3dzZXIuY29mZmVlIiwic3JjL2JsdWVwcmludHMvdXJsLmNvZmZlZSIsInNyYy9ibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwic3JjL2Jyb3dzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMgSGVscGVyc1xuZXhwb3J0IGlzRnVuY3Rpb24gPSAoZm4pIC0+IHR5cGVvZiBmbiBpcyAnZnVuY3Rpb24nXG5leHBvcnQgaXNTdHJpbmcgICA9IChzKSAgLT4gdHlwZW9mIHMgIGlzICdzdHJpbmcnXG5cbiMgRmV3IHN0YXR1cyBjb2RlcyB3ZSB1c2UgdGhyb3VnaG91dCBjb2RlIGJhc2VcbmV4cG9ydCBzdGF0dXNPayAgICAgICAgPSAocmVzKSAtPiByZXMuc3RhdHVzIGlzIDIwMFxuZXhwb3J0IHN0YXR1c0NyZWF0ZWQgICA9IChyZXMpIC0+IHJlcy5zdGF0dXMgaXMgMjAxXG5leHBvcnQgc3RhdHVzTm9Db250ZW50ID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDRcblxuIyBBbGxvdyBtZXRob2QgbmFtZXMgdG8gYmUgbWluaWZpZWRcbmV4cG9ydCBHRVQgICA9ICdHRVQnXG5leHBvcnQgUE9TVCAgPSAnUE9TVCdcbmV4cG9ydCBQQVRDSCA9ICdQQVRDSCdcblxuIyBUaHJvdyBcImZhdFwiIGVycm9ycy5cbmV4cG9ydCBuZXdFcnJvciA9IChkYXRhLCByZXMgPSB7fSwgZXJyKSAtPlxuICBtZXNzYWdlID0gcmVzLmRhdGE/LmVycm9yPy5tZXNzYWdlID8gJ1JlcXVlc3QgZmFpbGVkJ1xuXG4gIHVubGVzcyBlcnI/XG4gICAgZXJyID0gbmV3IEVycm9yIG1lc3NhZ2VcblxuICBlcnIuZGF0YSAgICAgICAgID0gcmVzLmRhdGFcbiAgZXJyLm1zZyAgICAgICAgICA9IG1lc3NhZ2VcbiAgZXJyLnJlcSAgICAgICAgICA9IGRhdGFcbiAgZXJyLnJlc3BvbnNlVGV4dCA9IHJlcy5kYXRhXG4gIGVyci5zdGF0dXMgICAgICAgPSByZXMuc3RhdHVzXG4gIGVyci50eXBlICAgICAgICAgPSByZXMuZGF0YT8uZXJyb3I/LnR5cGVcbiAgZXJyXG5cbiMgVXBkYXRlIHBhcmFtIGluIHF1ZXJ5XG51cGRhdGVQYXJhbSA9ICh1cmwsIGtleSwgdmFsdWUpIC0+XG4gIHJlID0gbmV3IFJlZ0V4cCgnKFs/Jl0pJyArIGtleSArICc9Lio/KCZ8I3wkKSguKiknLCAnZ2knKVxuXG4gIGlmIHJlLnRlc3QgdXJsXG4gICAgaWYgdmFsdWU/XG4gICAgICB1cmwucmVwbGFjZSByZSwgJyQxJyArIGtleSArICc9JyArIHZhbHVlICsgJyQyJDMnXG4gICAgZWxzZVxuICAgICAgaGFzaCA9IHVybC5zcGxpdCAnIydcbiAgICAgIHVybCA9IGhhc2hbMF0ucmVwbGFjZShyZSwgJyQxJDMnKS5yZXBsYWNlKC8oJnxcXD8pJC8sICcnKVxuICAgICAgdXJsICs9ICcjJyArIGhhc2hbMV0gaWYgaGFzaFsxXT9cbiAgICAgIHVybFxuICBlbHNlXG4gICAgaWYgdmFsdWU/XG4gICAgICBzZXBhcmF0b3IgPSBpZiB1cmwuaW5kZXhPZignPycpICE9IC0xIHRoZW4gJyYnIGVsc2UgJz8nXG4gICAgICBoYXNoID0gdXJsLnNwbGl0ICcjJ1xuICAgICAgdXJsID0gaGFzaFswXSArIHNlcGFyYXRvciArIGtleSArICc9JyArIHZhbHVlXG4gICAgICB1cmwgKz0gJyMnICsgaGFzaFsxXSBpZiBoYXNoWzFdP1xuICAgICAgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgVXBkYXRlIHF1ZXJ5IG9uIHVybFxuZXhwb3J0IHVwZGF0ZVF1ZXJ5ID0gKHVybCwgZGF0YSkgLT5cbiAgcmV0dXJuIHVybCBpZiB0eXBlb2YgZGF0YSAhPSAnb2JqZWN0J1xuXG4gIGZvciBrLHYgb2YgZGF0YVxuICAgIHVybCA9IHVwZGF0ZVBhcmFtIHVybCwgaywgdlxuICB1cmxcbiIsImltcG9ydCB7R0VULCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgbmV3RXJyb3IsIHN0YXR1c09rfSBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBBcGlcbiAgQEJMVUVQUklOVFMgPSB7fVxuICBAQ0xJRU5UICAgICA9IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IEFwaSBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQXBpXG5cbiAgICB7Ymx1ZXByaW50cywgY2xpZW50fSA9IG9wdHNcblxuICAgIEBjbGllbnQgPSBjbGllbnQgb3IgbmV3IEBjb25zdHJ1Y3Rvci5DTElFTlQgb3B0c1xuXG4gICAgYmx1ZXByaW50cyA/PSBAY29uc3RydWN0b3IuQkxVRVBSSU5UU1xuICAgIEBhZGRCbHVlcHJpbnRzIGssIHYgZm9yIGssIHYgb2YgYmx1ZXByaW50c1xuXG4gIGFkZEJsdWVwcmludHM6IChhcGksIGJsdWVwcmludHMpIC0+XG4gICAgQFthcGldID89IHt9XG4gICAgZm9yIG5hbWUsIGJwIG9mIGJsdWVwcmludHNcbiAgICAgIEBhZGRCbHVlcHJpbnQgYXBpLCBuYW1lLCBicFxuICAgIHJldHVyblxuXG4gIGFkZEJsdWVwcmludDogKGFwaSwgbmFtZSwgYnApIC0+XG4gICAgIyBOb3JtYWwgbWV0aG9kXG4gICAgaWYgaXNGdW5jdGlvbiBicFxuICAgICAgcmV0dXJuIEBbYXBpXVtuYW1lXSA9ID0+IGJwLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICAgIyBCbHVlcHJpbnQgbWV0aG9kXG4gICAgYnAuZXhwZWN0cyA/PSBzdGF0dXNPa1xuICAgIGJwLm1ldGhvZCAgPz0gR0VUXG5cbiAgICBtZXRob2QgPSAoZGF0YSwgY2IpID0+XG4gICAgICBrZXkgPSB1bmRlZmluZWRcbiAgICAgIGlmIGJwLnVzZUN1c3RvbWVyVG9rZW5cbiAgICAgICAga2V5ID0gQGNsaWVudC5nZXRDdXN0b21lclRva2VuKClcbiAgICAgIEBjbGllbnQucmVxdWVzdCBicCwgZGF0YSwga2V5XG4gICAgICAgIC50aGVuIChyZXMpID0+XG4gICAgICAgICAgaWYgcmVzLmRhdGE/LmVycm9yP1xuICAgICAgICAgICAgdGhyb3cgbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgICAgdW5sZXNzIGJwLmV4cGVjdHMgcmVzXG4gICAgICAgICAgICB0aHJvdyBuZXdFcnJvciBkYXRhLCByZXNcbiAgICAgICAgICBpZiBicC5wcm9jZXNzP1xuICAgICAgICAgICAgYnAucHJvY2Vzcy5jYWxsIEAsIHJlc1xuICAgICAgICAgIHJlcy5kYXRhID8gcmVzLmJvZHlcbiAgICAgICAgLmNhbGxiYWNrIGNiXG5cbiAgICBAW2FwaV1bbmFtZV0gPSBtZXRob2RcblxuICBzZXRLZXk6IChrZXkpIC0+XG4gICAgQGNsaWVudC5zZXRLZXkga2V5XG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBAY2xpZW50LnNldEN1c3RvbWVyVG9rZW4ga2V5XG5cbiAgZGVsZXRlQ3VzdG9tZXJUb2tlbjogLT5cbiAgICBAY2xpZW50LmRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gIHNldFN0b3JlOiAoaWQpIC0+XG4gICAgQHN0b3JlSWQgPSBpZFxuICAgIEBjbGllbnQuc2V0U3RvcmUgaWRcblxuZXhwb3J0IGRlZmF1bHQgQXBpXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9taXNlSW5zcGVjdGlvblxuICBjb25zdHJ1Y3RvcjogKHtAc3RhdGUsIEB2YWx1ZSwgQHJlYXNvbn0pIC0+XG5cbiAgaXNGdWxmaWxsZWQ6IC0+XG4gICAgQHN0YXRlIGlzICdmdWxmaWxsZWQnXG5cbiAgaXNSZWplY3RlZDogLT5cbiAgICBAc3RhdGUgaXMgJ3JlamVjdGVkJ1xuIiwiIyBMZXQgdGhlIG9iZmlzY2F0b3IgY29tcHJlc3MgdGhlc2UgZG93biBieSBhc3NpZ25pbmcgdGhlbSB0byB2YXJpYWJsZXNcbmV4cG9ydCBfdW5kZWZpbmVkICAgICAgID0gdW5kZWZpbmVkXG5leHBvcnQgX3VuZGVmaW5lZFN0cmluZyA9ICd1bmRlZmluZWQnXG4iLCJpbXBvcnQge191bmRlZmluZWQsIF91bmRlZmluZWRTdHJpbmd9IGZyb20gJy4vdXRpbHMnXG5cbiMgU2VlIGh0dHA6Ly93d3cuYmx1ZWphdmEuY29tLzROUy9TcGVlZC11cC15b3VyLVdlYnNpdGVzLXdpdGgtYS1GYXN0ZXItc2V0VGltZW91dC11c2luZy1zb29uXG4jIFRoaXMgaXMgYSB2ZXJ5IGZhc3QgXCJhc3luY2hyb25vdXNcIiBmbG93IGNvbnRyb2wgLSBpLmUuIGl0IHlpZWxkcyB0aGUgdGhyZWFkXG4jIGFuZCBleGVjdXRlcyBsYXRlciwgYnV0IG5vdCBtdWNoIGxhdGVyLiBJdCBpcyBmYXIgZmFzdGVyIGFuZCBsaWdodGVyIHRoYW5cbiMgdXNpbmcgc2V0VGltZW91dChmbiwwKSBmb3IgeWllbGRpbmcgdGhyZWFkcy4gIEl0cyBhbHNvIGZhc3RlciB0aGFuIG90aGVyXG4jIHNldEltbWVkaWF0ZSBzaGltcywgYXMgaXQgdXNlcyBNdXRhdGlvbiBPYnNlcnZlciBhbmQgXCJtYWlubGluZXNcIiBzdWNjZXNzaXZlXG4jIGNhbGxzIGludGVybmFsbHkuXG4jXG4jIFdBUk5JTkc6IFRoaXMgZG9lcyBub3QgeWllbGQgdG8gdGhlIGJyb3dzZXIgVUkgbG9vcCwgc28gYnkgdXNpbmcgdGhpc1xuIyAgICAgICAgICByZXBlYXRlZGx5IHlvdSBjYW4gc3RhcnZlIHRoZSBVSSBhbmQgYmUgdW5yZXNwb25zaXZlIHRvIHRoZSB1c2VyLlxuI1xuIyBUaGlzIGlzIGFuIGV2ZW4gRkFTVEVSIHZlcnNpb24gb2YgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYmx1ZWphdmEvOWI5NTQyZDFkYTJhMTY0ZDA0NTZcbiMgdGhhdCBnaXZlcyB1cCBwYXNzaW5nIGNvbnRleHQgYW5kIGFyZ3VtZW50cywgaW4gZXhjaGFuZ2UgZm9yIGEgMjV4IHNwZWVkXG4jIGluY3JlYXNlLiAoVXNlIGFub24gZnVuY3Rpb24gdG8gcGFzcyBjb250ZXh0L2FyZ3MpXG5zb29uID0gZG8gLT5cbiAgIyBGdW5jdGlvbiBxdWV1ZVxuICBmcSAgICAgICAgID0gW11cblxuICAjIEF2b2lkIHVzaW5nIHNoaWZ0KCkgYnkgbWFpbnRhaW5pbmcgYSBzdGFydCBwb2ludGVyIC0gYW5kIHJlbW92ZSBpdGVtcyBpblxuICAjIGNodW5rcyBvZiAxMDI0IChidWZmZXJTaXplKVxuICBmcVN0YXJ0ICAgID0gMFxuICBidWZmZXJTaXplID0gMTAyNFxuXG4gIGNhbGxRdWV1ZSA9IC0+XG4gICAgIyBUaGlzIGFwcHJvYWNoIGFsbG93cyBuZXcgeWllbGRzIHRvIHBpbGUgb24gZHVyaW5nIHRoZSBleGVjdXRpb24gb2YgdGhlc2VcbiAgICB3aGlsZSBmcS5sZW5ndGggLSBmcVN0YXJ0XG4gICAgICB0cnlcbiAgICAgICAgIyBObyBjb250ZXh0IG9yIGFyZ3MuLi5cbiAgICAgICAgZnFbZnFTdGFydF0oKVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIHVubGVzcyB0eXBlb2YgY29uc29sZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyXG5cbiAgICAgICMgSW5jcmVhc2Ugc3RhcnQgcG9pbnRlciBhbmQgZGVyZWZlcmVuY2UgZnVuY3Rpb24ganVzdCBjYWxsZWRcbiAgICAgIGZxW2ZxU3RhcnQrK10gPSBfdW5kZWZpbmVkXG5cbiAgICAgIGlmIGZxU3RhcnQgPT0gYnVmZmVyU2l6ZVxuICAgICAgICBmcS5zcGxpY2UgMCwgYnVmZmVyU2l6ZVxuICAgICAgICBmcVN0YXJ0ID0gMFxuXG4gICAgcmV0dXJuXG5cbiAgIyBSdW4gdGhlIGNhbGxRdWV1ZSBmdW5jdGlvbiBhc3luY2hyb25vdXNseSwgYXMgZmFzdCBhcyBwb3NzaWJsZVxuICBjcVlpZWxkID0gZG8gLT5cbiAgICAjIFRoaXMgaXMgdGhlIGZhc3Rlc3Qgd2F5IGJyb3dzZXJzIGhhdmUgdG8geWllbGQgcHJvY2Vzc2luZ1xuICAgIGlmIHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9IF91bmRlZmluZWRTdHJpbmdcbiAgICAgICMgRmlyc3QsIGNyZWF0ZSBhIGRpdiBub3QgYXR0YWNoZWQgdG8gRE9NIHRvICdvYnNlcnZlJ1xuICAgICAgZGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgICBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyIGNhbGxRdWV1ZVxuICAgICAgbW8ub2JzZXJ2ZSBkZCwgYXR0cmlidXRlczogdHJ1ZVxuXG4gICAgICByZXR1cm4gLT5cbiAgICAgICAgZGQuc2V0QXR0cmlidXRlICdhJywgMFxuICAgICAgICByZXR1cm5cblxuICAgICMgSWYgTm8gTXV0YXRpb25PYnNlcnZlciAtIHRoaXMgaXMgdGhlIG5leHQgYmVzdCB0aGluZyAtIGhhbmRsZXMgTm9kZSBhbmQgTVNJRVxuICAgIGlmIHR5cGVvZiBzZXRJbW1lZGlhdGUgIT0gX3VuZGVmaW5lZFN0cmluZ1xuICAgICAgcmV0dXJuIC0+XG4gICAgICAgIHNldEltbWVkaWF0ZSBjYWxsUXVldWVcbiAgICAgICAgcmV0dXJuXG5cbiAgICAjIEZpbmFsIGZhbGxiYWNrIC0gc2hvdWxkbid0IGJlIHVzZWQgZm9yIG11Y2ggZXhjZXB0IHZlcnkgb2xkIGJyb3dzZXJzXG4gICAgLT5cbiAgICAgIHNldFRpbWVvdXQgY2FsbFF1ZXVlLCAwXG4gICAgICByZXR1cm5cblxuXG4gICMgVGhpcyBpcyB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGFzc2lnbmVkIHRvIHNvb24gaXQgdGFrZXMgdGhlIGZ1bmN0aW9uIHRvXG4gICMgY2FsbCBhbmQgZXhhbWluZXMgYWxsIGFyZ3VtZW50cy5cbiAgKGZuKSAtPlxuICAgICMgUHVzaCB0aGUgZnVuY3Rpb24gYW5kIGFueSByZW1haW5pbmcgYXJndW1lbnRzIGFsb25nIHdpdGggY29udGV4dFxuICAgIGZxLnB1c2ggZm5cblxuICAgICMgVXBvbiBhZGRpbmcgb3VyIGZpcnN0IGVudHJ5LCBraWNrIG9mZiB0aGUgY2FsbGJhY2tcbiAgICBpZiBmcS5sZW5ndGggLSBmcVN0YXJ0ID09IDFcbiAgICAgIGNxWWllbGQoKVxuICAgIHJldHVyblxuXG5leHBvcnQgZGVmYXVsdCBzb29uXG4iLCIjIExhcmdlbHkgY29waWVkIGZyb20gWm91c2FuOiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWphdmEvem91c2FuXG5pbXBvcnQgUHJvbWlzZUluc3BlY3Rpb24gZnJvbSAnLi9wcm9taXNlLWluc3BlY3Rpb24nXG5pbXBvcnQgc29vbiBmcm9tICcuL3Nvb24nXG5cbiMgTGV0IHRoZSBvYmZpc2NhdG9yIGNvbXByZXNzIHRoZXNlIGRvd24gYnkgYXNzaWduaW5nIHRoZW0gdG8gdmFyaWFibGVzXG5fdW5kZWZpbmVkICAgICAgID0gdW5kZWZpbmVkXG5fdW5kZWZpbmVkU3RyaW5nID0gJ3VuZGVmaW5lZCdcblxuIyBUaGVzZSBhcmUgdGhlIHRocmVlIHBvc3NpYmxlIHN0YXRlcyAoUEVORElORyByZW1haW5zIHVuZGVmaW5lZCAtIGFzIGludGVuZGVkKVxuIyBhIHByb21pc2UgY2FuIGJlIGluLiAgVGhlIHN0YXRlIGlzIHN0b3JlZCBpbiB0aGlzLnN0YXRlIGFzIHJlYWQtb25seVxuU1RBVEVfUEVORElORyAgID0gX3VuZGVmaW5lZFxuU1RBVEVfRlVMRklMTEVEID0gJ2Z1bGZpbGxlZCdcblNUQVRFX1JFSkVDVEVEICA9ICdyZWplY3RlZCdcblxucmVzb2x2ZUNsaWVudCA9IChjLCBhcmcpIC0+XG4gIGlmIHR5cGVvZiBjLnkgPT0gJ2Z1bmN0aW9uJ1xuICAgIHRyeVxuICAgICAgeXJldCA9IGMueS5jYWxsKF91bmRlZmluZWQsIGFyZylcbiAgICAgIGMucC5yZXNvbHZlIHlyZXRcbiAgICBjYXRjaCBlcnJcbiAgICAgIGMucC5yZWplY3QgZXJyXG4gIGVsc2VcbiAgICAjIHBhc3MgdGhpcyBhbG9uZy4uLlxuICAgIGMucC5yZXNvbHZlIGFyZ1xuICByZXR1cm5cblxucmVqZWN0Q2xpZW50ID0gKGMsIHJlYXNvbikgLT5cbiAgaWYgdHlwZW9mIGMubiA9PSAnZnVuY3Rpb24nXG4gICAgdHJ5XG4gICAgICB5cmV0ID0gYy5uLmNhbGwoX3VuZGVmaW5lZCwgcmVhc29uKVxuICAgICAgYy5wLnJlc29sdmUgeXJldFxuICAgIGNhdGNoIGVyclxuICAgICAgYy5wLnJlamVjdCBlcnJcbiAgZWxzZVxuICAgICMgcGFzcyB0aGlzIGFsb25nLi4uXG4gICAgYy5wLnJlamVjdCByZWFzb25cbiAgcmV0dXJuXG5cblxuY2xhc3MgUHJvbWlzZVxuICBjb25zdHJ1Y3RvcjogKGZuKSAtPlxuICAgIGlmIGZuXG4gICAgICBmbiAoYXJnKSA9PlxuICAgICAgICBAcmVzb2x2ZSBhcmdcbiAgICAgICwgKGFyZykgPT5cbiAgICAgICAgQHJlamVjdCBhcmdcblxuICByZXNvbHZlOiAodmFsdWUpIC0+XG4gICAgaWYgQHN0YXRlICE9IFNUQVRFX1BFTkRJTkdcbiAgICAgIHJldHVyblxuXG4gICAgaWYgdmFsdWUgPT0gQFxuICAgICAgcmV0dXJuIEByZWplY3QgbmV3IFR5cGVFcnJvciAnQXR0ZW1wdCB0byByZXNvbHZlIHByb21pc2Ugd2l0aCBzZWxmJ1xuXG4gICAgaWYgdmFsdWUgYW5kICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyBvciB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpXG4gICAgICB0cnlcbiAgICAgICAgIyBGaXJzdCB0aW1lIHRocm91Z2g/XG4gICAgICAgIGZpcnN0ID0gdHJ1ZVxuICAgICAgICBuZXh0ID0gdmFsdWUudGhlblxuXG4gICAgICAgIGlmIHR5cGVvZiBuZXh0ID09ICdmdW5jdGlvbidcbiAgICAgICAgICAjIEFuZCBjYWxsIHRoZSB2YWx1ZS50aGVuICh3aGljaCBpcyBub3cgaW4gXCJ0aGVuXCIpIHdpdGggdmFsdWUgYXMgdGhlXG4gICAgICAgICAgIyBjb250ZXh0IGFuZCB0aGUgcmVzb2x2ZS9yZWplY3QgZnVuY3Rpb25zIHBlciB0aGVuYWJsZSBzcGVjXG4gICAgICAgICAgbmV4dC5jYWxsIHZhbHVlLCAocmEpID0+XG4gICAgICAgICAgICBpZiBmaXJzdFxuICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlIGlmIGZpcnN0XG4gICAgICAgICAgICAgIEByZXNvbHZlIHJhXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAsIChycikgPT5cbiAgICAgICAgICAgIGlmIGZpcnN0XG4gICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgICAgICAgQHJlamVjdCByclxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgcmV0dXJuXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgQHJlamVjdCBlcnIgaWYgZmlyc3RcbiAgICAgICAgcmV0dXJuXG5cbiAgICBAc3RhdGUgPSBTVEFURV9GVUxGSUxMRURcbiAgICBAdiAgICAgPSB2YWx1ZVxuXG4gICAgaWYgY2xpZW50cyA9IEBjXG4gICAgICBzb29uID0+XG4gICAgICAgIHJlc29sdmVDbGllbnQgYywgdmFsdWUgZm9yIGMgaW4gY2xpZW50c1xuICAgICAgICByZXR1cm5cbiAgICByZXR1cm5cblxuICByZWplY3Q6IChyZWFzb24pIC0+XG4gICAgcmV0dXJuIGlmIEBzdGF0ZSAhPSBTVEFURV9QRU5ESU5HXG5cbiAgICBAc3RhdGUgPSBTVEFURV9SRUpFQ1RFRFxuICAgIEB2ICAgICA9IHJlYXNvblxuXG4gICAgaWYgY2xpZW50cyA9IEBjXG4gICAgICBzb29uIC0+XG4gICAgICAgIHJlamVjdENsaWVudCBjLCByZWFzb24gZm9yIGMgaW4gY2xpZW50c1xuICAgICAgICByZXR1cm5cbiAgICBlbHNlIGlmICFQcm9taXNlLnN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciBhbmQgdHlwZW9mIGNvbnNvbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIGNvbnNvbGUubG9nICdCcm9rZW4gUHJvbWlzZSwgcGxlYXNlIGNhdGNoIHJlamVjdGlvbnM6ICcsIHJlYXNvbiwgaWYgcmVhc29uIHRoZW4gcmVhc29uLnN0YWNrIGVsc2UgbnVsbFxuXG4gICAgcmV0dXJuXG5cbiAgdGhlbjogKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSAtPlxuICAgIHAgPSBuZXcgUHJvbWlzZVxuXG4gICAgY2xpZW50ID1cbiAgICAgIHk6IG9uRnVsZmlsbGVkXG4gICAgICBuOiBvblJlamVjdGVkXG4gICAgICBwOiBwXG5cbiAgICBpZiBAc3RhdGUgPT0gU1RBVEVfUEVORElOR1xuICAgICAgIyBXZSBhcmUgcGVuZGluZywgc28gY2xpZW50IG11c3Qgd2FpdCAtIHNvIHB1c2ggY2xpZW50IHRvIGVuZCBvZiB0aGlzLmNcbiAgICAgICMgYXJyYXkgKGNyZWF0ZSBpZiBuZWNlc3NhcnkgZm9yIGVmZmljaWVuY3kpXG4gICAgICBpZiBAY1xuICAgICAgICBAYy5wdXNoIGNsaWVudFxuICAgICAgZWxzZVxuICAgICAgICBAYyA9IFsgY2xpZW50IF1cbiAgICBlbHNlXG4gICAgICBzID0gQHN0YXRlXG4gICAgICBhID0gQHZcbiAgICAgIHNvb24gLT5cbiAgICAgICAgIyBXZSBhcmUgbm90IHBlbmRpbmcsIHNvIHlpZWxkIHNjcmlwdCBhbmQgcmVzb2x2ZS9yZWplY3QgYXMgbmVlZGVkXG4gICAgICAgIGlmIHMgPT0gU1RBVEVfRlVMRklMTEVEXG4gICAgICAgICAgcmVzb2x2ZUNsaWVudCBjbGllbnQsIGFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlamVjdENsaWVudCBjbGllbnQsIGFcbiAgICAgICAgcmV0dXJuXG4gICAgcFxuXG4gIGNhdGNoOiAoY2ZuKSAtPlxuICAgIEB0aGVuIG51bGwsIGNmblxuXG4gIGZpbmFsbHk6IChjZm4pIC0+XG4gICAgQHRoZW4gY2ZuLCBjZm5cblxuICB0aW1lb3V0OiAobXMsIG1zZykgLT5cbiAgICBtc2cgPSBtc2cgb3IgJ3RpbWVvdXQnXG5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAjIFRoaXMgd2lsbCBmYWlsIHNpbGVudGx5IGlmIHByb21pc2UgYWxyZWFkeSByZXNvbHZlZCBvciByZWplY3RlZFxuICAgICAgICByZWplY3QgRXJyb3IobXNnKVxuICAgICAgLCBtc1xuXG4gICAgICAjIFRoaXMgd2lsbCBmYWlsIHNpbGVudGx5IGlmIHByb21pc2UgYWxyZWFkeSB0aW1lZCBvdXRcbiAgICAgIEB0aGVuICh2YWwpIC0+XG4gICAgICAgIHJlc29sdmUgdmFsXG4gICAgICAgIHJldHVyblxuICAgICAgLCAoZXJyKSAtPlxuICAgICAgICByZWplY3QgZXJyXG4gICAgICAgIHJldHVyblxuICAgICAgcmV0dXJuXG5cbiAgY2FsbGJhY2s6IChjYikgLT5cbiAgICBpZiB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgQHRoZW4gICh2YWwpIC0+IGNiIG51bGwsIHZhbFxuICAgICAgQGNhdGNoIChlcnIpIC0+IGNiIGVyciwgbnVsbFxuICAgIEBcblxuZXhwb3J0IGRlZmF1bHQgUHJvbWlzZVxuIiwiaW1wb3J0IFByb21pc2UgZnJvbSAnLi9wcm9taXNlJ1xuaW1wb3J0IFByb21pc2VJbnNwZWN0aW9uIGZyb20gJy4vcHJvbWlzZS1pbnNwZWN0aW9uJ1xuXG5leHBvcnQgcmVzb2x2ZSA9ICh2YWwpIC0+XG4gIHogPSBuZXcgUHJvbWlzZVxuICB6LnJlc29sdmUgdmFsXG4gIHpcblxuZXhwb3J0IHJlamVjdCA9IChlcnIpIC0+XG4gIHogPSBuZXcgUHJvbWlzZVxuICB6LnJlamVjdCBlcnJcbiAgelxuXG5leHBvcnQgYWxsID0gKHBzKSAtPlxuICAjIFNlc3VsdHMgYW5kIHJlc29sdmVkIGNvdW50XG4gIHJlc3VsdHMgPSBbXVxuICByYyAgICAgID0gMFxuICByZXRQICAgID0gbmV3IFByb21pc2UoKVxuXG4gIHJlc29sdmVQcm9taXNlID0gKHAsIGkpIC0+XG4gICAgaWYgIXAgb3IgdHlwZW9mIHAudGhlbiAhPSAnZnVuY3Rpb24nXG4gICAgICBwID0gcmVzb2x2ZShwKVxuXG4gICAgcC50aGVuICh5dikgLT5cbiAgICAgIHJlc3VsdHNbaV0gPSB5dlxuICAgICAgcmMrK1xuICAgICAgaWYgcmMgPT0gcHMubGVuZ3RoXG4gICAgICAgIHJldFAucmVzb2x2ZSByZXN1bHRzXG4gICAgICByZXR1cm5cblxuICAgICwgKG52KSAtPlxuICAgICAgcmV0UC5yZWplY3QgbnZcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuXG5cbiAgcmVzb2x2ZVByb21pc2UgcCwgaSBmb3IgcCwgaSBpbiBwc1xuXG4gICMgRm9yIHplcm8gbGVuZ3RoIGFycmF5cywgcmVzb2x2ZSBpbW1lZGlhdGVseVxuICBpZiAhcHMubGVuZ3RoXG4gICAgcmV0UC5yZXNvbHZlIHJlc3VsdHNcblxuICByZXRQXG5cbmV4cG9ydCByZWZsZWN0ID0gKHByb21pc2UpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgcHJvbWlzZVxuICAgICAgLnRoZW4gKHZhbHVlKSAtPlxuICAgICAgICByZXNvbHZlIG5ldyBQcm9taXNlSW5zcGVjdGlvblxuICAgICAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJ1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICAgIHJlc29sdmUgbmV3IFByb21pc2VJbnNwZWN0aW9uXG4gICAgICAgICAgc3RhdGU6ICdyZWplY3RlZCdcbiAgICAgICAgICByZWFzb246IGVyclxuXG5leHBvcnQgc2V0dGxlID0gKHByb21pc2VzKSAtPlxuICBhbGwgcHJvbWlzZXMubWFwIHJlZmxlY3RcbiIsImltcG9ydCBQcm9taXNlSW5zcGVjdGlvbiBmcm9tICcuL3Byb21pc2UtaW5zcGVjdGlvbidcbmltcG9ydCBQcm9taXNlIGZyb20gJy4vcHJvbWlzZSdcbmltcG9ydCBzb29uIGZyb20gJy4vc29vbidcbmltcG9ydCB7YWxsLCByZWZsZWN0LCByZWplY3QsIHJlc29sdmUsIHNldHRsZX0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5Qcm9taXNlLmFsbCA9IGFsbFxuUHJvbWlzZS5yZWZsZWN0ID0gcmVmbGVjdFxuUHJvbWlzZS5yZWplY3QgPSByZWplY3RcblByb21pc2UucmVzb2x2ZSA9IHJlc29sdmVcblByb21pc2Uuc2V0dGxlID0gc2V0dGxlXG5Qcm9taXNlLnNvb24gPSBzb29uXG5cbmV4cG9ydCBkZWZhdWx0IFByb21pc2VcbiIsInZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHk7XG52YXIgb2JqZWN0QXNzaWduO1xudmFyIHByb3BJc0VudW1lcmFibGU7XG52YXIgc2hvdWxkVXNlTmF0aXZlO1xudmFyIHRvT2JqZWN0O1xudmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbmdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbmhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxucHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbnRvT2JqZWN0ID0gZnVuY3Rpb24odmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuICB9XG4gIHJldHVybiBPYmplY3QodmFsKTtcbn07XG5cbnNob3VsZFVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXJyLCBpLCBqLCBrLCBsZW4sIGxldHRlciwgb3JkZXIyLCByZWYsIHRlc3QxLCB0ZXN0MiwgdGVzdDM7XG4gIHRyeSB7XG4gICAgaWYgKCFPYmplY3QuYXNzaWduKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7XG4gICAgdGVzdDFbNV0gPSAnZGUnO1xuICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF0gPT09ICc1Jykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZXN0MiA9IHt9O1xuICAgIGZvciAoaSA9IGogPSAwOyBqIDw9IDk7IGkgPSArK2opIHtcbiAgICAgIHRlc3QyWydfJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoaSldID0gaTtcbiAgICB9XG4gICAgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gdGVzdDJbbl07XG4gICAgfSk7XG4gICAgaWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlc3QzID0ge307XG4gICAgcmVmID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJyk7XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBsZXR0ZXIgPSByZWZba107XG4gICAgICB0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlcnIgPSBlcnJvcjtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbnZhciBpbmRleCA9IG9iamVjdEFzc2lnbiA9IChmdW5jdGlvbigpIHtcbiAgaWYgKHNob3VsZFVzZU5hdGl2ZSgpKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ247XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBmcm9tLCBqLCBrLCBrZXksIGxlbiwgbGVuMSwgcmVmLCBzb3VyY2UsIHNvdXJjZXMsIHN5bWJvbCwgdGFyZ2V0LCB0bztcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbMF0sIHNvdXJjZXMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG4gICAgZm9yIChqID0gMCwgbGVuID0gc291cmNlcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgc291cmNlID0gc291cmNlc1tqXTtcbiAgICAgIGZyb20gPSBPYmplY3Qoc291cmNlKTtcbiAgICAgIGZvciAoa2V5IGluIGZyb20pIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICAgICAgICAgIHRvW2tleV0gPSBmcm9tW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICAgICAgcmVmID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuICAgICAgICBmb3IgKGsgPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgICAgIHN5bWJvbCA9IHJlZltrXTtcbiAgICAgICAgICBpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbCkpIHtcbiAgICAgICAgICAgIHRvW3N5bWJvbF0gPSBmcm9tW3N5bWJvbF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bztcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGluZGV4O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIiwidHJpbSA9IChzKSAtPlxuICBzLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcblxuaXNBcnJheSA9IChvYmopIC0+XG4gIE9iamVjdDo6dG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSdcblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VIZWFkZXJzID0gKGhlYWRlcnMpIC0+XG4gIHJldHVybiB7fSB1bmxlc3MgaGVhZGVyc1xuXG4gIHJlc3VsdCA9IHt9XG5cbiAgZm9yIHJvdyBpbiB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgIGluZGV4ID0gcm93LmluZGV4T2YoJzonKVxuICAgIGtleSA9IHRyaW0ocm93LnNsaWNlKDAsIGluZGV4KSkudG9Mb3dlckNhc2UoKVxuICAgIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcbiAgICBpZiB0eXBlb2YgcmVzdWx0W2tleV0gPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVcbiAgICBlbHNlIGlmIGlzQXJyYXkocmVzdWx0W2tleV0pXG4gICAgICByZXN1bHRba2V5XS5wdXNoIHZhbHVlXG4gICAgZWxzZVxuICAgICAgcmVzdWx0W2tleV0gPSBbXG4gICAgICAgIHJlc3VsdFtrZXldXG4gICAgICAgIHZhbHVlXG4gICAgICBdXG4gICAgcmV0dXJuXG4gIHJlc3VsdFxuIiwiIyMjXG4jIENvcHlyaWdodCAyMDE1IFNjb3R0IEJyYWR5XG4jIE1JVCBMaWNlbnNlXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGJyYWR5L3hoci1wcm9taXNlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiMjI1xuXG5pbXBvcnQgUHJvbWlzZSAgICAgIGZyb20gJ2Jyb2tlbidcbmltcG9ydCBvYmplY3RBc3NpZ24gZnJvbSAnZXMtb2JqZWN0LWFzc2lnbidcbmltcG9ydCBwYXJzZUhlYWRlcnMgZnJvbSAnLi9wYXJzZS1oZWFkZXJzJ1xuXG5kZWZhdWx0cyA9XG4gIG1ldGhvZDogICAnR0VUJ1xuICBoZWFkZXJzOiAge31cbiAgZGF0YTogICAgIG51bGxcbiAgdXNlcm5hbWU6IG51bGxcbiAgcGFzc3dvcmQ6IG51bGxcbiAgYXN5bmM6ICAgIHRydWVcblxuIyMjXG4jIE1vZHVsZSB0byB3cmFwIGFuIFhoclByb21pc2UgaW4gYSBwcm9taXNlLlxuIyMjXG5jbGFzcyBYaHJQcm9taXNlXG5cbiAgQERFRkFVTFRfQ09OVEVOVF9UWVBFOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04J1xuXG4gIEBQcm9taXNlOiBQcm9taXNlXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMgUHVibGljIG1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLnNlbmQob3B0aW9ucykgLT4gUHJvbWlzZVxuICAjIC0gb3B0aW9ucyAoT2JqZWN0KTogVVJMLCBtZXRob2QsIGRhdGEsIGV0Yy5cbiAgI1xuICAjIENyZWF0ZSB0aGUgWEhSIG9iamVjdCBhbmQgd2lyZSB1cCBldmVudCBoYW5kbGVycyB0byB1c2UgYSBwcm9taXNlLlxuICAjIyNcbiAgc2VuZDogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBvcHRpb25zID0gb2JqZWN0QXNzaWduIHt9LCBkZWZhdWx0cywgb3B0aW9uc1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHVubGVzcyBYTUxIdHRwUmVxdWVzdFxuICAgICAgICBAX2hhbmRsZUVycm9yICdicm93c2VyJywgcmVqZWN0LCBudWxsLCBcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0XCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIHR5cGVvZiBvcHRpb25zLnVybCBpc250ICdzdHJpbmcnIHx8IG9wdGlvbnMudXJsLmxlbmd0aCBpcyAwXG4gICAgICAgIEBfaGFuZGxlRXJyb3IgJ3VybCcsIHJlamVjdCwgbnVsbCwgJ1VSTCBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlcidcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgICMgWE1MSHR0cFJlcXVlc3QgaXMgc3VwcG9ydGVkIGJ5IElFIDcrXG4gICAgICBAX3hociA9IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgICMgc3VjY2VzcyBoYW5kbGVyXG4gICAgICB4aHIub25sb2FkID0gPT5cbiAgICAgICAgQF9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlc3BvbnNlVGV4dCA9IEBfZ2V0UmVzcG9uc2VUZXh0KClcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICBAX2hhbmRsZUVycm9yICdwYXJzZScsIHJlamVjdCwgbnVsbCwgJ2ludmFsaWQgSlNPTiByZXNwb25zZSdcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXNvbHZlXG4gICAgICAgICAgdXJsOiAgICAgICAgICBAX2dldFJlc3BvbnNlVXJsKClcbiAgICAgICAgICBoZWFkZXJzOiAgICAgIEBfZ2V0SGVhZGVycygpXG4gICAgICAgICAgcmVzcG9uc2VUZXh0OiByZXNwb25zZVRleHRcbiAgICAgICAgICBzdGF0dXM6ICAgICAgIHhoci5zdGF0dXNcbiAgICAgICAgICBzdGF0dXNUZXh0OiAgIHhoci5zdGF0dXNUZXh0XG4gICAgICAgICAgeGhyOiAgICAgICAgICB4aHJcblxuICAgICAgIyBlcnJvciBoYW5kbGVyc1xuICAgICAgeGhyLm9uZXJyb3IgICA9ID0+IEBfaGFuZGxlRXJyb3IgJ2Vycm9yJywgICByZWplY3RcbiAgICAgIHhoci5vbnRpbWVvdXQgPSA9PiBAX2hhbmRsZUVycm9yICd0aW1lb3V0JywgcmVqZWN0XG4gICAgICB4aHIub25hYm9ydCAgID0gPT4gQF9oYW5kbGVFcnJvciAnYWJvcnQnLCAgIHJlamVjdFxuXG4gICAgICBAX2F0dGFjaFdpbmRvd1VubG9hZCgpXG5cbiAgICAgIHhoci5vcGVuIG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgb3B0aW9ucy5hc3luYywgb3B0aW9ucy51c2VybmFtZSwgb3B0aW9ucy5wYXNzd29yZFxuXG4gICAgICBpZiBvcHRpb25zLmRhdGE/ICYmICFvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBAY29uc3RydWN0b3IuREVGQVVMVF9DT05URU5UX1RZUEVcblxuICAgICAgZm9yIGhlYWRlciwgdmFsdWUgb2Ygb3B0aW9ucy5oZWFkZXJzXG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpXG5cbiAgICAgIHRyeVxuICAgICAgICB4aHIuc2VuZChvcHRpb25zLmRhdGEpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIEBfaGFuZGxlRXJyb3IgJ3NlbmQnLCByZWplY3QsIG51bGwsIGUudG9TdHJpbmcoKVxuXG4gICMjI1xuICAjIFhoclByb21pc2UuZ2V0WEhSKCkgLT4gWGhyUHJvbWlzZVxuICAjIyNcbiAgZ2V0WEhSOiAtPiBAX3hoclxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMjIFBzdWVkby1wcml2YXRlIG1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fYXR0YWNoV2luZG93VW5sb2FkKClcbiAgI1xuICAjIEZpeCBmb3IgSUUgOSBhbmQgSUUgMTBcbiAgIyBJbnRlcm5ldCBFeHBsb3JlciBmcmVlemVzIHdoZW4geW91IGNsb3NlIGEgd2VicGFnZSBkdXJpbmcgYW4gWEhSIHJlcXVlc3RcbiAgIyBodHRwczovL3N1cHBvcnQubWljcm9zb2Z0LmNvbS9rYi8yODU2NzQ2XG4gICNcbiAgIyMjXG4gIF9hdHRhY2hXaW5kb3dVbmxvYWQ6IC0+XG4gICAgQF91bmxvYWRIYW5kbGVyID0gQF9oYW5kbGVXaW5kb3dVbmxvYWQuYmluZChAKVxuICAgIHdpbmRvdy5hdHRhY2hFdmVudCAnb251bmxvYWQnLCBAX3VubG9hZEhhbmRsZXIgaWYgd2luZG93LmF0dGFjaEV2ZW50XG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fZGV0YWNoV2luZG93VW5sb2FkKClcbiAgIyMjXG4gIF9kZXRhY2hXaW5kb3dVbmxvYWQ6IC0+XG4gICAgd2luZG93LmRldGFjaEV2ZW50ICdvbnVubG9hZCcsIEBfdW5sb2FkSGFuZGxlciBpZiB3aW5kb3cuZGV0YWNoRXZlbnRcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRIZWFkZXJzKCkgLT4gT2JqZWN0XG4gICMjI1xuICBfZ2V0SGVhZGVyczogLT5cbiAgICBwYXJzZUhlYWRlcnMgQF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKClcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRSZXNwb25zZVRleHQoKSAtPiBNaXhlZFxuICAjXG4gICMgUGFyc2VzIHJlc3BvbnNlIHRleHQgSlNPTiBpZiBwcmVzZW50LlxuICAjIyNcbiAgX2dldFJlc3BvbnNlVGV4dDogLT5cbiAgICAjIEFjY2Vzc2luZyBiaW5hcnktZGF0YSByZXNwb25zZVRleHQgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpbiBJRTlcbiAgICByZXNwb25zZVRleHQgPSBpZiB0eXBlb2YgQF94aHIucmVzcG9uc2VUZXh0IGlzICdzdHJpbmcnIHRoZW4gQF94aHIucmVzcG9uc2VUZXh0IGVsc2UgJydcblxuICAgIHN3aXRjaCBAX3hoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJylcbiAgICAgIHdoZW4gJ2FwcGxpY2F0aW9uL2pzb24nLCAndGV4dC9qYXZhc2NyaXB0J1xuICAgICAgICAjIFdvcmthcm91bmQgQW5kcm9pZCAyLjMgZmFpbHVyZSB0byBzdHJpbmctY2FzdCBudWxsIGlucHV0XG4gICAgICAgIHJlc3BvbnNlVGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0ICsgJycpXG5cbiAgICByZXNwb25zZVRleHRcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRSZXNwb25zZVVybCgpIC0+IFN0cmluZ1xuICAjXG4gICMgQWN0dWFsIHJlc3BvbnNlIFVSTCBhZnRlciBmb2xsb3dpbmcgcmVkaXJlY3RzLlxuICAjIyNcbiAgX2dldFJlc3BvbnNlVXJsOiAtPlxuICAgIHJldHVybiBAX3hoci5yZXNwb25zZVVSTCBpZiBAX3hoci5yZXNwb25zZVVSTD9cblxuICAgICMgQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgcmV0dXJuIEBfeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJykgaWYgL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoQF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG5cbiAgICAnJ1xuXG4gICMjI1xuICAjIFhoclByb21pc2UuX2hhbmRsZUVycm9yKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpXG4gICMgLSByZWFzb24gKFN0cmluZylcbiAgIyAtIHJlamVjdCAoRnVuY3Rpb24pXG4gICMgLSBzdGF0dXMgKFN0cmluZylcbiAgIyAtIHN0YXR1c1RleHQgKFN0cmluZylcbiAgIyMjXG4gIF9oYW5kbGVFcnJvcjogKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpIC0+XG4gICAgQF9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgcmVqZWN0XG4gICAgICByZWFzb246ICAgICByZWFzb25cbiAgICAgIHN0YXR1czogICAgIHN0YXR1cyAgICAgb3IgQF94aHIuc3RhdHVzXG4gICAgICBzdGF0dXNUZXh0OiBzdGF0dXNUZXh0IG9yIEBfeGhyLnN0YXR1c1RleHRcbiAgICAgIHhocjogICAgICAgIEBfeGhyXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5faGFuZGxlV2luZG93VW5sb2FkKClcbiAgIyMjXG4gIF9oYW5kbGVXaW5kb3dVbmxvYWQ6IC0+XG4gICAgQF94aHIuYWJvcnQoKVxuXG5leHBvcnQgZGVmYXVsdCBYaHJQcm9taXNlXG4iLCIjIFRoZSBkZWZpbml0aXZlIEphdmFTY3JpcHQgdHlwZSB0ZXN0aW5nIGxpYnJhcnlcbiNcbiMgQGNvcHlyaWdodCAyMDEzLTIwMTQgRW5yaWNvIE1hcmlubyAvIEpvcmRhbiBIYXJiYW5kXG4jIEBsaWNlbnNlIE1JVFxuXG5vYmpQcm90byAgICAgID0gT2JqZWN0LnByb3RvdHlwZVxub3ducyAgICAgICAgICA9IG9ialByb3RvLmhhc093blByb3BlcnR5XG50b1N0ciAgICAgICAgID0gb2JqUHJvdG8udG9TdHJpbmdcbnN5bWJvbFZhbHVlT2YgPSB1bmRlZmluZWRcbmlmIHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJ1xuICBzeW1ib2xWYWx1ZU9mID0gU3ltYm9sOjp2YWx1ZU9mXG5cbmlzQWN0dWFsTmFOID0gKHZhbHVlKSAtPlxuICB2YWx1ZSAhPSB2YWx1ZVxuXG5OT05fSE9TVF9UWVBFUyA9XG4gICdib29sZWFuJzogMVxuICBudW1iZXI6ICAgIDFcbiAgc3RyaW5nOiAgICAxXG4gIHVuZGVmaW5lZDogMVxuXG5iYXNlNjRSZWdleCA9IC9eKFtBLVphLXowLTkrL117NH0pKihbQS1aYS16MC05Ky9dezR9fFtBLVphLXowLTkrL117M309fFtBLVphLXowLTkrL117Mn09PSkkL1xuaGV4UmVnZXggICAgPSAvXltBLUZhLWYwLTldKyQvXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgdHlwZSBvZiBgdHlwZWAuXG4jXG4jIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHBhcmFtIHtTdHJpbmd9IHR5cGUgdHlwZVxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYSB0eXBlIG9mIGB0eXBlYCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNUeXBlID0gKHZhbHVlLCB0eXBlKSAtPlxuICB0eXBlb2YgdmFsdWUgPT0gdHlwZVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBkZWZpbmVkLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgJ3ZhbHVlJyBpcyBkZWZpbmVkLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0RlZmluZWQgPSAodmFsdWUpIC0+XG4gIHR5cGVvZiB2YWx1ZSAhPSAndW5kZWZpbmVkJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBlbXB0eS5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgZW1wdHksIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzRW1wdHkgPSAodmFsdWUpIC0+XG4gIHR5cGUgPSB0b1N0ci5jYWxsIHZhbHVlXG4gIGlmIHR5cGUgPT0gJ1tvYmplY3QgQXJyYXldJyBvciB0eXBlID09ICdbb2JqZWN0IEFyZ3VtZW50c10nIG9yIHR5cGUgPT0gJ1tvYmplY3QgU3RyaW5nXSdcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID09IDBcblxuICBpZiB0eXBlID09ICdbb2JqZWN0IE9iamVjdF0nXG4gICAgZm9yIGtleSBvZiB2YWx1ZVxuICAgICAgaWYgb3ducy5jYWxsIHZhbHVlLCBrZXlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICAhdmFsdWVcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgZXF1YWwgdG8gYG90aGVyYC5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcGFyYW0ge01peGVkfSBvdGhlciB2YWx1ZSB0byBjb21wYXJlIHdpdGhcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGVxdWFsIHRvIGBvdGhlcmAsIGZhbHNlIG90aGVyd2lzZVxuZXhwb3J0IGlzRXF1YWwgPSAodmFsdWUsIG90aGVyKSAtPlxuICByZXR1cm4gdHJ1ZSBpZiB2YWx1ZSA9PSBvdGhlclxuXG4gIHR5cGUgPSB0b1N0ci5jYWxsIHZhbHVlXG5cbiAgaWYgdHlwZSAhPSB0b1N0ci5jYWxsKG90aGVyKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlmIHR5cGUgPT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgICBmb3Iga2V5IG9mIHZhbHVlXG4gICAgICBpZiAhaXNFcXVhbCh2YWx1ZVtrZXldLCBvdGhlcltrZXldKSBvciAhKGtleSBvZiBvdGhlcilcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgZm9yIGtleSBvZiBvdGhlclxuICAgICAgaWYgIWlzRXF1YWwodmFsdWVba2V5XSwgb3RoZXJba2V5XSkgb3IgIShrZXkgb2YgdmFsdWUpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgaWYgdHlwZSA9PSAnW29iamVjdCBBcnJheV0nXG4gICAga2V5ID0gdmFsdWUubGVuZ3RoXG4gICAgaWYga2V5ICE9IG90aGVyLmxlbmd0aFxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgd2hpbGUga2V5LS1cbiAgICAgIGlmICFpc0VxdWFsKHZhbHVlW2tleV0sIG90aGVyW2tleV0pXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgaWYgdHlwZSA9PSAnW29iamVjdCBGdW5jdGlvbl0nXG4gICAgcmV0dXJuIHZhbHVlLnByb3RvdHlwZSA9PSBvdGhlci5wcm90b3R5cGVcblxuICBpZiB0eXBlID09ICdbb2JqZWN0IERhdGVdJ1xuICAgIHJldHVybiB2YWx1ZS5nZXRUaW1lKCkgPT0gb3RoZXIuZ2V0VGltZSgpXG5cbiAgZmFsc2VcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgaG9zdGVkIGJ5IGBob3N0YC5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdG8gdGVzdFxuIyBAcGFyYW0ge01peGVkfSBob3N0IGhvc3QgdG8gdGVzdCB3aXRoXG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBob3N0ZWQgYnkgYGhvc3RgLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0hvc3RlZCA9ICh2YWx1ZSwgaG9zdCkgLT5cbiAgdHlwZSA9IHR5cGVvZiBob3N0W3ZhbHVlXVxuICBpZiB0eXBlID09ICdvYmplY3QnIHRoZW4gISAhaG9zdFt2YWx1ZV0gZWxzZSAhTk9OX0hPU1RfVFlQRVNbdHlwZV1cblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgYW4gaW5zdGFuY2Ugb2YgYGNvbnN0cnVjdG9yYC5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYW4gaW5zdGFuY2Ugb2YgYGNvbnN0cnVjdG9yYFxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzSW5zdGFuY2VvZiA9ICh2YWx1ZSwgY29uc3RydWN0b3IpIC0+XG4gIHZhbHVlIGluc3RhbmNlb2YgY29uc3RydWN0b3JcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgbnVsbC5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgbnVsbCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNOaWwgPSAodmFsdWUpIC0+XG4gIHZhbHVlID09IG51bGxcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgdW5kZWZpbmVkLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyB1bmRlZmluZWQsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuXG5leHBvcnQgaXNVbmRlZmluZWQgPSAodmFsdWUpIC0+XG4gIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhbiBhcnJheWxpa2Ugb2JqZWN0LlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhbiBhcmd1bWVudHMgb2JqZWN0LCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0FycmF5TGlrZSA9ICh2YWx1ZSkgLT5cbiAgISF2YWx1ZSBhbmQgIWlzQm9vbCh2YWx1ZSkgYW5kIG93bnMuY2FsbCh2YWx1ZSwgJ2xlbmd0aCcpIGFuZCBpc0Zpbml0ZSh2YWx1ZS5sZW5ndGgpIGFuZCBpc051bWJlcih2YWx1ZS5sZW5ndGgpIGFuZCB2YWx1ZS5sZW5ndGggPj0gMFxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhbiBhcmd1bWVudHMgb2JqZWN0LlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhbiBhcmd1bWVudHMgb2JqZWN0LCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0FyZ3VtZW50cyA9IGlzQXJncyA9ICh2YWx1ZSkgLT5cbiAgaXNTdGFuZGFyZEFyZ3VtZW50cyA9IHRvU3RyLmNhbGwodmFsdWUpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nXG4gIGlzT2xkQXJndW1lbnRzID0gIWlzQXJyYXkodmFsdWUpIGFuZCBpc0FycmF5TGlrZSh2YWx1ZSkgYW5kIGlzT2JqZWN0KHZhbHVlKSBhbmQgaXNGbih2YWx1ZS5jYWxsZWUpXG4gIGlzU3RhbmRhcmRBcmd1bWVudHMgb3IgaXNPbGRBcmd1bWVudHNcblxuIyBUZXN0IGlmICd2YWx1ZScgaXMgYW4gYXJyYXkuXG4jXG4jIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSBvciAodmFsdWUpIC0+XG4gIHRvU3RyLmNhbGwodmFsdWUpID09ICdbb2JqZWN0IEFycmF5XSdcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgYW4gZW1wdHkgYXJndW1lbnRzIG9iamVjdC5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYW4gZW1wdHkgYXJndW1lbnRzIG9iamVjdCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNFbXB0eUFyZ3MgPSAodmFsdWUpIC0+XG4gIGlzQXJncyh2YWx1ZSkgYW5kIHZhbHVlLmxlbmd0aCA9PSAwXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGFuIGVtcHR5IGFycmF5LlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhbiBlbXB0eSBhcnJheSwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNFbXB0eUFycmF5ID0gKHZhbHVlKSAtPlxuICBpc0FycmF5KHZhbHVlKSBhbmQgdmFsdWUubGVuZ3RoID09IDBcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgYSBib29sZWFuLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIGJvb2xlYW4sIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzQm9vbCA9ICh2YWx1ZSkgLT5cbiAgdG9TdHIuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgQm9vbGVhbl0nXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGZhbHNlLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBmYWxzZSwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNGYWxzZSA9ICh2YWx1ZSkgLT5cbiAgaXNCb29sKHZhbHVlKSBhbmQgQm9vbGVhbihOdW1iZXIodmFsdWUpKSA9PSBmYWxzZVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyB0cnVlLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyB0cnVlLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc1RydWUgPSAodmFsdWUpIC0+XG4gIGlzQm9vbCh2YWx1ZSkgYW5kIEJvb2xlYW4oTnVtYmVyKHZhbHVlKSkgPT0gdHJ1ZVxuXG4jIFRlc3QgZGF0ZS5cblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgYSBkYXRlLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIGRhdGUsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzRGF0ZSA9ICh2YWx1ZSkgLT5cbiAgdG9TdHIuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgRGF0ZV0nXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgZGF0ZS5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgZGF0ZSwgZmFsc2Ugb3RoZXJ3aXNlXG5leHBvcnQgaXNWYWxpZERhdGUgPSAodmFsdWUpIC0+XG4gIGlzRGF0ZSh2YWx1ZSkgYW5kICFpc05hTihOdW1iZXIodmFsdWUpKVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhbiBodG1sIGVsZW1lbnQuXG4jXG4jIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGFuIEhUTUwgRWxlbWVudCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNFbGVtZW50ID0gKHZhbHVlKSAtPlxuICB2YWx1ZSAhPSB1bmRlZmluZWQgYW5kIHR5cGVvZiBIVE1MRWxlbWVudCAhPSAndW5kZWZpbmVkJyBhbmQgdmFsdWUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCBhbmQgdmFsdWUubm9kZVR5cGUgPT0gMVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhbiBlcnJvciBvYmplY3QuXG4jXG4jIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGFuIGVycm9yIG9iamVjdCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNFcnJvciA9ICh2YWx1ZSkgLT5cbiAgdG9TdHIuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgRXJyb3JdJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0Z1bmN0aW9uID0gaXNGbiA9ICh2YWx1ZSkgLT5cbiAgaXNBbGVydCA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgYW5kIHZhbHVlID09IHdpbmRvdy5hbGVydFxuICBpZiBpc0FsZXJ0XG4gICAgcmV0dXJuIHRydWVcbiAgc3RyID0gdG9TdHIuY2FsbCh2YWx1ZSlcbiAgc3RyID09ICdbb2JqZWN0IEZ1bmN0aW9uXScgb3Igc3RyID09ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScgb3Igc3RyID09ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhIG51bWJlci5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYSBudW1iZXIsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzTnVtYmVyID0gKHZhbHVlKSAtPlxuICB0b1N0ci5jYWxsKHZhbHVlKSA9PSAnW29iamVjdCBOdW1iZXJdJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBwb3NpdGl2ZSBvciBuZWdhdGl2ZSBpbmZpbml0eS5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgcG9zaXRpdmUgb3IgbmVnYXRpdmUgSW5maW5pdHksIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzSW5maW5pdGUgPSAodmFsdWUpIC0+XG4gIHZhbHVlID09IEluZmluaXR5IG9yIHZhbHVlID09IC1JbmZpbml0eVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhIGRlY2ltYWwgbnVtYmVyLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIGRlY2ltYWwgbnVtYmVyLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0RlY2ltYWwgPSAodmFsdWUpIC0+XG4gIGlzTnVtYmVyKHZhbHVlKSBhbmQgIWlzQWN0dWFsTmFOKHZhbHVlKSBhbmQgIWlzSW5maW5pdGUodmFsdWUpIGFuZCB2YWx1ZSAlIDEgIT0gMFxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBkaXZpc2libGUgYnkgYG5gLlxuI1xuIyBAcGFyYW0ge051bWJlcn0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcGFyYW0ge051bWJlcn0gbiBkaXZpZGVuZFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgZGl2aXNpYmxlIGJ5IGBuYCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNEaXZpc2libGVCeSA9ICh2YWx1ZSwgbikgLT5cbiAgaXNEaXZpZGVuZEluZmluaXRlID0gaXNJbmZpbml0ZSh2YWx1ZSlcbiAgaXNEaXZpc29ySW5maW5pdGUgPSBpc0luZmluaXRlKG4pXG4gIGlzTm9uWmVyb051bWJlciA9IGlzTnVtYmVyKHZhbHVlKSBhbmQgIWlzQWN0dWFsTmFOKHZhbHVlKSBhbmQgaXNOdW1iZXIobikgYW5kICFpc0FjdHVhbE5hTihuKSBhbmQgbiAhPSAwXG4gIGlzRGl2aWRlbmRJbmZpbml0ZSBvciBpc0Rpdmlzb3JJbmZpbml0ZSBvciBpc05vblplcm9OdW1iZXIgYW5kIHZhbHVlICUgbiA9PSAwXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGFuIGludGVnZXIuXG4jXG4jIEBwYXJhbSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhbiBpbnRlZ2VyLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc0ludGVnZXIgPSAodmFsdWUpIC0+XG4gIGlzTnVtYmVyKHZhbHVlKSBhbmQgIWlzQWN0dWFsTmFOKHZhbHVlKSBhbmQgdmFsdWUgJSAxID09IDBcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgZ3JlYXRlciB0aGFuICdvdGhlcnMnIHZhbHVlcy5cbiNcbiMgQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHBhcmFtIHtBcnJheX0gb3RoZXJzIHZhbHVlcyB0byBjb21wYXJlIHdpdGhcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGdyZWF0ZXIgdGhhbiBgb3RoZXJzYCB2YWx1ZXNcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc01heGltdW0gPSAodmFsdWUsIG90aGVycykgLT5cbiAgaWYgaXNBY3R1YWxOYU4odmFsdWUpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTmFOIGlzIG5vdCBhIHZhbGlkIHZhbHVlJylcbiAgZWxzZSBpZiAhaXNBcnJheUxpa2Uob3RoZXJzKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NlY29uZCBhcmd1bWVudCBtdXN0IGJlIGFycmF5LWxpa2UnKVxuICBsZW4gPSBvdGhlcnMubGVuZ3RoXG4gIHdoaWxlIC0tbGVuID49IDBcbiAgICBpZiB2YWx1ZSA8IG90aGVyc1tsZW5dXG4gICAgICByZXR1cm4gZmFsc2VcbiAgdHJ1ZVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBsZXNzIHRoYW4gYG90aGVyc2AgdmFsdWVzLlxuI1xuIyBAcGFyYW0ge051bWJlcn0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcGFyYW0ge0FycmF5fSBvdGhlcnMgdmFsdWVzIHRvIGNvbXBhcmUgd2l0aFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgbGVzcyB0aGFuIGBvdGhlcnNgIHZhbHVlc1xuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzTWluaW11bSA9ICh2YWx1ZSwgb3RoZXJzKSAtPlxuICBpZiBpc0FjdHVhbE5hTih2YWx1ZSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOYU4gaXMgbm90IGEgdmFsaWQgdmFsdWUnKVxuICBlbHNlIGlmICFpc0FycmF5TGlrZShvdGhlcnMpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYXJyYXktbGlrZScpXG4gIGxlbiA9IG90aGVycy5sZW5ndGhcbiAgd2hpbGUgLS1sZW4gPj0gMFxuICAgIGlmIHZhbHVlID4gb3RoZXJzW2xlbl1cbiAgICAgIHJldHVybiBmYWxzZVxuICB0cnVlXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIG5vdCBhIG51bWJlci5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgbm90IGEgbnVtYmVyLCBmYWxzZSBvdGhlcndpc2VcbiMgQGFwaSBwdWJsaWNcbmV4cG9ydCBpc05hbiA9ICh2YWx1ZSkgLT5cbiAgaXNOdW1iZXIodmFsdWUpIG9yIHZhbHVlICE9IHZhbHVlXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGFuIGV2ZW4gbnVtYmVyLlxuI1xuIyBAcGFyYW0ge051bWJlcn0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYW4gZXZlbiBudW1iZXIsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzRXZlbiA9ICh2YWx1ZSkgLT5cbiAgaXNJbmZpbml0ZSh2YWx1ZSkgb3IgaXNOdW1iZXIodmFsdWUpIGFuZCB2YWx1ZSA9PSB2YWx1ZSBhbmQgdmFsdWUgJSAyID09IDBcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgYW4gb2RkIG51bWJlci5cbiNcbiMgQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGFuIG9kZCBudW1iZXIsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzT2RkID0gKHZhbHVlKSAtPlxuICBpc0luZmluaXRlKHZhbHVlKSBvciBpc051bWJlcih2YWx1ZSkgYW5kIHZhbHVlID09IHZhbHVlIGFuZCB2YWx1ZSAlIDIgIT0gMFxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYG90aGVyYC5cbiNcbiMgQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHBhcmFtIHtOdW1iZXJ9IG90aGVyIHZhbHVlIHRvIGNvbXBhcmUgd2l0aFxuIyBAcmV0dXJuIHtCb29sZWFufVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzR2UgPSAodmFsdWUsIG90aGVyKSAtPlxuICBpZiBpc0FjdHVhbE5hTih2YWx1ZSkgb3IgaXNBY3R1YWxOYU4ob3RoZXIpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTmFOIGlzIG5vdCBhIHZhbGlkIHZhbHVlJylcbiAgIWlzSW5maW5pdGUodmFsdWUpIGFuZCAhaXNJbmZpbml0ZShvdGhlcikgYW5kIHZhbHVlID49IG90aGVyXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGdyZWF0ZXIgdGhhbiBgb3RoZXJgLlxuI1xuIyBAcGFyYW0ge051bWJlcn0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcGFyYW0ge051bWJlcn0gb3RoZXIgdmFsdWUgdG8gY29tcGFyZSB3aXRoXG4jIEByZXR1cm4ge0Jvb2xlYW59XG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNHdCA9ICh2YWx1ZSwgb3RoZXIpIC0+XG4gIGlmIGlzQWN0dWFsTmFOKHZhbHVlKSBvciBpc0FjdHVhbE5hTihvdGhlcilcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOYU4gaXMgbm90IGEgdmFsaWQgdmFsdWUnKVxuICAhaXNJbmZpbml0ZSh2YWx1ZSkgYW5kICFpc0luZmluaXRlKG90aGVyKSBhbmQgdmFsdWUgPiBvdGhlclxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYG90aGVyYC5cbiNcbiMgQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHBhcmFtIHtOdW1iZXJ9IG90aGVyIHZhbHVlIHRvIGNvbXBhcmUgd2l0aFxuIyBAcmV0dXJuIHtCb29sZWFufSBpZiAndmFsdWUnIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byAnb3RoZXInXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNMZSA9ICh2YWx1ZSwgb3RoZXIpIC0+XG4gIGlmIGlzQWN0dWFsTmFOKHZhbHVlKSBvciBpc0FjdHVhbE5hTihvdGhlcilcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOYU4gaXMgbm90IGEgdmFsaWQgdmFsdWUnKVxuICAhaXNJbmZpbml0ZSh2YWx1ZSkgYW5kICFpc0luZmluaXRlKG90aGVyKSBhbmQgdmFsdWUgPD0gb3RoZXJcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgbGVzcyB0aGFuIGBvdGhlcmAuXG4jXG4jIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEBwYXJhbSB7TnVtYmVyfSBvdGhlciB2YWx1ZSB0byBjb21wYXJlIHdpdGhcbiMgQHJldHVybiB7Qm9vbGVhbn0gaWYgYHZhbHVlYCBpcyBsZXNzIHRoYW4gYG90aGVyYFxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzTHQgPSAodmFsdWUsIG90aGVyKSAtPlxuICBpZiBpc0FjdHVhbE5hTih2YWx1ZSkgb3IgaXNBY3R1YWxOYU4ob3RoZXIpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTmFOIGlzIG5vdCBhIHZhbGlkIHZhbHVlJylcbiAgIWlzSW5maW5pdGUodmFsdWUpIGFuZCAhaXNJbmZpbml0ZShvdGhlcikgYW5kIHZhbHVlIDwgb3RoZXJcblxuIyBUZXN0IGlmIGB2YWx1ZWAgaXMgd2l0aGluIGBzdGFydGAgYW5kIGBmaW5pc2hgLlxuI1xuIyBAcGFyYW0ge051bWJlcn0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcGFyYW0ge051bWJlcn0gc3RhcnQgbG93ZXIgYm91bmRcbiMgQHBhcmFtIHtOdW1iZXJ9IGZpbmlzaCB1cHBlciBib3VuZFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmICd2YWx1ZScgaXMgaXMgd2l0aGluICdzdGFydCcgYW5kICdmaW5pc2gnXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNXaXRoaW4gPSAodmFsdWUsIHN0YXJ0LCBmaW5pc2gpIC0+XG4gIGlmIGlzQWN0dWFsTmFOKHZhbHVlKSBvciBpc0FjdHVhbE5hTihzdGFydCkgb3IgaXNBY3R1YWxOYU4oZmluaXNoKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ05hTiBpcyBub3QgYSB2YWxpZCB2YWx1ZScpXG4gIGVsc2UgaWYgIWlzTnVtYmVyKHZhbHVlKSBvciAhaXNOdW1iZXIoc3RhcnQpIG9yICFpc051bWJlcihmaW5pc2gpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWxsIGFyZ3VtZW50cyBtdXN0IGJlIG51bWJlcnMnKVxuICBpc0FueUluZmluaXRlID0gaXNJbmZpbml0ZSh2YWx1ZSkgb3IgaXNJbmZpbml0ZShzdGFydCkgb3IgaXNJbmZpbml0ZShmaW5pc2gpXG4gIGlzQW55SW5maW5pdGUgb3IgdmFsdWUgPj0gc3RhcnQgYW5kIHZhbHVlIDw9IGZpbmlzaFxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QuXG4jXG4jIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNPYmplY3QgPSAodmFsdWUpIC0+XG4gIHRvU3RyLmNhbGwodmFsdWUpID09ICdbb2JqZWN0IE9iamVjdF0nXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgcHJpbWl0aXZlLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIHByaW1pdGl2ZSwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNQcmltaXRpdmUgPSAodmFsdWUpIC0+XG4gIGlmICF2YWx1ZVxuICAgIHJldHVybiB0cnVlXG4gIGlmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyBvciBpc09iamVjdCh2YWx1ZSkgb3IgaXNGbih2YWx1ZSkgb3IgaXNBcnJheSh2YWx1ZSlcbiAgICByZXR1cm4gZmFsc2VcbiAgdHJ1ZVxuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhIHByb21pc2UuXG4jXG4jIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIHZhbHVlIHRvIHRlc3RcbiMgQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgdmFsdWVgIGlzIGEgcHJvbWlzZSwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNQcm9taXNlID0gKHZhbHVlKSAtPlxuICAhIXZhbHVlIGFuZCAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnIG9yIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSBhbmQgdHlwZW9mIHZhbHVlLnRoZW4gPT0gJ2Z1bmN0aW9uJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhIGhhc2ggLSBhIHBsYWluIG9iamVjdCBsaXRlcmFsLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIGhhc2gsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGlzSGFzaCA9ICh2YWx1ZSkgLT5cbiAgaXNPYmplY3QodmFsdWUpIGFuZCB2YWx1ZS5jb25zdHJ1Y3RvciA9PSBPYmplY3QgYW5kICF2YWx1ZS5ub2RlVHlwZSBhbmQgIXZhbHVlLnNldEludGVydmFsXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgcmVndWxhciBleHByZXNzaW9uLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIHJlZ2V4cCwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNSZWdleHAgPSAodmFsdWUpIC0+XG4gIHRvU3RyLmNhbGwodmFsdWUpID09ICdbb2JqZWN0IFJlZ0V4cF0nXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgc3RyaW5nLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgJ3ZhbHVlJyBpcyBhIHN0cmluZywgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNTdHJpbmcgPSAodmFsdWUpIC0+XG4gIHRvU3RyLmNhbGwodmFsdWUpID09ICdbb2JqZWN0IFN0cmluZ10nXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYmFzZTY0IGVuY29kZWQgc3RyaW5nLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgJ3ZhbHVlJyBpcyBhIGJhc2U2NCBlbmNvZGVkIHN0cmluZywgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNCYXNlNjQgPSAodmFsdWUpIC0+XG4gIGlzU3RyaW5nKHZhbHVlKSBhbmQgKCF2YWx1ZS5sZW5ndGggb3IgYmFzZTY0UmVnZXgudGVzdCh2YWx1ZSkpXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaGV4IGVuY29kZWQgc3RyaW5nLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgJ3ZhbHVlJyBpcyBhIGhleCBlbmNvZGVkIHN0cmluZywgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNIZXggPSAodmFsdWUpIC0+XG4gIGlzU3RyaW5nKHZhbHVlKSBhbmQgKCF2YWx1ZS5sZW5ndGggb3IgaGV4UmVnZXgudGVzdCh2YWx1ZSkpXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGFuIEVTNiBTeW1ib2xcbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYSBTeW1ib2wsIGZhbHNlIG90aGVyaXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgaXNTeW1ib2wgPSAodmFsdWUpIC0+XG4gIHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJyBhbmQgdG9TdHIuY2FsbCh2YWx1ZSkgPT0gJ1tvYmplY3QgU3ltYm9sXScgYW5kIHR5cGVvZiBzeW1ib2xWYWx1ZU9mLmNhbGwodmFsdWUpID09ICdzeW1ib2wnXG5cbmNsYXNzaWMgPVxuICB0eXBlOiAgICAgICAgIGlzVHlwZVxuICBkZWZpbmVkOiAgICAgIGlzRGVmaW5lZFxuICBlbXB0eTogICAgICAgIGlzRW1wdHlcbiAgZXF1YWw6ICAgICAgICBpc0VxdWFsXG4gIGhvc3RlZDogICAgICAgaXNIb3N0ZWRcbiAgJ2luc3RhbmNlb2YnOiBpc0luc3RhbmNlb2ZcbiAgaW5zdGFuY2U6ICAgICBpc0luc3RhbmNlb2ZcbiAgbmlsOiAgICAgICAgICBpc05pbFxuICB1bmRlZmluZWQ6ICAgIGlzVW5kZWZpbmVkXG4gIHVuZGVmOiAgICAgICAgaXNVbmRlZmluZWRcbiAgJ2FyZ3VtZW50cyc6ICBpc0FyZ3VtZW50c1xuICBhcmdzOiAgICAgICAgIGlzQXJndW1lbnRzXG4gIGFycmF5OiAgICAgICAgaXNBcnJheVxuICBhcnJheWxpa2U6ICAgIGlzQXJyYXlMaWtlXG4gIGJvb2w6ICAgICAgICAgaXNCb29sXG4gIGZhbHNlOiAgICAgICAgaXNGYWxzZVxuICB0cnVlOiAgICAgICAgIGlzVHJ1ZVxuICBkYXRlOiAgICAgICAgIGlzRGF0ZVxuICBlbGVtZW50OiAgICAgIGlzRWxlbWVudFxuICBlcnJvcjogICAgICAgIGlzRXJyb3JcbiAgZnVuY3Rpb246ICAgICBpc0Z1bmN0aW9uXG4gIGZuOiAgICAgICAgICAgaXNGdW5jdGlvblxuICBudW1iZXI6ICAgICAgIGlzTnVtYmVyXG4gIGluZmluaXRlOiAgICAgaXNJbmZpbml0ZVxuICBkZWNpbWFsOiAgICAgIGlzRGVjaW1hbFxuICBkaXZpc2libGVCeTogIGlzRGl2aXNpYmxlQnlcbiAgaW50ZWdlcjogICAgICBpc0ludGVnZXJcbiAgbWF4aW11bTogICAgICBpc01heGltdW1cbiAgbWF4OiAgICAgICAgICBpc01heGltdW1cbiAgbWluaW11bTogICAgICBpc01pbmltdW1cbiAgbWluOiAgICAgICAgICBpc01pbmltdW1cbiAgbmFuOiAgICAgICAgICBpc05hblxuICBldmVuOiAgICAgICAgIGlzRXZlblxuICBvZGQ6ICAgICAgICAgIGlzT2RkXG4gIGdlOiAgICAgICAgICAgaXNHZVxuICBndDogICAgICAgICAgIGlzR3RcbiAgbGU6ICAgICAgICAgICBpc0xlXG4gIGx0OiAgICAgICAgICAgaXNMdFxuICB3aXRoaW46ICAgICAgIGlzV2l0aGluXG4gIG9iamVjdDogICAgICAgaXNPYmplY3RcbiAgcHJpbWl0aXZlOiAgICBpc1ByaW1pdGl2ZVxuICBwcm9taXNlOiAgICAgIGlzUHJvbWlzZVxuICBoYXNoOiAgICAgICAgIGlzSGFzaFxuICByZWdleHA6ICAgICAgIGlzUmVnZXhwXG4gIHN0cmluZzogICAgICAgaXNTdHJpbmdcbiAgYmFzZTY0OiAgICAgICBpc0Jhc2U2NFxuICBoZXg6ICAgICAgICAgIGlzSGV4XG4gIHN5bWJvbDogICAgICAgaXNTeW1ib2xcblxuY2xhc3NpYy5hcmdzLmVtcHR5ICA9IGlzRW1wdHlBcmdzXG5jbGFzc2ljLmFycmF5LmVtcHR5ID0gaXNFbXB0eUFycmF5XG5jbGFzc2ljLmRhdGUudmFsaWQgID0gaXNWYWxpZERhdGVcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3NpY1xuIiwiaW1wb3J0IG9iamVjdEFzc2lnbiBmcm9tICdlcy1vYmplY3QtYXNzaWduJ1xuaW1wb3J0IHtpc051bWJlcn0gICBmcm9tICdlcy1pcydcblxuXG5jbGFzcyBDb29raWVzXG4gIGNvbnN0cnVjdG9yOiAoQGRlZmF1bHRzID0ge30pIC0+XG4gICAgQGdldCAgICA9IChrZXkpICAgICAgICAgICAgICAgPT4gQGFwaSBrZXlcbiAgICBAcmVtb3ZlID0gKGtleSwgYXR0cnMpICAgICAgICA9PiBAYXBpIGtleSwgJycsIG9iamVjdEFzc2lnbiBleHBpcmVzOiAtMSwgYXR0cnNcbiAgICBAc2V0ICAgID0gKGtleSwgdmFsdWUsIGF0dHJzKSA9PiBAYXBpIGtleSwgdmFsdWUsIGF0dHJzXG5cbiAgICBAZ2V0SlNPTiA9IChrZXkpID0+XG4gICAgICB2YWwgPSBAYXBpIGtleVxuICAgICAgcmV0dXJuIHt9IHVubGVzcyB2YWw/XG4gICAgICB0cnlcbiAgICAgICAgSlNPTi5wYXJzZSB2YWxcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICB2YWxcblxuICBhcGk6IChrZXksIHZhbHVlLCBhdHRycykgLT5cbiAgICByZXR1cm4gaWYgdHlwZW9mIGRvY3VtZW50ID09ICd1bmRlZmluZWQnXG5cbiAgICAjIFdyaXRlXG4gICAgaWYgYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgIGF0dHJzID0gb2JqZWN0QXNzaWduIHBhdGg6ICcvJywgQGRlZmF1bHRzLCBhdHRyc1xuXG4gICAgICBpZiBpc051bWJlciBhdHRycy5leHBpcmVzXG4gICAgICAgIGV4cGlyZXMgPSBuZXcgRGF0ZVxuICAgICAgICBleHBpcmVzLnNldE1pbGxpc2Vjb25kcyBleHBpcmVzLmdldE1pbGxpc2Vjb25kcygpICsgYXR0cnMuZXhwaXJlcyAqIDg2NGUrNVxuICAgICAgICBhdHRycy5leHBpcmVzID0gZXhwaXJlc1xuXG4gICAgICAjIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuICAgICAgYXR0cnMuZXhwaXJlcyA9IGlmIGF0dHJzLmV4cGlyZXMgdGhlbiBhdHRycy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgZWxzZSAnJ1xuXG4gICAgICB0cnlcbiAgICAgICAgcmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgICAgIGlmIC9eW1xce1xcW10vLnRlc3QocmVzdWx0KVxuICAgICAgICAgIHZhbHVlID0gcmVzdWx0XG4gICAgICBjYXRjaCBlcnJcblxuICAgICAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuXG4gICAgICBrZXkgPSBlbmNvZGVVUklDb21wb25lbnQgU3RyaW5nIGtleVxuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8NUV8NjB8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudClcbiAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9bXFwoXFwpXS9nLCBlc2NhcGUpXG5cbiAgICAgIHN0ckF0dHJzID0gJydcblxuICAgICAgZm9yIG5hbWUsIGF0dHIgb2YgYXR0cnNcbiAgICAgICAgY29udGludWUgdW5sZXNzIGF0dHJcbiAgICAgICAgc3RyQXR0cnMgKz0gJzsgJyArIG5hbWVcbiAgICAgICAgY29udGludWUgaWYgYXR0ciA9PSB0cnVlXG4gICAgICAgIHN0ckF0dHJzICs9ICc9JyArIGF0dHJcblxuICAgICAgcmV0dXJuIGRvY3VtZW50LmNvb2tpZSA9IGtleSArICc9JyArIHZhbHVlICsgc3RyQXR0cnNcblxuICAgICMgUmVhZFxuICAgIHVubGVzcyBrZXlcbiAgICAgIHJlc3VsdCA9IHt9XG5cbiAgICAjIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXkgaW4gY2FzZVxuICAgICMgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlbiBjYWxsaW5nXG4gICAgIyBcImdldCgpXCJcbiAgICBjb29raWVzID0gaWYgZG9jdW1lbnQuY29va2llIHRoZW4gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIGVsc2UgW11cbiAgICByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nXG5cbiAgICBmb3Iga3YgaW4gY29va2llc1xuICAgICAgcGFydHMgID0ga3Yuc3BsaXQgJz0nXG4gICAgICBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luICc9J1xuXG4gICAgICBpZiBjb29raWUuY2hhckF0KDApID09ICdcIidcbiAgICAgICAgY29va2llID0gY29va2llLnNsaWNlIDEsIC0xXG5cbiAgICAgIHRyeVxuICAgICAgICBuYW1lICAgPSBwYXJ0c1swXS5yZXBsYWNlIHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudFxuICAgICAgICBjb29raWUgPSBjb29raWUucmVwbGFjZSAgIHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudFxuXG4gICAgICAgIGlmIGtleSA9PSBuYW1lXG4gICAgICAgICAgcmV0dXJuIGNvb2tpZVxuICAgICAgICB1bmxlc3Mga2V5XG4gICAgICAgICAgcmVzdWx0W25hbWVdID0gY29va2llXG5cbiAgICAgIGNhdGNoIGVyclxuXG4gICAgcmVzdWx0XG5cbmV4cG9ydCBkZWZhdWx0IENvb2tpZXNcbiIsImltcG9ydCBDb29raWVzIGZyb20gJy4vY29va2llcydcbmV4cG9ydCBkZWZhdWx0IG5ldyBDb29raWVzKClcbiIsImltcG9ydCBjb29raWVzIGZyb20gJ2VzLWNvb2tpZXMnXG5cbmltcG9ydCB7aXNGdW5jdGlvbiwgdXBkYXRlUXVlcnl9IGZyb20gJy4uL3V0aWxzJ1xuXG5cbmNsYXNzIENsaWVudFxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICBAb3B0cyA9XG4gICAgICBkZWJ1ZzogICAgZmFsc2VcbiAgICAgIGVuZHBvaW50OiAnaHR0cHM6Ly9hcGkuaGFuem8uaW8nXG4gICAgICBzZXNzaW9uOlxuICAgICAgICBuYW1lOiAgICAnaHpvJ1xuICAgICAgICBleHBpcmVzOiA3ICogMjQgKiAzNjAwICogMTAwMFxuXG4gICAgZm9yIGssdiBvZiBvcHRzXG4gICAgICBAb3B0c1trXSA9IHZcblxuICBnZXRLZXk6IC0+XG4gICAgQG9wdHMua2V5XG5cbiAgc2V0S2V5OiAoa2V5KSAtPlxuICAgIEBvcHRzLmtleSA9IGtleVxuXG4gIGdldEN1c3RvbWVyVG9rZW46IC0+XG4gICAgaWYgKHNlc3Npb24gPSBjb29raWVzLmdldEpTT04gQG9wdHMuc2Vzc2lvbi5uYW1lKT9cbiAgICAgIEBjdXN0b21lclRva2VuID0gc2Vzc2lvbi5jdXN0b21lclRva2VuIGlmIHNlc3Npb24uY3VzdG9tZXJUb2tlbj9cbiAgICBAY3VzdG9tZXJUb2tlblxuXG4gIHNldEN1c3RvbWVyVG9rZW46IChrZXkpIC0+XG4gICAgY29va2llcy5zZXQgQG9wdHMuc2Vzc2lvbi5uYW1lLCB7Y3VzdG9tZXJUb2tlbjoga2V5fSwgZXhwaXJlczogQG9wdHMuc2Vzc2lvbi5leHBpcmVzXG4gICAgQGN1c3RvbWVyVG9rZW4gPSBrZXlcblxuICBkZWxldGVDdXN0b21lclRva2VuOiAtPlxuICAgIGNvb2tpZXMuc2V0IEBvcHRzLnNlc3Npb24ubmFtZSwge2N1c3RvbWVyVG9rZW46IG51bGx9LCBleHBpcmVzOiBAb3B0cy5zZXNzaW9uLmV4cGlyZXNcbiAgICBAY3VzdG9tZXJUb2tlbiA9IG51bGxcblxuICB1cmw6ICh1cmwsIGRhdGEsIGtleSkgLT5cbiAgICBpZiBpc0Z1bmN0aW9uIHVybFxuICAgICAgdXJsID0gdXJsLmNhbGwgQCwgZGF0YVxuXG4gICAgdXBkYXRlUXVlcnkgKEBvcHRzLmVuZHBvaW50ICsgdXJsKSwgdG9rZW46IGtleVxuXG4gIGxvZzogKGFyZ3MuLi4pIC0+XG4gICAgYXJncy51bnNoaWZ0ICdoYW56by5qcz4nXG4gICAgaWYgQG9wdHMuZGVidWcgYW5kIGNvbnNvbGU/XG4gICAgICBjb25zb2xlLmxvZyBhcmdzLi4uXG5cbmV4cG9ydCBkZWZhdWx0IENsaWVudFxuIiwiaW1wb3J0IFhociBmcm9tICdlcy14aHItcHJvbWlzZSdcblxuaW1wb3J0IENsaWVudCAgICAgZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQge25ld0Vycm9yLCB1cGRhdGVRdWVyeX0gZnJvbSAnLi4vdXRpbHMnXG5cbmNsYXNzIEJyb3dzZXJDbGllbnQgZXh0ZW5kcyBDbGllbnRcbiAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgIHJldHVybiBuZXcgQnJvd3NlckNsaWVudCBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQnJvd3NlckNsaWVudFxuICAgIHN1cGVyIG9wdHNcbiAgICBAZ2V0Q3VzdG9tZXJUb2tlbigpXG5cbiAgcmVxdWVzdDogKGJsdWVwcmludCwgZGF0YT17fSwga2V5ID0gQGdldEtleSgpKSAtPlxuICAgIG9wdHMgPVxuICAgICAgdXJsOiAgICBAdXJsIGJsdWVwcmludC51cmwsIGRhdGEsIGtleVxuICAgICAgbWV0aG9kOiBibHVlcHJpbnQubWV0aG9kXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kICE9ICdHRVQnXG4gICAgICBvcHRzLmhlYWRlcnMgPVxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kID09ICdHRVQnXG4gICAgICBvcHRzLnVybCAgPSB1cGRhdGVRdWVyeSBvcHRzLnVybCwgZGF0YVxuICAgIGVsc2VcbiAgICAgIG9wdHMuZGF0YSA9IEpTT04uc3RyaW5naWZ5IGRhdGFcblxuICAgIEBsb2cgJ3JlcXVlc3QnLCBrZXk6IGtleSwgb3B0czogb3B0c1xuXG4gICAgKG5ldyBYaHIpLnNlbmQgb3B0c1xuICAgICAgLnRoZW4gKHJlcykgPT5cbiAgICAgICAgQGxvZyAncmVzcG9uc2UnLCByZXNcbiAgICAgICAgcmVzLmRhdGEgPSByZXMucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc1xuICAgICAgLmNhdGNoIChyZXMpID0+XG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlcy5kYXRhID0gcmVzLnJlc3BvbnNlVGV4dCA/IChKU09OLnBhcnNlIHJlcy54aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICBjYXRjaCBlcnJcblxuICAgICAgICBlcnIgPSBuZXdFcnJvciBkYXRhLCByZXMsIGVyclxuICAgICAgICBAbG9nICdyZXNwb25zZScsIHJlc1xuICAgICAgICBAbG9nICdlcnJvcicsIGVyclxuXG4gICAgICAgIHRocm93IGVyclxuXG5leHBvcnQgZGVmYXVsdCBCcm93c2VyQ2xpZW50XG4iLCJpbXBvcnQge2lzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJ1xuXG4jIFdyYXAgYSB1cmwgZnVuY3Rpb24gdG8gcHJvdmlkZSBzdG9yZS1wcmVmaXhlZCBVUkxzXG5leHBvcnQgc3RvcmVQcmVmaXhlZCA9IHNwID0gKHUpIC0+XG4gICh4KSAtPlxuICAgIGlmIGlzRnVuY3Rpb24gdVxuICAgICAgdXJsID0gdSB4XG4gICAgZWxzZVxuICAgICAgdXJsID0gdVxuXG4gICAgaWYgQHN0b3JlSWQ/XG4gICAgICBcIi9zdG9yZS8je0BzdG9yZUlkfVwiICsgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgUmV0dXJucyBhIFVSTCBmb3IgZ2V0dGluZyBhIHNpbmdsZVxuZXhwb3J0IGJ5SWQgPSAobmFtZSkgLT5cbiAgc3dpdGNoIG5hbWVcbiAgICB3aGVuICdjb3Vwb24nXG4gICAgICBzcCAoeCkgLT4gXCIvY291cG9uLyN7eC5jb2RlID8geH1cIlxuICAgIHdoZW4gJ2NvbGxlY3Rpb24nXG4gICAgICBzcCAoeCkgLT4gXCIvY29sbGVjdGlvbi8je3guc2x1ZyA/IHh9XCJcbiAgICB3aGVuICdwcm9kdWN0J1xuICAgICAgc3AgKHgpIC0+IFwiL3Byb2R1Y3QvI3t4LmlkID8geC5zbHVnID8geH1cIlxuICAgIHdoZW4gJ3ZhcmlhbnQnXG4gICAgICBzcCAoeCkgLT4gXCIvdmFyaWFudC8je3guaWQgPyB4LnNrdSA/IHh9XCJcbiAgICB3aGVuICdzaXRlJ1xuICAgICAgKHgpIC0+IFwiL3NpdGUvI3t4LmlkID8geC5uYW1lID8geH1cIlxuICAgIGVsc2VcbiAgICAgICh4KSAtPiBcIi8je25hbWV9LyN7eC5pZCA/IHh9XCJcbiIsImltcG9ydCB7XG4gIEdFVFxuICBQT1NUXG4gIFBBVENIXG4gIGlzRnVuY3Rpb25cbiAgc3RhdHVzQ3JlYXRlZFxuICBzdGF0dXNOb0NvbnRlbnRcbiAgc3RhdHVzT2tcbn0gZnJvbSAnLi4vdXRpbHMnXG5cbmltcG9ydCB7YnlJZCwgc3RvcmVQcmVmaXhlZH0gZnJvbSAnLi91cmwnXG5cbiMgT25seSBsaXN0LCBnZXQgbWV0aG9kcyBvZiBhIGZldyBtb2RlbHMgYXJlIHN1cHBvcnRlZCB3aXRoIGEgcHVibGlzaGFibGUga2V5LFxuIyBzbyBvbmx5IHRoZXNlIG1ldGhvZHMgYXJlIGV4cG9zZWQgaW4gdGhlIGJyb3dzZXIuXG5jcmVhdGVCbHVlcHJpbnQgPSAobmFtZSkgLT5cbiAgZW5kcG9pbnQgPSBcIi8je25hbWV9XCJcblxuICBsaXN0OlxuICAgIHVybDogICAgIGVuZHBvaW50XG4gICAgbWV0aG9kOiAgR0VUXG4gICAgZXhwZWN0czogc3RhdHVzT2tcbiAgZ2V0OlxuICAgIHVybDogICAgIGJ5SWQgbmFtZVxuICAgIG1ldGhvZDogIEdFVFxuICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbmJsdWVwcmludHMgPVxuICAjIEFDQ09VTlRcbiAgYWNjb3VudDpcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICBHRVRcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICB1cGRhdGU6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICBQQVRDSFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIGV4aXN0czpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2V4aXN0cy8je3guZW1haWwgPyB4LnVzZXJuYW1lID8geC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIEdFVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHByb2Nlc3M6IChyZXMpIC0+IHJlcy5kYXRhLmV4aXN0c1xuXG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L2NyZWF0ZSdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGVuYWJsZTpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2VuYWJsZS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBsb2dpbjpcbiAgICAgIHVybDogICAgICcvYWNjb3VudC9sb2dpbidcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICBwcm9jZXNzOiAocmVzKSAtPlxuICAgICAgICBAc2V0Q3VzdG9tZXJUb2tlbiByZXMuZGF0YS50b2tlblxuICAgICAgICByZXNcblxuICAgIGxvZ291dDogLT5cbiAgICAgIEBkZWxldGVDdXN0b21lclRva2VuKClcblxuICAgIHJlc2V0OlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L3Jlc2V0J1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIHVwZGF0ZU9yZGVyOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvb3JkZXIvI3t4Lm9yZGVySWQgPyB4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgUEFUQ0hcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICBjb25maXJtOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvY29uZmlybS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgIyBDQVJUXG4gIGNhcnQ6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgICcvY2FydCdcbiAgICAgIG1ldGhvZDogICBQT1NUXG4gICAgICBleHBlY3RzOiAgc3RhdHVzQ3JlYXRlZFxuICAgIHVwZGF0ZTpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAgUEFUQ0hcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuICAgIGRpc2NhcmQ6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH0vZGlzY2FyZFwiXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG4gICAgc2V0OlxuICAgICAgdXJsOiAgICAgICh4KSAtPiBcIi9jYXJ0LyN7eC5pZCA/IHh9L3NldFwiXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG5cbiAgIyBSRVZJRVdTXG4gIHJldmlldzpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAgJy9yZXZpZXcnXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c0NyZWF0ZWRcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAgKHgpLT4gXCIvcmV2aWV3LyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICBHRVRcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuXG4gICMgQ0hFQ0tPVVRcbiAgY2hlY2tvdXQ6XG4gICAgYXV0aG9yaXplOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAnL2NoZWNrb3V0L2F1dGhvcml6ZSdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjYXB0dXJlOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAoeCkgLT4gXCIvY2hlY2tvdXQvY2FwdHVyZS8je3gub3JkZXJJZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjaGFyZ2U6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvY2hhcmdlJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIHBheXBhbDpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgJy9jaGVja291dC9wYXlwYWwnXG4gICAgICBtZXRob2Q6ICBQT1NUXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICMgUkVGRVJSRVJcbiAgcmVmZXJyZXI6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9yZWZlcnJlcidcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGdldDpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9yZWZlcnJlci8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICBHRVRcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiMgTU9ERUxTXG5tb2RlbHMgPSBbXG4gICdjb2xsZWN0aW9uJ1xuICAnY291cG9uJ1xuICAncHJvZHVjdCdcbiAgJ3ZhcmlhbnQnXG5dXG5cbmZvciBtb2RlbCBpbiBtb2RlbHNcbiAgZG8gKG1vZGVsKSAtPlxuICAgIGJsdWVwcmludHNbbW9kZWxdID0gY3JlYXRlQmx1ZXByaW50IG1vZGVsXG5cbmV4cG9ydCBkZWZhdWx0IGJsdWVwcmludHNcbiIsImltcG9ydCBBcGkgICAgICAgIGZyb20gJy4vYXBpJ1xuaW1wb3J0IENsaWVudCAgICAgZnJvbSAnLi9jbGllbnQvYnJvd3NlcidcbmltcG9ydCBibHVlcHJpbnRzIGZyb20gJy4vYmx1ZXByaW50cy9icm93c2VyJ1xuXG5BcGkuQkxVRVBSSU5UUyA9IGJsdWVwcmludHNcbkFwaS5DTElFTlQgICAgID0gQ2xpZW50XG5cbkhhbnpvID0gKG9wdHMgPSB7fSkgLT5cbiAgb3B0cy5jbGllbnQgICAgID89IG5ldyBDbGllbnQgb3B0c1xuICBvcHRzLmJsdWVwcmludHMgPz0gYmx1ZXByaW50c1xuICBuZXcgQXBpIG9wdHNcblxuSGFuem8uQXBpICAgICAgICA9IEFwaVxuSGFuem8uQ2xpZW50ICAgICA9IENsaWVudFxuXG5leHBvcnQgZGVmYXVsdCBIYW56b1xuZXhwb3J0IHtBcGksIENsaWVudH1cbiJdLCJuYW1lcyI6WyJfdW5kZWZpbmVkIiwiX3VuZGVmaW5lZFN0cmluZyIsIlByb21pc2UiLCJzb29uIiwiUHJvbWlzZUluc3BlY3Rpb24iLCJpbmRleCIsIm9iamVjdEFzc2lnbiIsInBhcnNlSGVhZGVycyIsImlzQXJyYXkiLCJpc0Z1bmN0aW9uIiwiQ29va2llcyIsIkNsaWVudCIsInNsaWNlIiwiY29va2llcyIsIlhociIsIkFwaSIsImJsdWVwcmludHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxJQUFBOztBQUFBLEFBQUEsSUFBTyxVQUFQLEdBQW9CLFNBQUMsRUFBRDtTQUFRLE9BQU8sRUFBUCxLQUFhOzs7QUFDekMsQUFBQTs7QUFHQSxBQUFBLElBQU8sUUFBUCxHQUF5QixTQUFDLEdBQUQ7U0FBUyxHQUFHLENBQUMsTUFBSixLQUFjOzs7QUFDaEQsQUFBQSxJQUFPLGFBQVAsR0FBeUIsU0FBQyxHQUFEO1NBQVMsR0FBRyxDQUFDLE1BQUosS0FBYzs7O0FBQ2hELEFBQUE7O0FBR0EsQUFBQSxJQUFPLEdBQVAsR0FBZTs7QUFDZixBQUFBLElBQU8sSUFBUCxHQUFlOztBQUNmLEFBQUEsSUFBTyxLQUFQLEdBQWU7O0FBR2YsQUFBQSxJQUFPLFFBQVAsR0FBa0IsU0FBQyxJQUFELEVBQU8sR0FBUCxFQUFpQixHQUFqQjtNQUNoQjs7SUFEdUIsTUFBTTs7RUFDN0IsT0FBQSxvSEFBcUM7RUFFckMsSUFBTyxXQUFQO0lBQ0UsR0FBQSxHQUFNLElBQUksS0FBSixDQUFVLE9BQVYsRUFEUjs7RUFHQSxHQUFHLENBQUMsSUFBSixHQUFtQixHQUFHLENBQUM7RUFDdkIsR0FBRyxDQUFDLEdBQUosR0FBbUI7RUFDbkIsR0FBRyxDQUFDLEdBQUosR0FBbUI7RUFDbkIsR0FBRyxDQUFDLFlBQUosR0FBbUIsR0FBRyxDQUFDO0VBQ3ZCLEdBQUcsQ0FBQyxNQUFKLEdBQW1CLEdBQUcsQ0FBQztFQUN2QixHQUFHLENBQUMsSUFBSixpRUFBa0MsQ0FBRTtTQUNwQzs7O0FBR0YsV0FBQSxHQUFjLFNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxLQUFYO01BQ1o7RUFBQSxFQUFBLEdBQUssSUFBSSxNQUFKLENBQVcsUUFBQSxHQUFXLEdBQVgsR0FBaUIsaUJBQTVCLEVBQStDLElBQS9DO0VBRUwsSUFBRyxFQUFFLENBQUMsSUFBSCxDQUFRLEdBQVIsQ0FBSDtJQUNFLElBQUcsYUFBSDthQUNFLEdBQUcsQ0FBQyxPQUFKLENBQVksRUFBWixFQUFnQixJQUFBLEdBQU8sR0FBUCxHQUFhLEdBQWIsR0FBbUIsS0FBbkIsR0FBMkIsTUFBM0MsRUFERjtLQUFBLE1BQUE7TUFHRSxJQUFBLEdBQU8sR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFWO01BQ1AsR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFSLENBQWdCLEVBQWhCLEVBQW9CLE1BQXBCLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsU0FBcEMsRUFBK0MsRUFBL0M7TUFDTixJQUF3QixlQUF4QjtRQUFBLEdBQUEsSUFBTyxHQUFBLEdBQU0sSUFBSyxDQUFBLENBQUEsRUFBbEI7O2FBQ0EsSUFORjtLQURGO0dBQUEsTUFBQTtJQVNFLElBQUcsYUFBSDtNQUNFLFNBQUEsR0FBZSxHQUFHLENBQUMsT0FBSixDQUFZLEdBQVosQ0FBQSxLQUFvQixDQUFDLENBQXhCLEdBQStCLEdBQS9CLEdBQXdDO01BQ3BELElBQUEsR0FBTyxHQUFHLENBQUMsS0FBSixDQUFVLEdBQVY7TUFDUCxHQUFBLEdBQU0sSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVLFNBQVYsR0FBc0IsR0FBdEIsR0FBNEIsR0FBNUIsR0FBa0M7TUFDeEMsSUFBd0IsZUFBeEI7UUFBQSxHQUFBLElBQU8sR0FBQSxHQUFNLElBQUssQ0FBQSxDQUFBLEVBQWxCOzthQUNBLElBTEY7S0FBQSxNQUFBO2FBT0UsSUFQRjtLQVRGOzs7O0FBbUJGLEFBQUEsSUFBTyxXQUFQLEdBQXFCLFNBQUMsR0FBRCxFQUFNLElBQU47TUFDbkI7RUFBQSxJQUFjLE9BQU8sSUFBUCxLQUFlLFFBQTdCO1dBQU8sSUFBUDs7T0FFQSxTQUFBOztJQUNFLEdBQUEsR0FBTSxXQUFBLENBQVksR0FBWixFQUFpQixDQUFqQixFQUFvQixDQUFwQjs7U0FDUjs7OztBQ3pERixJQUFBOztBQUFBLEFBRU07RUFDSixHQUFDLENBQUEsVUFBRCxHQUFjOztFQUNkLEdBQUMsQ0FBQSxNQUFELEdBQWM7O0VBRUQsYUFBQyxJQUFEO1FBQ1g7O01BRFksT0FBTzs7SUFDbkIsSUFBQSxFQUEyQixJQUFBLFlBQWEsR0FBeEMsQ0FBQTthQUFPLElBQUksR0FBSixDQUFRLElBQVIsRUFBUDs7SUFFQyw0QkFBRCxFQUFhO0lBRWIsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFBLElBQVUsSUFBSSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWpCLENBQXdCLElBQXhCOztNQUVwQixhQUFjLElBQUMsQ0FBQSxXQUFXLENBQUM7O1NBQzNCLGVBQUE7O01BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFmLEVBQWtCLENBQWxCOzs7O2dCQUVGLGFBQUEsR0FBZSxTQUFDLEdBQUQsRUFBTSxVQUFOO1FBQ2I7O01BQUEsSUFBRSxDQUFBLEdBQUEsSUFBUTs7U0FDVixrQkFBQTs7TUFDRSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsRUFBbUIsSUFBbkIsRUFBeUIsRUFBekI7Ozs7Z0JBR0osWUFBQSxHQUFjLFNBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxFQUFaO1FBRVo7SUFBQSxJQUFHLFVBQUEsQ0FBVyxFQUFYLENBQUg7YUFDUyxJQUFFLENBQUEsR0FBQSxDQUFLLENBQUEsSUFBQSxDQUFQLEdBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQTtpQkFBRyxFQUFFLENBQUMsS0FBSCxDQUFTLEtBQVQsRUFBWSxTQUFaOztPQUFILEVBQUEsSUFBQSxFQUR4Qjs7O01BSUEsRUFBRSxDQUFDLFVBQVc7OztNQUNkLEVBQUUsQ0FBQyxTQUFXOztJQUVkLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsSUFBRCxFQUFPLEVBQVA7WUFDUDtRQUFBLEdBQUEsR0FBTTtRQUNOLElBQUcsRUFBRSxDQUFDLGdCQUFOO1VBQ0UsR0FBQSxHQUFNLEtBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsR0FEUjs7ZUFFQSxLQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsRUFBb0IsSUFBcEIsRUFBMEIsR0FBMUIsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFDLEdBQUQ7Y0FDSjtVQUFBLElBQUcsdURBQUg7a0JBQ1EsUUFBQSxDQUFTLElBQVQsRUFBZSxHQUFmLEVBRFI7O1VBRUEsSUFBQSxDQUFPLEVBQUUsQ0FBQyxPQUFILENBQVcsR0FBWCxDQUFQO2tCQUNRLFFBQUEsQ0FBUyxJQUFULEVBQWUsR0FBZixFQURSOztVQUVBLElBQUcsa0JBQUg7WUFDRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsRUFBbUIsR0FBbkIsRUFERjs7b0RBRVcsR0FBRyxDQUFDO1NBUm5CLENBU0UsQ0FBQyxRQVRILENBU1ksRUFUWjs7S0FKTyxFQUFBLElBQUE7V0FlVCxJQUFFLENBQUEsR0FBQSxDQUFLLENBQUEsSUFBQSxDQUFQLEdBQWU7OztnQkFFakIsTUFBQSxHQUFRLFNBQUMsR0FBRDtXQUNOLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEdBQWY7OztnQkFFRixnQkFBQSxHQUFrQixTQUFDLEdBQUQ7V0FDaEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixHQUF6Qjs7O2dCQUVGLG1CQUFBLEdBQXFCO1dBQ25CLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVI7OztnQkFFRixRQUFBLEdBQVUsU0FBQyxFQUFEO0lBQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVztXQUNYLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixFQUFqQjs7Ozs7OztBQUVKLFlBQWU7Ozs7QUM3RGYsSUFBQTs7QUFBQSwwQkFBcUI7RUFDTiwyQkFBQyxHQUFEO0lBQUUsSUFBQyxDQUFBLFlBQUEsT0FBTyxJQUFDLENBQUEsWUFBQSxPQUFPLElBQUMsQ0FBQSxhQUFBOzs7OEJBRWhDLFdBQUEsR0FBYTtXQUNYLElBQUMsQ0FBQSxLQUFELEtBQVU7Ozs4QkFFWixVQUFBLEdBQVk7V0FDVixJQUFDLENBQUEsS0FBRCxLQUFVOzs7Ozs7OztBQ05kLElBQU9BLFlBQVAsR0FBMEI7O0FBQzFCLElBQU9DLGtCQUFQLEdBQTBCOzs7QUNGMUIsSUFBQTs7QUFBQSxJQWVBLEdBQVUsQ0FBQTtNQUVSO0VBQUEsRUFBQSxHQUFhO0VBSWIsT0FBQSxHQUFhO0VBQ2IsVUFBQSxHQUFhO0VBRWIsU0FBQSxHQUFZO1FBRVY7V0FBTSxFQUFFLENBQUMsTUFBSCxHQUFZLE9BQWxCOztRQUdJLEVBQUcsQ0FBQSxPQUFBLENBQUgsR0FGRjtPQUFBLGFBQUE7UUFHTTtRQUNKLElBQU8sT0FBTyxPQUFQLEtBQWtCLFdBQXpCO1VBQ0UsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkLEVBREY7U0FKRjs7TUFRQSxFQUFHLENBQUEsT0FBQSxFQUFBLENBQUgsR0FBZ0JEO01BRWhCLElBQUcsT0FBQSxLQUFXLFVBQWQ7UUFDRSxFQUFFLENBQUMsTUFBSCxDQUFVLENBQVYsRUFBYSxVQUFiO1FBQ0EsT0FBQSxHQUFVLEVBRlo7Ozs7RUFPSixPQUFBLEdBQWEsQ0FBQTtRQUVYO0lBQUEsSUFBRyxPQUFPLGdCQUFQLEtBQTJCQyxrQkFBOUI7TUFFRSxFQUFBLEdBQUssUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDTCxFQUFBLEdBQUssSUFBSSxnQkFBSixDQUFxQixTQUFyQjtNQUNMLEVBQUUsQ0FBQyxPQUFILENBQVcsRUFBWCxFQUFlO1FBQUEsVUFBQSxFQUFZLElBQVo7T0FBZjthQUVPO1FBQ0wsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsR0FBaEIsRUFBcUIsQ0FBckI7UUFQSjs7SUFXQSxJQUFHLE9BQU8sWUFBUCxLQUF1QkEsa0JBQTFCO2FBQ1M7UUFDTCxZQUFBLENBQWEsU0FBYjtRQUZKOztXQU1BO01BQ0UsVUFBQSxDQUFXLFNBQVgsRUFBc0IsQ0FBdEI7O0dBcEJTO1NBMEJiLFNBQUMsRUFBRDtJQUVFLEVBQUUsQ0FBQyxJQUFILENBQVEsRUFBUjtJQUdBLElBQUcsRUFBRSxDQUFDLE1BQUgsR0FBWSxPQUFaLEtBQXVCLENBQTFCO01BQ0UsT0FBQSxHQURGOzs7Q0E1RE07O0FBZ0VWLGFBQWU7OztBQzlFZixJQUFBQzs7Ozs7Ozs7QUFBQSxVQUlBLEdBQW1COztBQUNuQixhQUlBLEdBQWtCOztBQUNsQixlQUFBLEdBQWtCOztBQUNsQixjQUFBLEdBQWtCOztBQUVsQixhQUFBLEdBQWdCLFNBQUMsQ0FBRCxFQUFJLEdBQUo7TUFDZDtFQUFBLElBQUcsT0FBTyxDQUFDLENBQUMsQ0FBVCxLQUFjLFVBQWpCOztNQUVJLElBQUEsR0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUosQ0FBUyxVQUFULEVBQXFCLEdBQXJCO01BQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFKLENBQVksSUFBWixFQUZGO0tBQUEsYUFBQTtNQUdNO01BQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFKLENBQVcsR0FBWCxFQUpGO0tBREY7R0FBQSxNQUFBO0lBUUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFKLENBQVksR0FBWixFQVJGOzs7O0FBV0YsWUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFJLE1BQUo7TUFDYjtFQUFBLElBQUcsT0FBTyxDQUFDLENBQUMsQ0FBVCxLQUFjLFVBQWpCOztNQUVJLElBQUEsR0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUosQ0FBUyxVQUFULEVBQXFCLE1BQXJCO01BQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFKLENBQVksSUFBWixFQUZGO0tBQUEsYUFBQTtNQUdNO01BQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFKLENBQVcsR0FBWCxFQUpGO0tBREY7R0FBQSxNQUFBO0lBUUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFKLENBQVcsTUFBWCxFQVJGOzs7O0FBWUlBO0VBQ1MsaUJBQUMsRUFBRDtJQUNYLElBQUcsRUFBSDtNQUNFLEVBQUEsQ0FBRyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtpQkFDRCxLQUFDLENBQUEsT0FBRCxDQUFTLEdBQVQ7O09BREMsRUFBQSxJQUFBLENBQUgsRUFFRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtpQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLEdBQVI7O09BREEsRUFBQSxJQUFBLENBRkYsRUFERjs7OztvQkFNRixPQUFBLEdBQVMsU0FBQyxLQUFEO1FBQ1A7SUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFELEtBQVUsYUFBYjthQUFBOztJQUdBLElBQUcsS0FBQSxLQUFTLElBQVo7YUFDUyxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUksU0FBSixDQUFjLHNDQUFkLENBQVIsRUFEVDs7SUFHQSxJQUFHLEtBQUEsS0FBVyxPQUFPLEtBQVAsS0FBZ0IsVUFBaEIsSUFBOEIsT0FBTyxLQUFQLEtBQWdCLFFBQS9DLENBQWI7O1FBR0ksS0FBQSxHQUFRO1FBQ1IsSUFBQSxHQUFPLEtBQUssQ0FBQztRQUViLElBQUcsT0FBTyxJQUFQLEtBQWUsVUFBbEI7VUFHRSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxFQUFEO2NBQ2YsSUFBRyxLQUFIO2dCQUNFLElBQWlCLEtBQWpCO2tCQUFBLEtBQUEsR0FBUSxNQUFSOztnQkFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsRUFGRjs7O1dBRGUsRUFBQSxJQUFBLENBQWpCLEVBS0UsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxFQUFEO2NBQ0EsSUFBRyxLQUFIO2dCQUNFLEtBQUEsR0FBUTtnQkFDUixLQUFDLENBQUEsTUFBRCxDQUFRLEVBQVIsRUFGRjs7O1dBREEsRUFBQSxJQUFBLENBTEY7aUJBSEY7U0FMRjtPQUFBLGFBQUE7UUFtQk07UUFDSixJQUFlLEtBQWY7VUFBQSxJQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFBQTs7ZUFwQkY7T0FERjs7SUF3QkEsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxDQUFELEdBQVM7SUFFVCxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsQ0FBZDtNQUNFQyxNQUFBLENBQUssQ0FBQSxTQUFBLEtBQUE7ZUFBQTtjQUNIO2VBQUEseUNBQUE7O1lBQUEsYUFBQSxDQUFjLENBQWQsRUFBaUIsS0FBakI7OztPQURHLEVBQUEsSUFBQSxDQUFMLEVBREY7Ozs7b0JBTUYsTUFBQSxHQUFRLFNBQUMsTUFBRDtRQUNOO0lBQUEsSUFBVSxJQUFDLENBQUEsS0FBRCxLQUFVLGFBQXBCO2FBQUE7O0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxDQUFELEdBQVM7SUFFVCxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsQ0FBZDtNQUNFQSxNQUFBLENBQUs7WUFDSDthQUFBLHlDQUFBOztVQUFBLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLE1BQWhCOztPQURGLEVBREY7S0FBQSxNQUlLLElBQUcsQ0FBQyxPQUFPLENBQUMsOEJBQVQsSUFBNEMsT0FBTyxPQUFQLEtBQWtCLFdBQWpFO01BQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSwyQ0FBWixFQUF5RCxNQUF6RCxFQUFvRSxNQUFILEdBQWUsTUFBTSxDQUFDLEtBQXRCLEdBQWlDLElBQWxHLEVBREc7Ozs7b0JBS1AsSUFBQSxHQUFNLFNBQUMsV0FBRCxFQUFjLFVBQWQ7UUFDSjtJQUFBLENBQUEsR0FBSSxJQUFJO0lBRVIsTUFBQSxHQUNFO01BQUEsQ0FBQSxFQUFHLFdBQUg7TUFDQSxDQUFBLEVBQUcsVUFESDtNQUVBLENBQUEsRUFBRyxDQUZIOztJQUlGLElBQUcsSUFBQyxDQUFBLEtBQUQsS0FBVSxhQUFiO01BR0UsSUFBRyxJQUFDLENBQUEsQ0FBSjtRQUNFLElBQUMsQ0FBQSxDQUFDLENBQUMsSUFBSCxDQUFRLE1BQVIsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsQ0FBRCxHQUFLLENBQUUsTUFBRixFQUhQO09BSEY7S0FBQSxNQUFBO01BUUUsQ0FBQSxHQUFJLElBQUMsQ0FBQTtNQUNMLENBQUEsR0FBSSxJQUFDLENBQUE7TUFDTEEsTUFBQSxDQUFLO1FBRUgsSUFBRyxDQUFBLEtBQUssZUFBUjtVQUNFLGFBQUEsQ0FBYyxNQUFkLEVBQXNCLENBQXRCLEVBREY7U0FBQSxNQUFBO1VBR0UsWUFBQSxDQUFhLE1BQWIsRUFBcUIsQ0FBckIsRUFIRjs7T0FGRixFQVZGOztXQWlCQTs7OzRCQUVGLEdBQU8sU0FBQyxHQUFEO1dBQ0wsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVksR0FBWjs7OzhCQUVGLEdBQVMsU0FBQyxHQUFEO1dBQ1AsSUFBQyxDQUFBLElBQUQsQ0FBTSxHQUFOLEVBQVcsR0FBWDs7O29CQUVGLE9BQUEsR0FBUyxTQUFDLEVBQUQsRUFBSyxHQUFMO0lBQ1AsR0FBQSxHQUFNLEdBQUEsSUFBTztXQUViLElBQUksT0FBSixDQUFZLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtRQUNWLFVBQUEsQ0FBVztpQkFFVCxNQUFBLENBQU8sS0FBQSxDQUFNLEdBQU4sQ0FBUDtTQUZGLEVBR0UsRUFIRjtRQU1BLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBQyxHQUFEO1VBQ0osT0FBQSxDQUFRLEdBQVI7U0FERixFQUdFLFNBQUMsR0FBRDtVQUNBLE1BQUEsQ0FBTyxHQUFQO1NBSkY7O0tBUFUsRUFBQSxJQUFBLENBQVo7OztvQkFlRixRQUFBLEdBQVUsU0FBQyxFQUFEO0lBQ1IsSUFBRyxPQUFPLEVBQVAsS0FBYSxVQUFoQjtNQUNFLElBQUMsQ0FBQSxJQUFELENBQU8sU0FBQyxHQUFEO2VBQVMsRUFBQSxDQUFHLElBQUgsRUFBUyxHQUFUO09BQWhCO01BQ0EsSUFBQyxTQUFELENBQU8sU0FBQyxHQUFEO2VBQVMsRUFBQSxDQUFHLEdBQUgsRUFBUSxJQUFSO09BQWhCLEVBRkY7O1dBR0E7Ozs7Ozs7QUFFSixnQkFBZUQ7OztBQy9KZixJQUdPLE9BQVAsR0FBaUIsU0FBQyxHQUFEO01BQ2Y7RUFBQSxDQUFBLEdBQUksSUFBSUE7RUFDUixDQUFDLENBQUMsT0FBRixDQUFVLEdBQVY7U0FDQTs7O0FBRUYsSUFBTyxNQUFQLEdBQWdCLFNBQUMsR0FBRDtNQUNkO0VBQUEsQ0FBQSxHQUFJLElBQUlBO0VBQ1IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxHQUFUO1NBQ0E7OztBQUVGLElBQU8sR0FBUCxHQUFhLFNBQUMsRUFBRDtNQUVYO0VBQUEsT0FBQSxHQUFVO0VBQ1YsRUFBQSxHQUFVO0VBQ1YsSUFBQSxHQUFVLElBQUlBLFNBQUo7RUFFVixjQUFBLEdBQWlCLFNBQUMsQ0FBRCxFQUFJLENBQUo7SUFDZixJQUFHLENBQUMsQ0FBRCxJQUFNLE9BQU8sQ0FBQyxDQUFDLElBQVQsS0FBaUIsVUFBMUI7TUFDRSxDQUFBLEdBQUksT0FBQSxDQUFRLENBQVIsRUFETjs7SUFHQSxDQUFDLENBQUMsSUFBRixDQUFPLFNBQUMsRUFBRDtNQUNMLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYTtNQUNiLEVBQUE7TUFDQSxJQUFHLEVBQUEsS0FBTSxFQUFFLENBQUMsTUFBWjtRQUNFLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixFQURGOztLQUhGLEVBT0UsU0FBQyxFQUFEO01BQ0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxFQUFaO0tBUkY7O09BYUYsNENBQUE7O0lBQUEsY0FBQSxDQUFlLENBQWYsRUFBa0IsQ0FBbEI7O0VBR0EsSUFBRyxDQUFDLEVBQUUsQ0FBQyxNQUFQO0lBQ0UsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFiLEVBREY7O1NBR0E7OztBQUVGLElBQU8sT0FBUCxHQUFpQixTQUFDLE9BQUQ7U0FDZixJQUFJQSxTQUFKLENBQVksU0FBQyxPQUFELEVBQVUsTUFBVjtXQUNWLE9BQ0UsQ0FBQyxJQURILENBQ1EsU0FBQyxLQUFEO2FBQ0osT0FBQSxDQUFRLElBQUlFLG1CQUFKLENBQ047UUFBQSxLQUFBLEVBQU8sV0FBUDtRQUNBLEtBQUEsRUFBTyxLQURQO09BRE0sQ0FBUjtLQUZKLENBS0UsU0FMRixDQUtTLFNBQUMsR0FBRDthQUNMLE9BQUEsQ0FBUSxJQUFJQSxtQkFBSixDQUNOO1FBQUEsS0FBQSxFQUFPLFVBQVA7UUFDQSxNQUFBLEVBQVEsR0FEUjtPQURNLENBQVI7S0FOSjtHQURGOzs7QUFXRixJQUFPLE1BQVAsR0FBZ0IsU0FBQyxRQUFEO1NBQ2QsR0FBQSxDQUFJLFFBQVEsQ0FBQyxHQUFULENBQWEsT0FBYixDQUFKOzs7O0FDekRGLFNBS08sQ0FBQyxHQUFSLEdBQWM7O0FBQ2RGLFNBQU8sQ0FBQyxPQUFSLEdBQWtCOztBQUNsQkEsU0FBTyxDQUFDLE1BQVIsR0FBaUI7O0FBQ2pCQSxTQUFPLENBQUMsT0FBUixHQUFrQjs7QUFDbEJBLFNBQU8sQ0FBQyxNQUFSLEdBQWlCOztBQUNqQkEsU0FBTyxDQUFDLElBQVIsR0FBZUMsT0FFZjs7O0FDWkEsSUFBSSxxQkFBcUIsQ0FBQztBQUMxQixJQUFJLGNBQWMsQ0FBQztBQUNuQixJQUFJLFlBQVksQ0FBQztBQUNqQixJQUFJLGdCQUFnQixDQUFDO0FBQ3JCLElBQUksZUFBZSxDQUFDO0FBQ3BCLElBQUksUUFBUSxDQUFDO0FBQ2IsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQzs7QUFFckIscUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDOztBQUVyRCxjQUFjLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7O0FBRWpELGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7O0FBRXpELFFBQVEsR0FBRyxTQUFTLEdBQUcsRUFBRTtFQUN2QixJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQyxFQUFFO0lBQ2xDLE1BQU0sSUFBSSxTQUFTLENBQUMsdURBQXVELENBQUMsQ0FBQztHQUM5RTtFQUNELE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3BCLENBQUM7O0FBRUYsZUFBZSxHQUFHLFdBQVc7RUFDM0IsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0VBQ2hFLElBQUk7SUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtNQUNsQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDaEIsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO01BQ2hELE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTtNQUMvQixLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDekM7SUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtNQUN6RCxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQixDQUFDLENBQUM7SUFDSCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssWUFBWSxFQUFFO01BQ3BDLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1gsR0FBRyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMxQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2hCLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7S0FDeEI7SUFDRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssc0JBQXNCLEVBQUU7TUFDN0UsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUNELE9BQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQyxPQUFPLEtBQUssRUFBRTtJQUNkLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFDWixPQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0YsQ0FBQzs7QUFFRixJQUFJLEtBQUssR0FBRyxZQUFZLEdBQUcsQ0FBQyxXQUFXO0VBQ3JDLElBQUksZUFBZSxFQUFFLEVBQUU7SUFDckIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO0dBQ3RCO0VBQ0QsT0FBTyxXQUFXO0lBQ2hCLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7SUFDekUsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3ZGLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDOUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNwQixJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO01BQ3RCLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtRQUNoQixJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1VBQ2xDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckI7T0FDRjtNQUNELElBQUkscUJBQXFCLEVBQUU7UUFDekIsR0FBRyxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO1VBQzVDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDaEIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDM0I7U0FDRjtPQUNGO0tBQ0Y7SUFDRCxPQUFPLEVBQUUsQ0FBQztHQUNYLENBQUM7Q0FDSCxHQUFHLENBQUMsQUFFTCxBQUFxQixBQUNyQixBQUFrQzs7OztBQ3pGbEMsSUFBQTs7OztBQUFBLElBQUEsR0FBTyxTQUFDLENBQUQ7U0FDTCxDQUFDLENBQUMsT0FBRixDQUFVLFlBQVYsRUFBd0IsRUFBeEI7OztBQUVGLE9BQUEsR0FBVSxTQUFDLEdBQUQ7U0FDUixNQUFNLENBQUEsU0FBRSxDQUFBLFFBQVEsQ0FBQyxJQUFqQixDQUFzQixHQUF0QixDQUFBLEtBQThCOzs7QUFFaEMscUJBQWUsWUFBQSxHQUFlLFNBQUMsT0FBRDtNQUM1QjtFQUFBLElBQUEsQ0FBaUIsT0FBakI7V0FBTyxHQUFQOztFQUVBLE1BQUEsR0FBUzs7T0FFVCxxQ0FBQTs7SUFDRUUsUUFBQSxHQUFRLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FBWjtJQUNSLEdBQUEsR0FBTSxJQUFBLENBQUssR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLEVBQWFBLFFBQWIsQ0FBTCxDQUF5QixDQUFDLFdBQTFCO0lBQ04sS0FBQSxHQUFRLElBQUEsQ0FBSyxHQUFHLENBQUMsS0FBSixDQUFVQSxRQUFBLEdBQVEsQ0FBbEIsQ0FBTDtJQUNSLElBQUcsT0FBTyxNQUFPLENBQUEsR0FBQSxDQUFkLEtBQXNCLFdBQXpCO01BQ0UsTUFBTyxDQUFBLEdBQUEsQ0FBUCxHQUFjLE1BRGhCO0tBQUEsTUFFSyxJQUFHLE9BQUEsQ0FBUSxNQUFPLENBQUEsR0FBQSxDQUFmLENBQUg7TUFDSCxNQUFPLENBQUEsR0FBQSxDQUFJLENBQUMsSUFBWixDQUFpQixLQUFqQixFQURHO0tBQUEsTUFBQTtNQUdILE1BQU8sQ0FBQSxHQUFBLENBQVAsR0FBYyxDQUNaLE1BQU8sQ0FBQSxHQUFBLENBREssRUFFWixLQUZZLEVBSFg7Ozs7U0FRUDs7Ozs7Ozs7OztBQ3pCRixJQUFBOzs7QUFNQSxRQUlBLEdBQ0U7RUFBQSxNQUFBLEVBQVUsS0FBVjtFQUNBLE9BQUEsRUFBVSxFQURWO0VBRUEsSUFBQSxFQUFVLElBRlY7RUFHQSxRQUFBLEVBQVUsSUFIVjtFQUlBLFFBQUEsRUFBVSxJQUpWO0VBS0EsS0FBQSxFQUFVLElBTFY7Ozs7Ozs7O0FBVUk7OztFQUVKLFVBQUMsQ0FBQSxvQkFBRCxHQUF1Qjs7RUFFdkIsVUFBQyxDQUFBLE9BQUQsR0FBVUg7Ozs7Ozs7Ozs7dUJBWVYsSUFBQSxHQUFNLFNBQUMsT0FBRDs7TUFBQyxVQUFVOztJQUNmLE9BQUEsR0FBVUksS0FBQSxDQUFhLEVBQWIsRUFBaUIsUUFBakIsRUFBMkIsT0FBM0I7V0FFVixJQUFJSixTQUFKLENBQVksQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1lBQ1Y7UUFBQSxJQUFBLENBQU8sY0FBUDtVQUNFLEtBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUF5QixNQUF6QixFQUFpQyxJQUFqQyxFQUF1Qyx3Q0FBdkM7aUJBREY7O1FBSUEsSUFBRyxPQUFPLE9BQU8sQ0FBQyxHQUFmLEtBQXdCLFFBQXhCLElBQW9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBWixLQUFzQixDQUE3RDtVQUNFLEtBQUMsQ0FBQSxZQUFELENBQWMsS0FBZCxFQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyw2QkFBbkM7aUJBREY7O1FBS0EsS0FBQyxDQUFBLElBQUQsR0FBUSxHQUFBLEdBQU0sSUFBSSxjQUFKO1FBR2QsR0FBRyxDQUFDLE1BQUosR0FBYTtjQUNYO1VBQUEsS0FBQyxDQUFBLG1CQUFEOztZQUdFLFlBQUEsR0FBZSxLQUFDLENBQUEsZ0JBQUQsR0FEakI7V0FBQSxhQUFBO1lBR0UsS0FBQyxDQUFBLFlBQUQsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLEVBQStCLElBQS9CLEVBQXFDLHVCQUFyQzttQkFIRjs7aUJBTUEsT0FBQSxDQUNFO1lBQUEsR0FBQSxFQUFjLEtBQUMsQ0FBQSxlQUFELEVBQWQ7WUFDQSxPQUFBLEVBQWMsS0FBQyxDQUFBLFdBQUQsRUFEZDtZQUVBLFlBQUEsRUFBYyxZQUZkO1lBR0EsTUFBQSxFQUFjLEdBQUcsQ0FBQyxNQUhsQjtZQUlBLFVBQUEsRUFBYyxHQUFHLENBQUMsVUFKbEI7WUFLQSxHQUFBLEVBQWMsR0FMZDtXQURGOztRQVNGLEdBQUcsQ0FBQyxPQUFKLEdBQWdCO2lCQUFHLEtBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxFQUF5QixNQUF6Qjs7UUFDbkIsR0FBRyxDQUFDLFNBQUosR0FBZ0I7aUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBYyxTQUFkLEVBQXlCLE1BQXpCOztRQUNuQixHQUFHLENBQUMsT0FBSixHQUFnQjtpQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsRUFBeUIsTUFBekI7O1FBRW5CLEtBQUMsQ0FBQSxtQkFBRDtRQUVBLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBTyxDQUFDLE1BQWpCLEVBQXlCLE9BQU8sQ0FBQyxHQUFqQyxFQUFzQyxPQUFPLENBQUMsS0FBOUMsRUFBcUQsT0FBTyxDQUFDLFFBQTdELEVBQXVFLE9BQU8sQ0FBQyxRQUEvRTtRQUVBLElBQUcsMEJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQVEsQ0FBQSxjQUFBLENBQXJDO1VBQ0UsT0FBTyxDQUFDLE9BQVEsQ0FBQSxjQUFBLENBQWhCLEdBQWtDLEtBQUMsQ0FBQSxXQUFXLENBQUMscUJBRGpEOzs7YUFHQSxhQUFBOztVQUNFLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixNQUFyQixFQUE2QixLQUE3Qjs7O2lCQUdBLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBTyxDQUFDLElBQWpCLEVBREY7U0FBQSxhQUFBO1VBRU07aUJBQ0osS0FBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBQXNCLE1BQXRCLEVBQThCLElBQTlCLEVBQW9DLENBQUMsQ0FBQyxRQUFGLEVBQXBDLEVBSEY7OztLQTdDVSxFQUFBLElBQUEsQ0FBWjs7Ozs7Ozs7dUJBcURGLE1BQUEsR0FBUTtXQUFHLElBQUMsQ0FBQTs7Ozs7Ozs7Ozs7Ozt1QkFjWixtQkFBQSxHQUFxQjtJQUNuQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsbUJBQW1CLENBQUMsSUFBckIsQ0FBMEIsSUFBMUI7SUFDbEIsSUFBa0QsTUFBTSxDQUFDLFdBQXpEO2FBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsVUFBbkIsRUFBK0IsSUFBQyxDQUFBLGNBQWhDLEVBQUE7Ozs7Ozs7Ozt1QkFLRixtQkFBQSxHQUFxQjtJQUNuQixJQUFrRCxNQUFNLENBQUMsV0FBekQ7YUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixVQUFuQixFQUErQixJQUFDLENBQUEsY0FBaEMsRUFBQTs7Ozs7Ozs7O3VCQUtGLFdBQUEsR0FBYTtXQUNYSyxjQUFBLENBQWEsSUFBQyxDQUFBLElBQUksQ0FBQyxxQkFBTixFQUFiOzs7Ozs7Ozs7O3VCQU9GLGdCQUFBLEdBQWtCO1FBRWhCO0lBQUEsWUFBQSxHQUFrQixPQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBYixLQUE2QixRQUFoQyxHQUE4QyxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQXBELEdBQXNFO1lBRTlFLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBQU4sQ0FBd0IsY0FBeEIsQ0FBUDtXQUNPLGtCQURQO1dBQzJCLGlCQUQzQjtRQUdJLFlBQUEsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLFlBQUEsR0FBZSxFQUExQjs7V0FFbkI7Ozs7Ozs7Ozs7dUJBT0YsZUFBQSxHQUFpQjtJQUNmLElBQTRCLDZCQUE1QjthQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBYjs7SUFHQSxJQUFtRCxrQkFBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUFDLENBQUEsSUFBSSxDQUFDLHFCQUFOLEVBQXhCLENBQW5EO2FBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxpQkFBTixDQUF3QixlQUF4QixFQUFQOztXQUVBOzs7Ozs7Ozs7Ozs7dUJBU0YsWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsVUFBekI7SUFDWixJQUFDLENBQUEsbUJBQUQ7V0FFQSxNQUFBLENBQ0U7TUFBQSxNQUFBLEVBQVksTUFBWjtNQUNBLE1BQUEsRUFBWSxNQUFBLElBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxNQURoQztNQUVBLFVBQUEsRUFBWSxVQUFBLElBQWMsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUZoQztNQUdBLEdBQUEsRUFBWSxJQUFDLENBQUEsSUFIYjtLQURGOzs7Ozs7Ozt1QkFTRixtQkFBQSxHQUFxQjtXQUNuQixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU47Ozs7Ozs7QUFFSixtQkFBZTs7OztBQ3pLZjs7Ozs7Ozs7QUFBQSxRQUFBLEdBQWdCLE1BQU0sQ0FBQzs7QUFDdkIsSUFBQSxHQUFnQixRQUFRLENBQUM7O0FBQ3pCLEtBQUEsR0FBZ0IsUUFBUSxDQUFDOztBQUN6QixhQUFBLEdBQWdCOztBQUNoQixJQUFHLE9BQU8sTUFBUCxLQUFpQixVQUFwQjtFQUNFLGFBQUEsR0FBZ0IsTUFBTSxDQUFBLFNBQUUsQ0FBQSxRQUQxQjs7O0FBR0EsV0FBQSxHQUFjLFNBQUMsS0FBRDtTQUNaLEtBQUEsS0FBUzs7O0FBRVgsQUFNQSxBQUNBLEFBUUEsQUFRQSxBQVFBLEFBQ0UsQUFDQSxBQUdBLEFBYUYsSUFBTyxPQUFQLEdBQWlCLFNBQUMsS0FBRCxFQUFRLEtBQVI7TUFDZjtFQUFBLElBQWUsS0FBQSxLQUFTLEtBQXhCO1dBQU8sS0FBUDs7RUFFQSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYO0VBRVAsSUFBRyxJQUFBLEtBQVEsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQVg7V0FDUyxNQURUOztFQUdBLElBQUcsSUFBQSxLQUFRLGlCQUFYO1NBQ0UsWUFBQTtNQUNFLElBQUcsQ0FBQyxPQUFBLENBQVEsS0FBTSxDQUFBLEdBQUEsQ0FBZCxFQUFvQixLQUFNLENBQUEsR0FBQSxDQUExQixDQUFELElBQW9DLEVBQUUsR0FBQSxJQUFPLEtBQVIsQ0FBeEM7ZUFDUyxNQURUOzs7U0FFRixZQUFBO01BQ0UsSUFBRyxDQUFDLE9BQUEsQ0FBUSxLQUFNLENBQUEsR0FBQSxDQUFkLEVBQW9CLEtBQU0sQ0FBQSxHQUFBLENBQTFCLENBQUQsSUFBb0MsRUFBRSxHQUFBLElBQU8sS0FBUixDQUF4QztlQUNTLE1BRFQ7OztXQUVLLEtBUFQ7O0VBU0EsSUFBRyxJQUFBLEtBQVEsZ0JBQVg7SUFDRSxHQUFBLEdBQU0sS0FBSyxDQUFDO0lBQ1osSUFBRyxHQUFBLEtBQU8sS0FBSyxDQUFDLE1BQWhCO2FBQ1MsTUFEVDs7V0FFTSxHQUFBLEVBQU47TUFDRSxJQUFHLENBQUMsT0FBQSxDQUFRLEtBQU0sQ0FBQSxHQUFBLENBQWQsRUFBb0IsS0FBTSxDQUFBLEdBQUEsQ0FBMUIsQ0FBSjtlQUNTLE1BRFQ7OztXQUVLLEtBUFQ7O0VBU0EsSUFBRyxJQUFBLEtBQVEsbUJBQVg7V0FDUyxLQUFLLENBQUMsU0FBTixLQUFtQixLQUFLLENBQUMsVUFEbEM7O0VBR0EsSUFBRyxJQUFBLEtBQVEsZUFBWDtXQUNTLEtBQUssQ0FBQyxPQUFOLEVBQUEsS0FBbUIsS0FBSyxDQUFDLE9BQU4sR0FENUI7O1NBR0E7OztBQVFGLEFBQ0UsQUFDQSxBQU9GLEFBUUEsQUFTQSxBQVFBLElBQU8sV0FBUCxHQUFxQixTQUFDLEtBQUQ7U0FDbkIsQ0FBQyxDQUFDLEtBQUYsSUFBWSxDQUFDLE1BQUEsQ0FBTyxLQUFQLENBQWIsSUFBK0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLFFBQWpCLENBQS9CLElBQThELFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUE5RCxJQUF5RixRQUFBLENBQVMsS0FBSyxDQUFDLE1BQWYsQ0FBekYsSUFBb0gsS0FBSyxDQUFDLE1BQU4sSUFBZ0I7OztBQU90SSxJQUFPLFdBQVAsR0FBcUIsTUFBQSxHQUFTLFNBQUMsS0FBRDtNQUM1QjtFQUFBLG1CQUFBLEdBQXNCLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxDQUFBLEtBQXFCO0VBQzNDLGNBQUEsR0FBaUIsQ0FBQ0MsU0FBQSxDQUFRLEtBQVIsQ0FBRCxJQUFvQixXQUFBLENBQVksS0FBWixDQUFwQixJQUEyQyxRQUFBLENBQVMsS0FBVCxDQUEzQyxJQUErRCxJQUFBLENBQUssS0FBSyxDQUFDLE1BQVg7U0FDaEYsbUJBQUEsSUFBdUI7OztBQU96QixJQUFPQSxTQUFQLEdBQWlCLEtBQUssQ0FBQyxPQUFOLElBQWlCLFNBQUMsS0FBRDtTQUNoQyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsQ0FBQSxLQUFxQjs7O0FBT3ZCLEFBUUEsQUFDRSxBQUFBLEFBT0YsSUFBTyxNQUFQLEdBQWdCLFNBQUMsS0FBRDtTQUNkLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxDQUFBLEtBQXFCOzs7QUFPdkIsQUFRQSxBQVVBLEFBT0EsQUFRQSxBQVFBLEFBUUEsSUFBT0MsWUFBUCxHQUFvQixJQUFBLEdBQU8sU0FBQyxLQUFEO01BQ3pCO0VBQUEsT0FBQSxHQUFVLE9BQU8sTUFBUCxLQUFpQixXQUFqQixJQUFpQyxLQUFBLEtBQVMsTUFBTSxDQUFDO0VBQzNELElBQUcsT0FBSDtXQUNTLEtBRFQ7O0VBRUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWDtTQUNOLEdBQUEsS0FBTyxtQkFBUCxJQUE4QixHQUFBLEtBQU8sNEJBQXJDLElBQXFFLEdBQUEsS0FBTzs7O0FBTzlFLElBQU8sUUFBUCxHQUFrQixTQUFDLEtBQUQ7U0FDaEIsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQUEsS0FBcUI7OztBQU92QixBQVFBLEFBU0EsQUFDRSxBQUNBLEFBQ0EsQUFRRixBQVNBLEFBaUJBLEFBZ0JBLEFBUUEsQUFRQSxBQVNBLEFBQ0UsQUFVRixBQUNFLEFBVUYsQUFDRSxBQVVGLEFBQ0UsQUFXRixBQUNFLEFBSUEsQUFRRixJQUFPLFFBQVAsR0FBa0IsU0FBQyxLQUFEO1NBQ2hCLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxDQUFBLEtBQXFCO0VBT3ZCLEFBQ0UsQUFFQSxBQVNGLEFBUUEsQUFRQSxBQVFBLEFBQU8sQUFBUCxBQVFBLEFBQ0UsQUFBQSxBQU9GLEFBQ0UsQUFBQSxBQU9GLEFBR0EsQUFrREEsQUFDQSxBQUNBLEFBRUE7Ozs7QUN2aEJBLElBQUE7O0FBQUE7RUFLZSxpQkFBQyxRQUFEO0lBQUMsSUFBQyxDQUFBLDhCQUFELFdBQVk7SUFDeEIsSUFBQyxDQUFBLEdBQUQsR0FBVSxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsR0FBRDtlQUF1QixLQUFDLENBQUEsR0FBRCxDQUFLLEdBQUw7O0tBQXZCLEVBQUEsSUFBQTtJQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxLQUFOO2VBQXVCLEtBQUMsQ0FBQSxHQUFELENBQUssR0FBTCxFQUFVLEVBQVYsRUFBY0gsS0FBQSxDQUFhO1VBQUEsT0FBQSxFQUFTLENBQUMsQ0FBVjtTQUFiLEVBQTBCLEtBQTFCLENBQWQ7O0tBQXZCLEVBQUEsSUFBQTtJQUNWLElBQUMsQ0FBQSxHQUFELEdBQVUsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYjtlQUF1QixLQUFDLENBQUEsR0FBRCxDQUFLLEdBQUwsRUFBVSxLQUFWLEVBQWlCLEtBQWpCOztLQUF2QixFQUFBLElBQUE7SUFFVixJQUFDLENBQUEsT0FBRCxHQUFXLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxHQUFEO1lBQ1Q7UUFBQSxHQUFBLEdBQU0sS0FBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMO1FBQ04sSUFBaUIsV0FBakI7aUJBQU8sR0FBUDs7O2lCQUVFLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxFQURGO1NBQUEsYUFBQTtVQUVNO2lCQUNKLElBSEY7OztLQUhTLEVBQUEsSUFBQTs7O29CQVFiLEdBQUEsR0FBSyxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYjtRQUNIO0lBQUEsSUFBVSxPQUFPLFFBQVAsS0FBbUIsV0FBN0I7YUFBQTs7SUFHQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO01BQ0UsS0FBQSxHQUFRQSxLQUFBLENBQWE7UUFBQSxJQUFBLEVBQU0sR0FBTjtPQUFiLEVBQXdCLElBQUMsQ0FBQSxRQUF6QixFQUFtQyxLQUFuQztNQUVSLElBQUcsUUFBQSxDQUFTLEtBQUssQ0FBQyxPQUFmLENBQUg7UUFDRSxPQUFBLEdBQVUsSUFBSTtRQUNkLE9BQU8sQ0FBQyxlQUFSLENBQXdCLE9BQU8sQ0FBQyxlQUFSLEVBQUEsR0FBNEIsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsTUFBcEU7UUFDQSxLQUFLLENBQUMsT0FBTixHQUFnQixRQUhsQjs7TUFNQSxLQUFLLENBQUMsT0FBTixHQUFtQixLQUFLLENBQUMsT0FBVCxHQUFzQixLQUFLLENBQUMsT0FBTyxDQUFDLFdBQWQsRUFBdEIsR0FBdUQ7O1FBR3JFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBTCxDQUFlLEtBQWY7UUFDVCxJQUFHLFNBQVMsQ0FBQyxJQUFWLENBQWUsTUFBZixDQUFIO1VBQ0UsS0FBQSxHQUFRLE9BRFY7U0FGRjtPQUFBLGFBQUE7UUFJTSxZQUpOOztNQU1BLEtBQUEsR0FBUSxrQkFBQSxDQUFtQixNQUFBLENBQU8sS0FBUCxDQUFuQixDQUFpQyxDQUFDLE9BQWxDLENBQTBDLDJEQUExQyxFQUF1RyxrQkFBdkc7TUFFUixHQUFBLEdBQU0sa0JBQUEsQ0FBbUIsTUFBQSxDQUFPLEdBQVAsQ0FBbkI7TUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSwwQkFBWixFQUF3QyxrQkFBeEM7TUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaLEVBQXVCLE1BQXZCO01BRU4sUUFBQSxHQUFXO1dBRVgsYUFBQTs7UUFDRSxJQUFBLENBQWdCLElBQWhCO21CQUFBOztRQUNBLFFBQUEsSUFBWSxJQUFBLEdBQU87UUFDbkIsSUFBWSxJQUFBLEtBQVEsSUFBcEI7bUJBQUE7O1FBQ0EsUUFBQSxJQUFZLEdBQUEsR0FBTTs7YUFFYixRQUFRLENBQUMsTUFBVCxHQUFrQixHQUFBLEdBQU0sR0FBTixHQUFZLEtBQVosR0FBb0IsU0EvQi9DOztJQWtDQSxJQUFBLENBQU8sR0FBUDtNQUNFLE1BQUEsR0FBUyxHQURYOztJQU1BLE9BQUEsR0FBYSxRQUFRLENBQUMsTUFBWixHQUF3QixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQWhCLENBQXNCLElBQXRCLENBQXhCLEdBQXlEO0lBQ25FLE9BQUEsR0FBVTtTQUVWLHlDQUFBOztNQUNFLEtBQUEsR0FBUyxFQUFFLENBQUMsS0FBSCxDQUFTLEdBQVQ7TUFDVCxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFaLENBQWMsQ0FBQyxJQUFmLENBQW9CLEdBQXBCO01BRVQsSUFBRyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsQ0FBQSxLQUFvQixHQUF2QjtRQUNFLE1BQUEsR0FBUyxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWIsRUFBZ0IsQ0FBQyxDQUFqQixFQURYOzs7UUFJRSxJQUFBLEdBQVMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVQsQ0FBaUIsT0FBakIsRUFBMEIsa0JBQTFCO1FBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWlCLE9BQWpCLEVBQTBCLGtCQUExQjtRQUVULElBQUcsR0FBQSxLQUFPLElBQVY7aUJBQ1MsT0FEVDs7UUFFQSxJQUFBLENBQU8sR0FBUDtVQUNFLE1BQU8sQ0FBQSxJQUFBLENBQVAsR0FBZSxPQURqQjtTQU5GO09BQUEsYUFBQTtRQVNNLFlBVE47OztXQVdGOzs7Ozs7O0FBRUosZ0JBQWU7OztBQ3JGZixjQUNlLElBQUlJLFNBQUo7OztBQ0RmLElBQUFDLFFBQUE7SUFBQUM7O0FBQUEsQUFFQSxBQUdNRDtFQUNTLGdCQUFDLElBQUQ7UUFDWDs7TUFEWSxPQUFPOztJQUNuQixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsS0FBQSxFQUFVLEtBQVY7TUFDQSxRQUFBLEVBQVUsc0JBRFY7TUFFQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQVMsS0FBVDtRQUNBLE9BQUEsRUFBUyxDQUFBLEdBQUksRUFBSixHQUFTLElBQVQsR0FBZ0IsSUFEekI7T0FIRjs7U0FNRixTQUFBOztNQUNFLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFOLEdBQVc7Ozs7bUJBRWYsTUFBQSxHQUFRO1dBQ04sSUFBQyxDQUFBLElBQUksQ0FBQzs7O21CQUVSLE1BQUEsR0FBUSxTQUFDLEdBQUQ7V0FDTixJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sR0FBWTs7O21CQUVkLGdCQUFBLEdBQWtCO1FBQ2hCO0lBQUEsSUFBRywyREFBSDtNQUNFLElBQTBDLDZCQUExQztRQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLE9BQU8sQ0FBQyxjQUF6QjtPQURGOztXQUVBLElBQUMsQ0FBQTs7O21CQUVILGdCQUFBLEdBQWtCLFNBQUMsR0FBRDtJQUNoQkUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUExQixFQUFnQztNQUFDLGFBQUEsRUFBZSxHQUFoQjtLQUFoQyxFQUFzRDtNQUFBLE9BQUEsRUFBUyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUF2QjtLQUF0RDtXQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCOzs7bUJBRW5CLG1CQUFBLEdBQXFCO0lBQ25CQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQTFCLEVBQWdDO01BQUMsYUFBQSxFQUFlLElBQWhCO0tBQWhDLEVBQXVEO01BQUEsT0FBQSxFQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQXZCO0tBQXZEO1dBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7OzttQkFFbkIsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxHQUFaO0lBQ0gsSUFBRyxVQUFBLENBQVcsR0FBWCxDQUFIO01BQ0UsR0FBQSxHQUFNLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxFQUFZLElBQVosRUFEUjs7V0FHQSxXQUFBLENBQWEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLEdBQWlCLEdBQTlCLEVBQW9DO01BQUEsS0FBQSxFQUFPLEdBQVA7S0FBcEM7OzttQkFFRixHQUFBLEdBQUs7UUFDSDtJQURJO0lBQ0osSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiO0lBQ0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sd0RBQUg7YUFDRSxPQUFPLENBQUMsR0FBUixnQkFBWSxJQUFaLEVBREY7Ozs7Ozs7O0FBR0osZUFBZUY7OztBQy9DZixJQUFBLGFBQUE7SUFBQTs7O0FBQUEsQUFFQSxBQUNBLEFBRU07OztFQUNTLHVCQUFDLElBQUQ7SUFDWCxJQUFBLEVBQXFDLElBQUEsWUFBYSxhQUFsRCxDQUFBO2FBQU8sSUFBSSxhQUFKLENBQWtCLElBQWxCLEVBQVA7O0lBQ0EsK0NBQU0sSUFBTjtJQUNBLElBQUMsQ0FBQSxnQkFBRDs7OzBCQUVGLE9BQUEsR0FBUyxTQUFDLFNBQUQsRUFBWSxJQUFaLEVBQXFCLEdBQXJCO1FBQ1A7O01BRG1CLE9BQUs7OztNQUFJLE1BQU0sSUFBQyxDQUFBLE1BQUQ7O0lBQ2xDLElBQUEsR0FDRTtNQUFBLEdBQUEsRUFBUSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQVMsQ0FBQyxHQUFmLEVBQW9CLElBQXBCLEVBQTBCLEdBQTFCLENBQVI7TUFDQSxNQUFBLEVBQVEsU0FBUyxDQUFDLE1BRGxCOztJQUdGLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsS0FBdkI7TUFDRSxJQUFJLENBQUMsT0FBTCxHQUNFO1FBQUEsY0FBQSxFQUFnQixrQkFBaEI7UUFGSjs7SUFJQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLEtBQXZCO01BQ0UsSUFBSSxDQUFDLEdBQUwsR0FBWSxXQUFBLENBQVksSUFBSSxDQUFDLEdBQWpCLEVBQXNCLElBQXRCLEVBRGQ7S0FBQSxNQUFBO01BR0UsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFIZDs7SUFLQSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0I7TUFBQSxHQUFBLEVBQUssR0FBTDtNQUFVLElBQUEsRUFBTSxJQUFoQjtLQUFoQjtXQUVBLENBQUMsSUFBSUcsWUFBTCxFQUFVLElBQVYsQ0FBZSxJQUFmLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQ7UUFDSixLQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsR0FBakI7UUFDQSxHQUFHLENBQUMsSUFBSixHQUFXLEdBQUcsQ0FBQztlQUNmOztLQUhJLEVBQUEsSUFBQSxDQURSLENBS0UsU0FMRixDQUtTLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxHQUFEO1lBQ0w7O1VBQ0UsR0FBRyxDQUFDLElBQUosNENBQStCLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFuQixFQURqQztTQUFBLGFBQUE7VUFFTSxZQUZOOztRQUlBLEdBQUEsR0FBTSxRQUFBLENBQVMsSUFBVCxFQUFlLEdBQWYsRUFBb0IsR0FBcEI7UUFDTixLQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsR0FBakI7UUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxHQUFkO2NBRU07O0tBVEQsRUFBQSxJQUFBLENBTFQ7Ozs7O0dBdEJ3Qkg7O0FBc0M1QixhQUFlOzs7QUMzQ2YsSUFBQTs7QUFBQSxBQUdBLEFBQUEsSUFBTyxhQUFQLEdBQXVCLEVBQUEsR0FBSyxTQUFDLENBQUQ7U0FDMUIsU0FBQyxDQUFEO1FBQ0U7SUFBQSxJQUFHLFVBQUEsQ0FBVyxDQUFYLENBQUg7TUFDRSxHQUFBLEdBQU0sQ0FBQSxDQUFFLENBQUYsRUFEUjtLQUFBLE1BQUE7TUFHRSxHQUFBLEdBQU0sRUFIUjs7SUFLQSxJQUFHLG9CQUFIO2FBQ0UsQ0FBQSxTQUFBLEdBQVUsSUFBQyxDQUFBLE9BQVgsSUFBdUIsSUFEekI7S0FBQSxNQUFBO2FBR0UsSUFIRjs7Ozs7QUFNSixBQUFBLElBQU8sSUFBUCxHQUFjLFNBQUMsSUFBRDtVQUNMLElBQVA7U0FDTyxRQURQO2FBRUksRUFBQSxDQUFHLFNBQUMsQ0FBRDtZQUFPO2VBQUEsVUFBQSxtQ0FBb0IsQ0FBVjtPQUFwQjtTQUNHLFlBSFA7YUFJSSxFQUFBLENBQUcsU0FBQyxDQUFEO1lBQU87ZUFBQSxjQUFBLG1DQUF3QixDQUFWO09BQXhCO1NBQ0csU0FMUDthQU1JLEVBQUEsQ0FBRyxTQUFDLENBQUQ7WUFBTztlQUFBLFdBQUEsa0VBQTRCLENBQWpCO09BQXJCO1NBQ0csU0FQUDthQVFJLEVBQUEsQ0FBRyxTQUFDLENBQUQ7WUFBTztlQUFBLFdBQUEsaUVBQTJCLENBQWhCO09BQXJCO1NBQ0csTUFUUDthQVVJLFNBQUMsQ0FBRDtZQUFPO2VBQUEsUUFBQSxrRUFBeUIsQ0FBakI7OzthQUVmLFNBQUMsQ0FBRDtZQUFPO2VBQUEsR0FBQSxHQUFJLElBQUosR0FBUyxHQUFULGlDQUFtQixDQUFSOzs7Ozs7QUM3QnhCLElBQUE7Ozs7Ozs7O0FBQUEsQUFVQSxBQUlBLGVBQUEsR0FBa0IsU0FBQyxJQUFEO01BQ2hCO0VBQUEsUUFBQSxHQUFXLEdBQUEsR0FBSTtTQUVmO0lBQUEsSUFBQSxFQUNFO01BQUEsR0FBQSxFQUFTLFFBQVQ7TUFDQSxNQUFBLEVBQVMsR0FEVDtNQUVBLE9BQUEsRUFBUyxRQUZUO0tBREY7SUFJQSxHQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVMsSUFBQSxDQUFLLElBQUwsQ0FBVDtNQUNBLE1BQUEsRUFBUyxHQURUO01BRUEsT0FBQSxFQUFTLFFBRlQ7S0FMRjs7OztBQVNGLFVBQUEsR0FFRTtFQUFBLE9BQUEsRUFDRTtJQUFBLEdBQUEsRUFDRTtNQUFBLEdBQUEsRUFBUyxVQUFUO01BQ0EsTUFBQSxFQUFTLEdBRFQ7TUFFQSxPQUFBLEVBQVMsUUFGVDtNQUdBLGdCQUFBLEVBQWtCLElBSGxCO0tBREY7SUFNQSxNQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVMsVUFBVDtNQUNBLE1BQUEsRUFBUyxLQURUO01BRUEsT0FBQSxFQUFTLFFBRlQ7TUFHQSxnQkFBQSxFQUFrQixJQUhsQjtLQVBGO0lBWUEsTUFBQSxFQUNFO01BQUEsR0FBQSxFQUFTLFNBQUMsQ0FBRDtZQUFPO2VBQUEsa0JBQUEsd0dBQWlELENBQS9CO09BQWxDO01BQ0EsTUFBQSxFQUFTLEdBRFQ7TUFFQSxPQUFBLEVBQVMsUUFGVDtNQUdBLE9BQUEsRUFBUyxTQUFDLEdBQUQ7ZUFBUyxHQUFHLENBQUMsSUFBSSxDQUFDO09BSDNCO0tBYkY7SUFrQkEsTUFBQSxFQUNFO01BQUEsR0FBQSxFQUFTLGlCQUFUO01BQ0EsTUFBQSxFQUFTLElBRFQ7TUFFQSxPQUFBLEVBQVMsYUFGVDtLQW5CRjtJQXVCQSxNQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVMsU0FBQyxDQUFEO1lBQU87ZUFBQSxrQkFBQSxzQ0FBK0IsQ0FBYjtPQUFsQztNQUNBLE1BQUEsRUFBUyxJQURUO01BRUEsT0FBQSxFQUFTLFFBRlQ7S0F4QkY7SUE0QkEsS0FBQSxFQUNFO01BQUEsR0FBQSxFQUFTLGdCQUFUO01BQ0EsTUFBQSxFQUFTLElBRFQ7TUFFQSxPQUFBLEVBQVMsUUFGVDtNQUdBLE9BQUEsRUFBUyxTQUFDLEdBQUQ7UUFDUCxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUEzQjtlQUNBO09BTEY7S0E3QkY7SUFvQ0EsTUFBQSxFQUFRO2FBQ04sSUFBQyxDQUFBLG1CQUFEO0tBckNGO0lBdUNBLEtBQUEsRUFDRTtNQUFBLEdBQUEsRUFBUyxnQkFBVDtNQUNBLE1BQUEsRUFBUyxJQURUO01BRUEsT0FBQSxFQUFTLFFBRlQ7TUFHQSxnQkFBQSxFQUFrQixJQUhsQjtLQXhDRjtJQTZDQSxXQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVMsU0FBQyxDQUFEO1lBQU87ZUFBQSxpQkFBQSxxRUFBcUMsQ0FBcEI7T0FBakM7TUFDQSxNQUFBLEVBQVMsS0FEVDtNQUVBLE9BQUEsRUFBUyxRQUZUO01BR0EsZ0JBQUEsRUFBa0IsSUFIbEI7S0E5Q0Y7SUFtREEsT0FBQSxFQUNFO01BQUEsR0FBQSxFQUFTLFNBQUMsQ0FBRDtZQUFPO2VBQUEsbUJBQUEsc0NBQWdDLENBQWI7T0FBbkM7TUFDQSxNQUFBLEVBQVMsSUFEVDtNQUVBLE9BQUEsRUFBUyxRQUZUO01BR0EsZ0JBQUEsRUFBa0IsSUFIbEI7S0FwREY7R0FERjtFQTJEQSxJQUFBLEVBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVUsT0FBVjtNQUNBLE1BQUEsRUFBVSxJQURWO01BRUEsT0FBQSxFQUFVLGFBRlY7S0FERjtJQUlBLE1BQUEsRUFDRTtNQUFBLEdBQUEsRUFBVSxTQUFDLENBQUQ7WUFBTztlQUFBLFFBQUEsaUNBQWdCLENBQVI7T0FBekI7TUFDQSxNQUFBLEVBQVUsS0FEVjtNQUVBLE9BQUEsRUFBVSxRQUZWO0tBTEY7SUFRQSxPQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVUsU0FBQyxDQUFEO1lBQU87ZUFBQSxRQUFBLGlDQUFnQixDQUFSLENBQVIsR0FBa0I7T0FBbkM7TUFDQSxNQUFBLEVBQVUsSUFEVjtNQUVBLE9BQUEsRUFBVSxRQUZWO0tBVEY7SUFZQSxHQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVUsU0FBQyxDQUFEO1lBQU87ZUFBQSxRQUFBLGlDQUFnQixDQUFSLENBQVIsR0FBa0I7T0FBbkM7TUFDQSxNQUFBLEVBQVUsSUFEVjtNQUVBLE9BQUEsRUFBVSxRQUZWO0tBYkY7R0E1REY7RUE4RUEsTUFBQSxFQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsR0FBQSxFQUFVLFNBQVY7TUFDQSxNQUFBLEVBQVUsSUFEVjtNQUVBLE9BQUEsRUFBVSxhQUZWO0tBREY7SUFJQSxHQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVUsU0FBQyxDQUFEO1lBQU07ZUFBQSxVQUFBLGlDQUFrQixDQUFSO09BQTFCO01BQ0EsTUFBQSxFQUFVLEdBRFY7TUFFQSxPQUFBLEVBQVUsUUFGVjtLQUxGO0dBL0VGO0VBeUZBLFFBQUEsRUFDRTtJQUFBLFNBQUEsRUFDRTtNQUFBLEdBQUEsRUFBUyxhQUFBLENBQWMscUJBQWQsQ0FBVDtNQUNBLE1BQUEsRUFBUyxJQURUO01BRUEsT0FBQSxFQUFTLFFBRlQ7S0FERjtJQUtBLE9BQUEsRUFDRTtNQUFBLEdBQUEsRUFBUyxhQUFBLENBQWMsU0FBQyxDQUFEO1lBQU87ZUFBQSxvQkFBQSxzQ0FBaUMsQ0FBYjtPQUF6QyxDQUFUO01BQ0EsTUFBQSxFQUFTLElBRFQ7TUFFQSxPQUFBLEVBQVMsUUFGVDtLQU5GO0lBVUEsTUFBQSxFQUNFO01BQUEsR0FBQSxFQUFTLGFBQUEsQ0FBYyxrQkFBZCxDQUFUO01BQ0EsTUFBQSxFQUFTLElBRFQ7TUFFQSxPQUFBLEVBQVMsUUFGVDtLQVhGO0lBZUEsTUFBQSxFQUNFO01BQUEsR0FBQSxFQUFTLGFBQUEsQ0FBYyxrQkFBZCxDQUFUO01BQ0EsTUFBQSxFQUFTLElBRFQ7TUFFQSxPQUFBLEVBQVMsUUFGVDtLQWhCRjtHQTFGRjtFQStHQSxRQUFBLEVBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxHQUFBLEVBQVMsV0FBVDtNQUNBLE1BQUEsRUFBUyxJQURUO01BRUEsT0FBQSxFQUFTLGFBRlQ7S0FERjtJQUtBLEdBQUEsRUFDRTtNQUFBLEdBQUEsRUFBUyxTQUFDLENBQUQ7WUFBTztlQUFBLFlBQUEsaUNBQW9CLENBQVI7T0FBNUI7TUFDQSxNQUFBLEVBQVMsR0FEVDtNQUVBLE9BQUEsRUFBUyxRQUZUO0tBTkY7R0FoSEY7OztBQTJIRixNQUFBLEdBQVMsQ0FDUCxZQURPLEVBRVAsUUFGTyxFQUdQLFNBSE8sRUFJUCxTQUpPOztLQVFKLFNBQUMsS0FBRDtTQUNELFVBQVcsQ0FBQSxLQUFBLENBQVgsR0FBb0IsZUFBQSxDQUFnQixLQUFoQjs7QUFGeEIsS0FBQSx3Q0FBQTs7S0FDTTs7O0FBR04sbUJBQWU7OztBQ2xLZixJQUFBOztBQUFBLEFBQ0EsQUFDQSxBQUVBSSxLQUFHLENBQUMsVUFBSixHQUFpQkM7O0FBQ2pCRCxLQUFHLENBQUMsTUFBSixHQUFpQjs7QUFFakIsS0FBQSxHQUFRLFNBQUMsSUFBRDs7SUFBQyxPQUFPOzs7SUFDZCxJQUFJLENBQUMsU0FBYyxJQUFJLE1BQUosQ0FBVyxJQUFYOzs7SUFDbkIsSUFBSSxDQUFDLGFBQWNDOztTQUNuQixJQUFJRCxLQUFKLENBQVEsSUFBUjs7O0FBRUYsS0FBSyxDQUFDLEdBQU4sR0FBbUJBOztBQUNuQixLQUFLLENBQUMsTUFBTixHQUFtQjs7QUFFbkIsY0FBZSxNQUNmOzs7Ozs7In0=
