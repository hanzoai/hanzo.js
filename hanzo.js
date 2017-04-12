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

// node_modules/broken/lib/broken.mjs
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

// node_modules/es-object-assign/lib/es-object-assign.mjs
// src/index.coffee
var getOwnSymbols;
var objectAssign;
var shouldUseNative;
var toObject;
var slice = [].slice;

getOwnSymbols = Object.getOwnPropertySymbols;

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

// node_modules/es-xhr-promise/lib/es-xhr-promise.mjs
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
var getOwnSymbols$1;
var objectAssign$2;
var shouldUseNative$1;
var toObject$1;
var slice$2 = [].slice;

getOwnSymbols$1 = Object.getOwnPropertySymbols;

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
      if (getOwnSymbols$1) {
        ref = getOwnSymbols$1(from);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuem8uanMiLCJzb3VyY2VzIjpbInNyYy91dGlscy5jb2ZmZWUiLCJzcmMvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm9rZW4vc3JjL3Byb21pc2UtaW5zcGVjdGlvbi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJva2VuL3NyYy91dGlscy5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJva2VuL3NyYy9zb29uLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm9rZW4vc3JjL3Byb21pc2UuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9zcmMvaGVscGVycy5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJva2VuL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtb2JqZWN0LWFzc2lnbi9zcmMvaW5kZXguY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXhoci1wcm9taXNlL3NyYy9wYXJzZS1oZWFkZXJzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9zcmMvaW5kZXguY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXRvc3RyaW5nL2luZGV4Lm1qcyIsIm5vZGVfbW9kdWxlcy9lcy1pcy9zcmMvbnVtYmVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL25vZGVfbW9kdWxlcy9lcy1vYmplY3QtYXNzaWduL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtY29va2llcy9zcmMvY29va2llcy5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtY29va2llcy9zcmMvaW5kZXguY29mZmVlIiwic3JjL2NsaWVudC9jbGllbnQuY29mZmVlIiwic3JjL2NsaWVudC9icm93c2VyLmNvZmZlZSIsInNyYy9ibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJzcmMvYmx1ZXByaW50cy9icm93c2VyLmNvZmZlZSIsInNyYy9icm93c2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEhlbHBlcnNcbmV4cG9ydCBpc0Z1bmN0aW9uID0gKGZuKSAtPiB0eXBlb2YgZm4gaXMgJ2Z1bmN0aW9uJ1xuZXhwb3J0IGlzU3RyaW5nICAgPSAocykgIC0+IHR5cGVvZiBzICBpcyAnc3RyaW5nJ1xuXG4jIEZldyBzdGF0dXMgY29kZXMgd2UgdXNlIHRocm91Z2hvdXQgY29kZSBiYXNlXG5leHBvcnQgc3RhdHVzT2sgICAgICAgID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDBcbmV4cG9ydCBzdGF0dXNDcmVhdGVkICAgPSAocmVzKSAtPiByZXMuc3RhdHVzIGlzIDIwMVxuZXhwb3J0IHN0YXR1c05vQ29udGVudCA9IChyZXMpIC0+IHJlcy5zdGF0dXMgaXMgMjA0XG5cbiMgQWxsb3cgbWV0aG9kIG5hbWVzIHRvIGJlIG1pbmlmaWVkXG5leHBvcnQgR0VUICAgPSAnR0VUJ1xuZXhwb3J0IFBPU1QgID0gJ1BPU1QnXG5leHBvcnQgUEFUQ0ggPSAnUEFUQ0gnXG5cbiMgVGhyb3cgXCJmYXRcIiBlcnJvcnMuXG5leHBvcnQgbmV3RXJyb3IgPSAoZGF0YSwgcmVzID0ge30sIGVycikgLT5cbiAgbWVzc2FnZSA9IHJlcy5kYXRhPy5lcnJvcj8ubWVzc2FnZSA/ICdSZXF1ZXN0IGZhaWxlZCdcblxuICB1bmxlc3MgZXJyP1xuICAgIGVyciA9IG5ldyBFcnJvciBtZXNzYWdlXG5cbiAgZXJyLmRhdGEgICAgICAgICA9IHJlcy5kYXRhXG4gIGVyci5tc2cgICAgICAgICAgPSBtZXNzYWdlXG4gIGVyci5yZXEgICAgICAgICAgPSBkYXRhXG4gIGVyci5yZXNwb25zZVRleHQgPSByZXMuZGF0YVxuICBlcnIuc3RhdHVzICAgICAgID0gcmVzLnN0YXR1c1xuICBlcnIudHlwZSAgICAgICAgID0gcmVzLmRhdGE/LmVycm9yPy50eXBlXG4gIGVyclxuXG4jIFVwZGF0ZSBwYXJhbSBpbiBxdWVyeVxudXBkYXRlUGFyYW0gPSAodXJsLCBrZXksIHZhbHVlKSAtPlxuICByZSA9IG5ldyBSZWdFeHAoJyhbPyZdKScgKyBrZXkgKyAnPS4qPygmfCN8JCkoLiopJywgJ2dpJylcblxuICBpZiByZS50ZXN0IHVybFxuICAgIGlmIHZhbHVlP1xuICAgICAgdXJsLnJlcGxhY2UgcmUsICckMScgKyBrZXkgKyAnPScgKyB2YWx1ZSArICckMiQzJ1xuICAgIGVsc2VcbiAgICAgIGhhc2ggPSB1cmwuc3BsaXQgJyMnXG4gICAgICB1cmwgPSBoYXNoWzBdLnJlcGxhY2UocmUsICckMSQzJykucmVwbGFjZSgvKCZ8XFw/KSQvLCAnJylcbiAgICAgIHVybCArPSAnIycgKyBoYXNoWzFdIGlmIGhhc2hbMV0/XG4gICAgICB1cmxcbiAgZWxzZVxuICAgIGlmIHZhbHVlP1xuICAgICAgc2VwYXJhdG9yID0gaWYgdXJsLmluZGV4T2YoJz8nKSAhPSAtMSB0aGVuICcmJyBlbHNlICc/J1xuICAgICAgaGFzaCA9IHVybC5zcGxpdCAnIydcbiAgICAgIHVybCA9IGhhc2hbMF0gKyBzZXBhcmF0b3IgKyBrZXkgKyAnPScgKyB2YWx1ZVxuICAgICAgdXJsICs9ICcjJyArIGhhc2hbMV0gaWYgaGFzaFsxXT9cbiAgICAgIHVybFxuICAgIGVsc2VcbiAgICAgIHVybFxuXG4jIFVwZGF0ZSBxdWVyeSBvbiB1cmxcbmV4cG9ydCB1cGRhdGVRdWVyeSA9ICh1cmwsIGRhdGEpIC0+XG4gIHJldHVybiB1cmwgaWYgdHlwZW9mIGRhdGEgIT0gJ29iamVjdCdcblxuICBmb3Igayx2IG9mIGRhdGFcbiAgICB1cmwgPSB1cGRhdGVQYXJhbSB1cmwsIGssIHZcbiAgdXJsXG4iLCJpbXBvcnQge0dFVCwgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIG5ld0Vycm9yLCBzdGF0dXNPa30gZnJvbSAnLi91dGlscydcblxuY2xhc3MgQXBpXG4gIEBCTFVFUFJJTlRTID0ge31cbiAgQENMSUVOVCAgICAgPSBudWxsXG5cbiAgY29uc3RydWN0b3I6IChvcHRzID0ge30pIC0+XG4gICAgcmV0dXJuIG5ldyBBcGkgb3B0cyB1bmxlc3MgQCBpbnN0YW5jZW9mIEFwaVxuXG4gICAge2JsdWVwcmludHMsIGNsaWVudH0gPSBvcHRzXG5cbiAgICBAY2xpZW50ID0gY2xpZW50IG9yIG5ldyBAY29uc3RydWN0b3IuQ0xJRU5UIG9wdHNcblxuICAgIGJsdWVwcmludHMgPz0gQGNvbnN0cnVjdG9yLkJMVUVQUklOVFNcbiAgICBAYWRkQmx1ZXByaW50cyBrLCB2IGZvciBrLCB2IG9mIGJsdWVwcmludHNcblxuICBhZGRCbHVlcHJpbnRzOiAoYXBpLCBibHVlcHJpbnRzKSAtPlxuICAgIEBbYXBpXSA/PSB7fVxuICAgIGZvciBuYW1lLCBicCBvZiBibHVlcHJpbnRzXG4gICAgICBAYWRkQmx1ZXByaW50IGFwaSwgbmFtZSwgYnBcbiAgICByZXR1cm5cblxuICBhZGRCbHVlcHJpbnQ6IChhcGksIG5hbWUsIGJwKSAtPlxuICAgICMgTm9ybWFsIG1ldGhvZFxuICAgIGlmIGlzRnVuY3Rpb24gYnBcbiAgICAgIHJldHVybiBAW2FwaV1bbmFtZV0gPSA9PiBicC5hcHBseSBALCBhcmd1bWVudHNcblxuICAgICMgQmx1ZXByaW50IG1ldGhvZFxuICAgIGJwLmV4cGVjdHMgPz0gc3RhdHVzT2tcbiAgICBicC5tZXRob2QgID89IEdFVFxuXG4gICAgbWV0aG9kID0gKGRhdGEsIGNiKSA9PlxuICAgICAga2V5ID0gdW5kZWZpbmVkXG4gICAgICBpZiBicC51c2VDdXN0b21lclRva2VuXG4gICAgICAgIGtleSA9IEBjbGllbnQuZ2V0Q3VzdG9tZXJUb2tlbigpXG4gICAgICBAY2xpZW50LnJlcXVlc3QgYnAsIGRhdGEsIGtleVxuICAgICAgICAudGhlbiAocmVzKSA9PlxuICAgICAgICAgIGlmIHJlcy5kYXRhPy5lcnJvcj9cbiAgICAgICAgICAgIHRocm93IG5ld0Vycm9yIGRhdGEsIHJlc1xuICAgICAgICAgIHVubGVzcyBicC5leHBlY3RzIHJlc1xuICAgICAgICAgICAgdGhyb3cgbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgICAgaWYgYnAucHJvY2Vzcz9cbiAgICAgICAgICAgIGJwLnByb2Nlc3MuY2FsbCBALCByZXNcbiAgICAgICAgICByZXMuZGF0YSA/IHJlcy5ib2R5XG4gICAgICAgIC5jYWxsYmFjayBjYlxuXG4gICAgQFthcGldW25hbWVdID0gbWV0aG9kXG5cbiAgc2V0S2V5OiAoa2V5KSAtPlxuICAgIEBjbGllbnQuc2V0S2V5IGtleVxuXG4gIHNldEN1c3RvbWVyVG9rZW46IChrZXkpIC0+XG4gICAgQGNsaWVudC5zZXRDdXN0b21lclRva2VuIGtleVxuXG4gIGRlbGV0ZUN1c3RvbWVyVG9rZW46IC0+XG4gICAgQGNsaWVudC5kZWxldGVDdXN0b21lclRva2VuKClcblxuICBzZXRTdG9yZTogKGlkKSAtPlxuICAgIEBzdG9yZUlkID0gaWRcbiAgICBAY2xpZW50LnNldFN0b3JlIGlkXG5cbmV4cG9ydCBkZWZhdWx0IEFwaVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvbWlzZUluc3BlY3Rpb25cbiAgY29uc3RydWN0b3I6ICh7QHN0YXRlLCBAdmFsdWUsIEByZWFzb259KSAtPlxuXG4gIGlzRnVsZmlsbGVkOiAtPlxuICAgIEBzdGF0ZSBpcyAnZnVsZmlsbGVkJ1xuXG4gIGlzUmVqZWN0ZWQ6IC0+XG4gICAgQHN0YXRlIGlzICdyZWplY3RlZCdcbiIsIiMgTGV0IHRoZSBvYmZpc2NhdG9yIGNvbXByZXNzIHRoZXNlIGRvd24gYnkgYXNzaWduaW5nIHRoZW0gdG8gdmFyaWFibGVzXG5leHBvcnQgX3VuZGVmaW5lZCAgICAgICA9IHVuZGVmaW5lZFxuZXhwb3J0IF91bmRlZmluZWRTdHJpbmcgPSAndW5kZWZpbmVkJ1xuIiwiaW1wb3J0IHtfdW5kZWZpbmVkLCBfdW5kZWZpbmVkU3RyaW5nfSBmcm9tICcuL3V0aWxzJ1xuXG4jIFNlZSBodHRwOi8vd3d3LmJsdWVqYXZhLmNvbS80TlMvU3BlZWQtdXAteW91ci1XZWJzaXRlcy13aXRoLWEtRmFzdGVyLXNldFRpbWVvdXQtdXNpbmctc29vblxuIyBUaGlzIGlzIGEgdmVyeSBmYXN0IFwiYXN5bmNocm9ub3VzXCIgZmxvdyBjb250cm9sIC0gaS5lLiBpdCB5aWVsZHMgdGhlIHRocmVhZFxuIyBhbmQgZXhlY3V0ZXMgbGF0ZXIsIGJ1dCBub3QgbXVjaCBsYXRlci4gSXQgaXMgZmFyIGZhc3RlciBhbmQgbGlnaHRlciB0aGFuXG4jIHVzaW5nIHNldFRpbWVvdXQoZm4sMCkgZm9yIHlpZWxkaW5nIHRocmVhZHMuICBJdHMgYWxzbyBmYXN0ZXIgdGhhbiBvdGhlclxuIyBzZXRJbW1lZGlhdGUgc2hpbXMsIGFzIGl0IHVzZXMgTXV0YXRpb24gT2JzZXJ2ZXIgYW5kIFwibWFpbmxpbmVzXCIgc3VjY2Vzc2l2ZVxuIyBjYWxscyBpbnRlcm5hbGx5LlxuI1xuIyBXQVJOSU5HOiBUaGlzIGRvZXMgbm90IHlpZWxkIHRvIHRoZSBicm93c2VyIFVJIGxvb3AsIHNvIGJ5IHVzaW5nIHRoaXNcbiMgICAgICAgICAgcmVwZWF0ZWRseSB5b3UgY2FuIHN0YXJ2ZSB0aGUgVUkgYW5kIGJlIHVucmVzcG9uc2l2ZSB0byB0aGUgdXNlci5cbiNcbiMgVGhpcyBpcyBhbiBldmVuIEZBU1RFUiB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2JsdWVqYXZhLzliOTU0MmQxZGEyYTE2NGQwNDU2XG4jIHRoYXQgZ2l2ZXMgdXAgcGFzc2luZyBjb250ZXh0IGFuZCBhcmd1bWVudHMsIGluIGV4Y2hhbmdlIGZvciBhIDI1eCBzcGVlZFxuIyBpbmNyZWFzZS4gKFVzZSBhbm9uIGZ1bmN0aW9uIHRvIHBhc3MgY29udGV4dC9hcmdzKVxuc29vbiA9IGRvIC0+XG4gICMgRnVuY3Rpb24gcXVldWVcbiAgZnEgICAgICAgICA9IFtdXG5cbiAgIyBBdm9pZCB1c2luZyBzaGlmdCgpIGJ5IG1haW50YWluaW5nIGEgc3RhcnQgcG9pbnRlciAtIGFuZCByZW1vdmUgaXRlbXMgaW5cbiAgIyBjaHVua3Mgb2YgMTAyNCAoYnVmZmVyU2l6ZSlcbiAgZnFTdGFydCAgICA9IDBcbiAgYnVmZmVyU2l6ZSA9IDEwMjRcblxuICBjYWxsUXVldWUgPSAtPlxuICAgICMgVGhpcyBhcHByb2FjaCBhbGxvd3MgbmV3IHlpZWxkcyB0byBwaWxlIG9uIGR1cmluZyB0aGUgZXhlY3V0aW9uIG9mIHRoZXNlXG4gICAgd2hpbGUgZnEubGVuZ3RoIC0gZnFTdGFydFxuICAgICAgdHJ5XG4gICAgICAgICMgTm8gY29udGV4dCBvciBhcmdzLi4uXG4gICAgICAgIGZxW2ZxU3RhcnRdKClcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICB1bmxlc3MgdHlwZW9mIGNvbnNvbGUgaXMgJ3VuZGVmaW5lZCdcbiAgICAgICAgICBjb25zb2xlLmVycm9yIGVyclxuXG4gICAgICAjIEluY3JlYXNlIHN0YXJ0IHBvaW50ZXIgYW5kIGRlcmVmZXJlbmNlIGZ1bmN0aW9uIGp1c3QgY2FsbGVkXG4gICAgICBmcVtmcVN0YXJ0KytdID0gX3VuZGVmaW5lZFxuXG4gICAgICBpZiBmcVN0YXJ0ID09IGJ1ZmZlclNpemVcbiAgICAgICAgZnEuc3BsaWNlIDAsIGJ1ZmZlclNpemVcbiAgICAgICAgZnFTdGFydCA9IDBcblxuICAgIHJldHVyblxuXG4gICMgUnVuIHRoZSBjYWxsUXVldWUgZnVuY3Rpb24gYXN5bmNocm9ub3VzbHksIGFzIGZhc3QgYXMgcG9zc2libGVcbiAgY3FZaWVsZCA9IGRvIC0+XG4gICAgIyBUaGlzIGlzIHRoZSBmYXN0ZXN0IHdheSBicm93c2VycyBoYXZlIHRvIHlpZWxkIHByb2Nlc3NpbmdcbiAgICBpZiB0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPSBfdW5kZWZpbmVkU3RyaW5nXG4gICAgICAjIEZpcnN0LCBjcmVhdGUgYSBkaXYgbm90IGF0dGFjaGVkIHRvIERPTSB0byAnb2JzZXJ2ZSdcbiAgICAgIGRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuICAgICAgbW8gPSBuZXcgTXV0YXRpb25PYnNlcnZlciBjYWxsUXVldWVcbiAgICAgIG1vLm9ic2VydmUgZGQsIGF0dHJpYnV0ZXM6IHRydWVcblxuICAgICAgcmV0dXJuIC0+XG4gICAgICAgIGRkLnNldEF0dHJpYnV0ZSAnYScsIDBcbiAgICAgICAgcmV0dXJuXG5cbiAgICAjIElmIE5vIE11dGF0aW9uT2JzZXJ2ZXIgLSB0aGlzIGlzIHRoZSBuZXh0IGJlc3QgdGhpbmcgLSBoYW5kbGVzIE5vZGUgYW5kIE1TSUVcbiAgICBpZiB0eXBlb2Ygc2V0SW1tZWRpYXRlICE9IF91bmRlZmluZWRTdHJpbmdcbiAgICAgIHJldHVybiAtPlxuICAgICAgICBzZXRJbW1lZGlhdGUgY2FsbFF1ZXVlXG4gICAgICAgIHJldHVyblxuXG4gICAgIyBGaW5hbCBmYWxsYmFjayAtIHNob3VsZG4ndCBiZSB1c2VkIGZvciBtdWNoIGV4Y2VwdCB2ZXJ5IG9sZCBicm93c2Vyc1xuICAgIC0+XG4gICAgICBzZXRUaW1lb3V0IGNhbGxRdWV1ZSwgMFxuICAgICAgcmV0dXJuXG5cblxuICAjIFRoaXMgaXMgdGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBhc3NpZ25lZCB0byBzb29uIGl0IHRha2VzIHRoZSBmdW5jdGlvbiB0b1xuICAjIGNhbGwgYW5kIGV4YW1pbmVzIGFsbCBhcmd1bWVudHMuXG4gIChmbikgLT5cbiAgICAjIFB1c2ggdGhlIGZ1bmN0aW9uIGFuZCBhbnkgcmVtYWluaW5nIGFyZ3VtZW50cyBhbG9uZyB3aXRoIGNvbnRleHRcbiAgICBmcS5wdXNoIGZuXG5cbiAgICAjIFVwb24gYWRkaW5nIG91ciBmaXJzdCBlbnRyeSwga2ljayBvZmYgdGhlIGNhbGxiYWNrXG4gICAgaWYgZnEubGVuZ3RoIC0gZnFTdGFydCA9PSAxXG4gICAgICBjcVlpZWxkKClcbiAgICByZXR1cm5cblxuZXhwb3J0IGRlZmF1bHQgc29vblxuIiwiIyBMYXJnZWx5IGNvcGllZCBmcm9tIFpvdXNhbjogaHR0cHM6Ly9naXRodWIuY29tL2JsdWVqYXZhL3pvdXNhblxuaW1wb3J0IFByb21pc2VJbnNwZWN0aW9uIGZyb20gJy4vcHJvbWlzZS1pbnNwZWN0aW9uJ1xuaW1wb3J0IHNvb24gZnJvbSAnLi9zb29uJ1xuXG4jIExldCB0aGUgb2JmaXNjYXRvciBjb21wcmVzcyB0aGVzZSBkb3duIGJ5IGFzc2lnbmluZyB0aGVtIHRvIHZhcmlhYmxlc1xuX3VuZGVmaW5lZCAgICAgICA9IHVuZGVmaW5lZFxuX3VuZGVmaW5lZFN0cmluZyA9ICd1bmRlZmluZWQnXG5cbiMgVGhlc2UgYXJlIHRoZSB0aHJlZSBwb3NzaWJsZSBzdGF0ZXMgKFBFTkRJTkcgcmVtYWlucyB1bmRlZmluZWQgLSBhcyBpbnRlbmRlZClcbiMgYSBwcm9taXNlIGNhbiBiZSBpbi4gIFRoZSBzdGF0ZSBpcyBzdG9yZWQgaW4gdGhpcy5zdGF0ZSBhcyByZWFkLW9ubHlcblNUQVRFX1BFTkRJTkcgICA9IF91bmRlZmluZWRcblNUQVRFX0ZVTEZJTExFRCA9ICdmdWxmaWxsZWQnXG5TVEFURV9SRUpFQ1RFRCAgPSAncmVqZWN0ZWQnXG5cbnJlc29sdmVDbGllbnQgPSAoYywgYXJnKSAtPlxuICBpZiB0eXBlb2YgYy55ID09ICdmdW5jdGlvbidcbiAgICB0cnlcbiAgICAgIHlyZXQgPSBjLnkuY2FsbChfdW5kZWZpbmVkLCBhcmcpXG4gICAgICBjLnAucmVzb2x2ZSB5cmV0XG4gICAgY2F0Y2ggZXJyXG4gICAgICBjLnAucmVqZWN0IGVyclxuICBlbHNlXG4gICAgIyBwYXNzIHRoaXMgYWxvbmcuLi5cbiAgICBjLnAucmVzb2x2ZSBhcmdcbiAgcmV0dXJuXG5cbnJlamVjdENsaWVudCA9IChjLCByZWFzb24pIC0+XG4gIGlmIHR5cGVvZiBjLm4gPT0gJ2Z1bmN0aW9uJ1xuICAgIHRyeVxuICAgICAgeXJldCA9IGMubi5jYWxsKF91bmRlZmluZWQsIHJlYXNvbilcbiAgICAgIGMucC5yZXNvbHZlIHlyZXRcbiAgICBjYXRjaCBlcnJcbiAgICAgIGMucC5yZWplY3QgZXJyXG4gIGVsc2VcbiAgICAjIHBhc3MgdGhpcyBhbG9uZy4uLlxuICAgIGMucC5yZWplY3QgcmVhc29uXG4gIHJldHVyblxuXG5cbmNsYXNzIFByb21pc2VcbiAgY29uc3RydWN0b3I6IChmbikgLT5cbiAgICBpZiBmblxuICAgICAgZm4gKGFyZykgPT5cbiAgICAgICAgQHJlc29sdmUgYXJnXG4gICAgICAsIChhcmcpID0+XG4gICAgICAgIEByZWplY3QgYXJnXG5cbiAgcmVzb2x2ZTogKHZhbHVlKSAtPlxuICAgIGlmIEBzdGF0ZSAhPSBTVEFURV9QRU5ESU5HXG4gICAgICByZXR1cm5cblxuICAgIGlmIHZhbHVlID09IEBcbiAgICAgIHJldHVybiBAcmVqZWN0IG5ldyBUeXBlRXJyb3IgJ0F0dGVtcHQgdG8gcmVzb2x2ZSBwcm9taXNlIHdpdGggc2VsZidcblxuICAgIGlmIHZhbHVlIGFuZCAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicgb3IgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKVxuICAgICAgdHJ5XG4gICAgICAgICMgRmlyc3QgdGltZSB0aHJvdWdoP1xuICAgICAgICBmaXJzdCA9IHRydWVcbiAgICAgICAgbmV4dCA9IHZhbHVlLnRoZW5cblxuICAgICAgICBpZiB0eXBlb2YgbmV4dCA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgIyBBbmQgY2FsbCB0aGUgdmFsdWUudGhlbiAod2hpY2ggaXMgbm93IGluIFwidGhlblwiKSB3aXRoIHZhbHVlIGFzIHRoZVxuICAgICAgICAgICMgY29udGV4dCBhbmQgdGhlIHJlc29sdmUvcmVqZWN0IGZ1bmN0aW9ucyBwZXIgdGhlbmFibGUgc3BlY1xuICAgICAgICAgIG5leHQuY2FsbCB2YWx1ZSwgKHJhKSA9PlxuICAgICAgICAgICAgaWYgZmlyc3RcbiAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZSBpZiBmaXJzdFxuICAgICAgICAgICAgICBAcmVzb2x2ZSByYVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgLCAocnIpID0+XG4gICAgICAgICAgICBpZiBmaXJzdFxuICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgICAgICAgIEByZWplY3QgcnJcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIHJldHVyblxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIEByZWplY3QgZXJyIGlmIGZpcnN0XG4gICAgICAgIHJldHVyblxuXG4gICAgQHN0YXRlID0gU1RBVEVfRlVMRklMTEVEXG4gICAgQHYgICAgID0gdmFsdWVcblxuICAgIGlmIGNsaWVudHMgPSBAY1xuICAgICAgc29vbiA9PlxuICAgICAgICByZXNvbHZlQ2xpZW50IGMsIHZhbHVlIGZvciBjIGluIGNsaWVudHNcbiAgICAgICAgcmV0dXJuXG4gICAgcmV0dXJuXG5cbiAgcmVqZWN0OiAocmVhc29uKSAtPlxuICAgIHJldHVybiBpZiBAc3RhdGUgIT0gU1RBVEVfUEVORElOR1xuXG4gICAgQHN0YXRlID0gU1RBVEVfUkVKRUNURURcbiAgICBAdiAgICAgPSByZWFzb25cblxuICAgIGlmIGNsaWVudHMgPSBAY1xuICAgICAgc29vbiAtPlxuICAgICAgICByZWplY3RDbGllbnQgYywgcmVhc29uIGZvciBjIGluIGNsaWVudHNcbiAgICAgICAgcmV0dXJuXG4gICAgZWxzZSBpZiAhUHJvbWlzZS5zdXBwcmVzc1VuY2F1Z2h0UmVqZWN0aW9uRXJyb3IgYW5kIHR5cGVvZiBjb25zb2xlICE9ICd1bmRlZmluZWQnXG4gICAgICBjb25zb2xlLmxvZyAnQnJva2VuIFByb21pc2UsIHBsZWFzZSBjYXRjaCByZWplY3Rpb25zOiAnLCByZWFzb24sIGlmIHJlYXNvbiB0aGVuIHJlYXNvbi5zdGFjayBlbHNlIG51bGxcblxuICAgIHJldHVyblxuXG4gIHRoZW46IChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkgLT5cbiAgICBwID0gbmV3IFByb21pc2VcblxuICAgIGNsaWVudCA9XG4gICAgICB5OiBvbkZ1bGZpbGxlZFxuICAgICAgbjogb25SZWplY3RlZFxuICAgICAgcDogcFxuXG4gICAgaWYgQHN0YXRlID09IFNUQVRFX1BFTkRJTkdcbiAgICAgICMgV2UgYXJlIHBlbmRpbmcsIHNvIGNsaWVudCBtdXN0IHdhaXQgLSBzbyBwdXNoIGNsaWVudCB0byBlbmQgb2YgdGhpcy5jXG4gICAgICAjIGFycmF5IChjcmVhdGUgaWYgbmVjZXNzYXJ5IGZvciBlZmZpY2llbmN5KVxuICAgICAgaWYgQGNcbiAgICAgICAgQGMucHVzaCBjbGllbnRcbiAgICAgIGVsc2VcbiAgICAgICAgQGMgPSBbIGNsaWVudCBdXG4gICAgZWxzZVxuICAgICAgcyA9IEBzdGF0ZVxuICAgICAgYSA9IEB2XG4gICAgICBzb29uIC0+XG4gICAgICAgICMgV2UgYXJlIG5vdCBwZW5kaW5nLCBzbyB5aWVsZCBzY3JpcHQgYW5kIHJlc29sdmUvcmVqZWN0IGFzIG5lZWRlZFxuICAgICAgICBpZiBzID09IFNUQVRFX0ZVTEZJTExFRFxuICAgICAgICAgIHJlc29sdmVDbGllbnQgY2xpZW50LCBhXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZWplY3RDbGllbnQgY2xpZW50LCBhXG4gICAgICAgIHJldHVyblxuICAgIHBcblxuICBjYXRjaDogKGNmbikgLT5cbiAgICBAdGhlbiBudWxsLCBjZm5cblxuICBmaW5hbGx5OiAoY2ZuKSAtPlxuICAgIEB0aGVuIGNmbiwgY2ZuXG5cbiAgdGltZW91dDogKG1zLCBtc2cpIC0+XG4gICAgbXNnID0gbXNnIG9yICd0aW1lb3V0J1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgIyBUaGlzIHdpbGwgZmFpbCBzaWxlbnRseSBpZiBwcm9taXNlIGFscmVhZHkgcmVzb2x2ZWQgb3IgcmVqZWN0ZWRcbiAgICAgICAgcmVqZWN0IEVycm9yKG1zZylcbiAgICAgICwgbXNcblxuICAgICAgIyBUaGlzIHdpbGwgZmFpbCBzaWxlbnRseSBpZiBwcm9taXNlIGFscmVhZHkgdGltZWQgb3V0XG4gICAgICBAdGhlbiAodmFsKSAtPlxuICAgICAgICByZXNvbHZlIHZhbFxuICAgICAgICByZXR1cm5cbiAgICAgICwgKGVycikgLT5cbiAgICAgICAgcmVqZWN0IGVyclxuICAgICAgICByZXR1cm5cbiAgICAgIHJldHVyblxuXG4gIGNhbGxiYWNrOiAoY2IpIC0+XG4gICAgaWYgdHlwZW9mIGNiIGlzICdmdW5jdGlvbidcbiAgICAgIEB0aGVuICAodmFsKSAtPiBjYiBudWxsLCB2YWxcbiAgICAgIEBjYXRjaCAoZXJyKSAtPiBjYiBlcnIsIG51bGxcbiAgICBAXG5cbmV4cG9ydCBkZWZhdWx0IFByb21pc2VcbiIsImltcG9ydCBQcm9taXNlIGZyb20gJy4vcHJvbWlzZSdcbmltcG9ydCBQcm9taXNlSW5zcGVjdGlvbiBmcm9tICcuL3Byb21pc2UtaW5zcGVjdGlvbidcblxuZXhwb3J0IHJlc29sdmUgPSAodmFsKSAtPlxuICB6ID0gbmV3IFByb21pc2VcbiAgei5yZXNvbHZlIHZhbFxuICB6XG5cbmV4cG9ydCByZWplY3QgPSAoZXJyKSAtPlxuICB6ID0gbmV3IFByb21pc2VcbiAgei5yZWplY3QgZXJyXG4gIHpcblxuZXhwb3J0IGFsbCA9IChwcykgLT5cbiAgIyBTZXN1bHRzIGFuZCByZXNvbHZlZCBjb3VudFxuICByZXN1bHRzID0gW11cbiAgcmMgICAgICA9IDBcbiAgcmV0UCAgICA9IG5ldyBQcm9taXNlKClcblxuICByZXNvbHZlUHJvbWlzZSA9IChwLCBpKSAtPlxuICAgIGlmICFwIG9yIHR5cGVvZiBwLnRoZW4gIT0gJ2Z1bmN0aW9uJ1xuICAgICAgcCA9IHJlc29sdmUocClcblxuICAgIHAudGhlbiAoeXYpIC0+XG4gICAgICByZXN1bHRzW2ldID0geXZcbiAgICAgIHJjKytcbiAgICAgIGlmIHJjID09IHBzLmxlbmd0aFxuICAgICAgICByZXRQLnJlc29sdmUgcmVzdWx0c1xuICAgICAgcmV0dXJuXG5cbiAgICAsIChudikgLT5cbiAgICAgIHJldFAucmVqZWN0IG52XG4gICAgICByZXR1cm5cblxuICAgIHJldHVyblxuXG4gIHJlc29sdmVQcm9taXNlIHAsIGkgZm9yIHAsIGkgaW4gcHNcblxuICAjIEZvciB6ZXJvIGxlbmd0aCBhcnJheXMsIHJlc29sdmUgaW1tZWRpYXRlbHlcbiAgaWYgIXBzLmxlbmd0aFxuICAgIHJldFAucmVzb2x2ZSByZXN1bHRzXG5cbiAgcmV0UFxuXG5leHBvcnQgcmVmbGVjdCA9IChwcm9taXNlKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHByb21pc2VcbiAgICAgIC50aGVuICh2YWx1ZSkgLT5cbiAgICAgICAgcmVzb2x2ZSBuZXcgUHJvbWlzZUluc3BlY3Rpb25cbiAgICAgICAgICBzdGF0ZTogJ2Z1bGZpbGxlZCdcbiAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgIC5jYXRjaCAoZXJyKSAtPlxuICAgICAgICByZXNvbHZlIG5ldyBQcm9taXNlSW5zcGVjdGlvblxuICAgICAgICAgIHN0YXRlOiAncmVqZWN0ZWQnXG4gICAgICAgICAgcmVhc29uOiBlcnJcblxuZXhwb3J0IHNldHRsZSA9IChwcm9taXNlcykgLT5cbiAgYWxsIHByb21pc2VzLm1hcCByZWZsZWN0XG4iLCJpbXBvcnQgUHJvbWlzZUluc3BlY3Rpb24gZnJvbSAnLi9wcm9taXNlLWluc3BlY3Rpb24nXG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuL3Byb21pc2UnXG5pbXBvcnQgc29vbiBmcm9tICcuL3Nvb24nXG5pbXBvcnQge2FsbCwgcmVmbGVjdCwgcmVqZWN0LCByZXNvbHZlLCBzZXR0bGV9IGZyb20gJy4vaGVscGVycydcblxuUHJvbWlzZS5hbGwgPSBhbGxcblByb21pc2UucmVmbGVjdCA9IHJlZmxlY3RcblByb21pc2UucmVqZWN0ID0gcmVqZWN0XG5Qcm9taXNlLnJlc29sdmUgPSByZXNvbHZlXG5Qcm9taXNlLnNldHRsZSA9IHNldHRsZVxuUHJvbWlzZS5zb29uID0gc29vblxuXG5leHBvcnQgZGVmYXVsdCBQcm9taXNlXG4iLCJnZXRPd25TeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9sc1xuXG50b09iamVjdCA9ICh2YWwpIC0+XG4gIGlmIHZhbCA9PSBudWxsIG9yIHZhbCA9PSB1bmRlZmluZWRcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpXG4gIE9iamVjdCB2YWxcblxuc2hvdWxkVXNlTmF0aXZlID0gLT5cbiAgdHJ5XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBPYmplY3QuYXNzaWduXG5cbiAgICAjIERldGVjdCBidWdneSBwcm9wZXJ0eSBlbnVtZXJhdGlvbiBvcmRlciBpbiBvbGRlciBWOCB2ZXJzaW9ucy5cblxuICAgICMgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuICAgIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJylcbiAgICB0ZXN0MVs1XSA9ICdkZSdcbiAgICByZXR1cm4gZmFsc2UgaWYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09ICc1J1xuXG4gICAgIyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG4gICAgdGVzdDIgPSB7fVxuICAgIGZvciBpIGluIFswLi45XVxuICAgICAgdGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpXG4gICAgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcCAobikgLT4gdGVzdDJbbl1cbiAgICByZXR1cm4gZmFsc2UgaWYgb3JkZXIyLmpvaW4oJycpICE9ICcwMTIzNDU2Nzg5J1xuXG4gICAgIyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG4gICAgdGVzdDMgPSB7fVxuICAgIGZvciBsZXR0ZXIgaW4gJ2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJylcbiAgICAgIHRlc3QzW2xldHRlcl0gPSBsZXR0ZXJcbiAgICBpZiBPYmplY3Qua2V5cyhPYmplY3QuYXNzaWduKHt9LCB0ZXN0MykpLmpvaW4oJycpICE9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCdcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcbiAgY2F0Y2ggZXJyXG4gICAgIyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuICAgIGZhbHNlXG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdEFzc2lnbiA9IGRvIC0+XG4gIHJldHVybiBPYmplY3QuYXNzaWduIGlmIHNob3VsZFVzZU5hdGl2ZSgpXG5cbiAgKHRhcmdldCwgc291cmNlcy4uLikgLT5cbiAgICB0byA9IHRvT2JqZWN0IHRhcmdldFxuXG4gICAgZm9yIHNvdXJjZSBpbiBzb3VyY2VzXG4gICAgICBmcm9tID0gT2JqZWN0KHNvdXJjZSlcbiAgICAgIGZvciBrZXkgb2YgZnJvbVxuICAgICAgICBpZiBPYmplY3Q6Omhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KVxuICAgICAgICAgIHRvW2tleV0gPSBmcm9tW2tleV1cbiAgICAgIGlmIGdldE93blN5bWJvbHNcbiAgICAgICAgZm9yIHN5bWJvbCBpbiBnZXRPd25TeW1ib2xzKGZyb20pXG4gICAgICAgICAgaWYgT2JqZWN0Ojpwcm9wSXNFbnVtZXJhYmxlLmNhbGwgZnJvbSwgc3ltYm9sXG4gICAgICAgICAgICB0b1tzeW1ib2xdID0gZnJvbVtzeW1ib2xdXG4gICAgdG9cbiIsInRyaW0gPSAocykgLT5cbiAgcy5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG5cbmlzQXJyYXkgPSAob2JqKSAtPlxuICBPYmplY3Q6OnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nXG5cbmV4cG9ydCBkZWZhdWx0IHBhcnNlSGVhZGVycyA9IChoZWFkZXJzKSAtPlxuICByZXR1cm4ge30gdW5sZXNzIGhlYWRlcnNcblxuICByZXN1bHQgPSB7fVxuXG4gIGZvciByb3cgaW4gdHJpbShoZWFkZXJzKS5zcGxpdCgnXFxuJylcbiAgICBpbmRleCA9IHJvdy5pbmRleE9mKCc6JylcbiAgICBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICB2YWx1ZSA9IHRyaW0ocm93LnNsaWNlKGluZGV4ICsgMSkpXG4gICAgaWYgdHlwZW9mIHJlc3VsdFtrZXldID09ICd1bmRlZmluZWQnXG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgZWxzZSBpZiBpc0FycmF5KHJlc3VsdFtrZXldKVxuICAgICAgcmVzdWx0W2tleV0ucHVzaCB2YWx1ZVxuICAgIGVsc2VcbiAgICAgIHJlc3VsdFtrZXldID0gW1xuICAgICAgICByZXN1bHRba2V5XVxuICAgICAgICB2YWx1ZVxuICAgICAgXVxuICAgIHJldHVyblxuICByZXN1bHRcbiIsIiMjI1xuIyBDb3B5cmlnaHQgMjAxNSBTY290dCBCcmFkeVxuIyBNSVQgTGljZW5zZVxuIyBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRicmFkeS94aHItcHJvbWlzZS9ibG9iL21hc3Rlci9MSUNFTlNFXG4jIyNcblxuaW1wb3J0IFByb21pc2UgICAgICBmcm9tICdicm9rZW4nXG5pbXBvcnQgb2JqZWN0QXNzaWduIGZyb20gJ2VzLW9iamVjdC1hc3NpZ24nXG5pbXBvcnQgcGFyc2VIZWFkZXJzIGZyb20gJy4vcGFyc2UtaGVhZGVycydcblxuZGVmYXVsdHMgPVxuICBtZXRob2Q6ICAgJ0dFVCdcbiAgaGVhZGVyczogIHt9XG4gIGRhdGE6ICAgICBudWxsXG4gIHVzZXJuYW1lOiBudWxsXG4gIHBhc3N3b3JkOiBudWxsXG4gIGFzeW5jOiAgICB0cnVlXG5cbiMjI1xuIyBNb2R1bGUgdG8gd3JhcCBhbiBYaHJQcm9taXNlIGluIGEgcHJvbWlzZS5cbiMjI1xuY2xhc3MgWGhyUHJvbWlzZVxuXG4gIEBERUZBVUxUX0NPTlRFTlRfVFlQRTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCdcblxuICBAUHJvbWlzZTogUHJvbWlzZVxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMjIFB1YmxpYyBtZXRob2RzICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5zZW5kKG9wdGlvbnMpIC0+IFByb21pc2VcbiAgIyAtIG9wdGlvbnMgKE9iamVjdCk6IFVSTCwgbWV0aG9kLCBkYXRhLCBldGMuXG4gICNcbiAgIyBDcmVhdGUgdGhlIFhIUiBvYmplY3QgYW5kIHdpcmUgdXAgZXZlbnQgaGFuZGxlcnMgdG8gdXNlIGEgcHJvbWlzZS5cbiAgIyMjXG4gIHNlbmQ6IChvcHRpb25zID0ge30pIC0+XG4gICAgb3B0aW9ucyA9IG9iamVjdEFzc2lnbiB7fSwgZGVmYXVsdHMsIG9wdGlvbnNcblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICB1bmxlc3MgWE1MSHR0cFJlcXVlc3RcbiAgICAgICAgQF9oYW5kbGVFcnJvciAnYnJvd3NlcicsIHJlamVjdCwgbnVsbCwgXCJicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdFwiXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiB0eXBlb2Ygb3B0aW9ucy51cmwgaXNudCAnc3RyaW5nJyB8fCBvcHRpb25zLnVybC5sZW5ndGggaXMgMFxuICAgICAgICBAX2hhbmRsZUVycm9yICd1cmwnLCByZWplY3QsIG51bGwsICdVUkwgaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInXG4gICAgICAgIHJldHVyblxuXG4gICAgICAjIFhNTEh0dHBSZXF1ZXN0IGlzIHN1cHBvcnRlZCBieSBJRSA3K1xuICAgICAgQF94aHIgPSB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAjIHN1Y2Nlc3MgaGFuZGxlclxuICAgICAgeGhyLm9ubG9hZCA9ID0+XG4gICAgICAgIEBfZGV0YWNoV2luZG93VW5sb2FkKClcblxuICAgICAgICB0cnlcbiAgICAgICAgICByZXNwb25zZVRleHQgPSBAX2dldFJlc3BvbnNlVGV4dCgpXG4gICAgICAgIGNhdGNoXG4gICAgICAgICAgQF9oYW5kbGVFcnJvciAncGFyc2UnLCByZWplY3QsIG51bGwsICdpbnZhbGlkIEpTT04gcmVzcG9uc2UnXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmVzb2x2ZVxuICAgICAgICAgIHVybDogICAgICAgICAgQF9nZXRSZXNwb25zZVVybCgpXG4gICAgICAgICAgaGVhZGVyczogICAgICBAX2dldEhlYWRlcnMoKVxuICAgICAgICAgIHJlc3BvbnNlVGV4dDogcmVzcG9uc2VUZXh0XG4gICAgICAgICAgc3RhdHVzOiAgICAgICB4aHIuc3RhdHVzXG4gICAgICAgICAgc3RhdHVzVGV4dDogICB4aHIuc3RhdHVzVGV4dFxuICAgICAgICAgIHhocjogICAgICAgICAgeGhyXG5cbiAgICAgICMgZXJyb3IgaGFuZGxlcnNcbiAgICAgIHhoci5vbmVycm9yICAgPSA9PiBAX2hhbmRsZUVycm9yICdlcnJvcicsICAgcmVqZWN0XG4gICAgICB4aHIub250aW1lb3V0ID0gPT4gQF9oYW5kbGVFcnJvciAndGltZW91dCcsIHJlamVjdFxuICAgICAgeGhyLm9uYWJvcnQgICA9ID0+IEBfaGFuZGxlRXJyb3IgJ2Fib3J0JywgICByZWplY3RcblxuICAgICAgQF9hdHRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgICB4aHIub3BlbiBvcHRpb25zLm1ldGhvZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMuYXN5bmMsIG9wdGlvbnMudXNlcm5hbWUsIG9wdGlvbnMucGFzc3dvcmRcblxuICAgICAgaWYgb3B0aW9ucy5kYXRhPyAmJiAhb3B0aW9ucy5oZWFkZXJzWydDb250ZW50LVR5cGUnXVxuICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gQGNvbnN0cnVjdG9yLkRFRkFVTFRfQ09OVEVOVF9UWVBFXG5cbiAgICAgIGZvciBoZWFkZXIsIHZhbHVlIG9mIG9wdGlvbnMuaGVhZGVyc1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIHZhbHVlKVxuXG4gICAgICB0cnlcbiAgICAgICAgeGhyLnNlbmQob3B0aW9ucy5kYXRhKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICBAX2hhbmRsZUVycm9yICdzZW5kJywgcmVqZWN0LCBudWxsLCBlLnRvU3RyaW5nKClcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLmdldFhIUigpIC0+IFhoclByb21pc2VcbiAgIyMjXG4gIGdldFhIUjogLT4gQF94aHJcblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIyBQc3VlZG8tcHJpdmF0ZSBtZXRob2RzICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICMjI1xuICAjIFhoclByb21pc2UuX2F0dGFjaFdpbmRvd1VubG9hZCgpXG4gICNcbiAgIyBGaXggZm9yIElFIDkgYW5kIElFIDEwXG4gICMgSW50ZXJuZXQgRXhwbG9yZXIgZnJlZXplcyB3aGVuIHlvdSBjbG9zZSBhIHdlYnBhZ2UgZHVyaW5nIGFuIFhIUiByZXF1ZXN0XG4gICMgaHR0cHM6Ly9zdXBwb3J0Lm1pY3Jvc29mdC5jb20va2IvMjg1Njc0NlxuICAjXG4gICMjI1xuICBfYXR0YWNoV2luZG93VW5sb2FkOiAtPlxuICAgIEBfdW5sb2FkSGFuZGxlciA9IEBfaGFuZGxlV2luZG93VW5sb2FkLmJpbmQoQClcbiAgICB3aW5kb3cuYXR0YWNoRXZlbnQgJ29udW5sb2FkJywgQF91bmxvYWRIYW5kbGVyIGlmIHdpbmRvdy5hdHRhY2hFdmVudFxuXG4gICMjI1xuICAjIFhoclByb21pc2UuX2RldGFjaFdpbmRvd1VubG9hZCgpXG4gICMjI1xuICBfZGV0YWNoV2luZG93VW5sb2FkOiAtPlxuICAgIHdpbmRvdy5kZXRhY2hFdmVudCAnb251bmxvYWQnLCBAX3VubG9hZEhhbmRsZXIgaWYgd2luZG93LmRldGFjaEV2ZW50XG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fZ2V0SGVhZGVycygpIC0+IE9iamVjdFxuICAjIyNcbiAgX2dldEhlYWRlcnM6IC0+XG4gICAgcGFyc2VIZWFkZXJzIEBfeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fZ2V0UmVzcG9uc2VUZXh0KCkgLT4gTWl4ZWRcbiAgI1xuICAjIFBhcnNlcyByZXNwb25zZSB0ZXh0IEpTT04gaWYgcHJlc2VudC5cbiAgIyMjXG4gIF9nZXRSZXNwb25zZVRleHQ6IC0+XG4gICAgIyBBY2Nlc3NpbmcgYmluYXJ5LWRhdGEgcmVzcG9uc2VUZXh0IHRocm93cyBhbiBleGNlcHRpb24gaW4gSUU5XG4gICAgcmVzcG9uc2VUZXh0ID0gaWYgdHlwZW9mIEBfeGhyLnJlc3BvbnNlVGV4dCBpcyAnc3RyaW5nJyB0aGVuIEBfeGhyLnJlc3BvbnNlVGV4dCBlbHNlICcnXG5cbiAgICBzd2l0Y2ggQF94aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXG4gICAgICB3aGVuICdhcHBsaWNhdGlvbi9qc29uJywgJ3RleHQvamF2YXNjcmlwdCdcbiAgICAgICAgIyBXb3JrYXJvdW5kIEFuZHJvaWQgMi4zIGZhaWx1cmUgdG8gc3RyaW5nLWNhc3QgbnVsbCBpbnB1dFxuICAgICAgICByZXNwb25zZVRleHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCArICcnKVxuXG4gICAgcmVzcG9uc2VUZXh0XG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fZ2V0UmVzcG9uc2VVcmwoKSAtPiBTdHJpbmdcbiAgI1xuICAjIEFjdHVhbCByZXNwb25zZSBVUkwgYWZ0ZXIgZm9sbG93aW5nIHJlZGlyZWN0cy5cbiAgIyMjXG4gIF9nZXRSZXNwb25zZVVybDogLT5cbiAgICByZXR1cm4gQF94aHIucmVzcG9uc2VVUkwgaWYgQF94aHIucmVzcG9uc2VVUkw/XG5cbiAgICAjIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgIHJldHVybiBAX3hoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpIGlmIC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KEBfeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKVxuXG4gICAgJydcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9oYW5kbGVFcnJvcihyZWFzb24sIHJlamVjdCwgc3RhdHVzLCBzdGF0dXNUZXh0KVxuICAjIC0gcmVhc29uIChTdHJpbmcpXG4gICMgLSByZWplY3QgKEZ1bmN0aW9uKVxuICAjIC0gc3RhdHVzIChTdHJpbmcpXG4gICMgLSBzdGF0dXNUZXh0IChTdHJpbmcpXG4gICMjI1xuICBfaGFuZGxlRXJyb3I6IChyZWFzb24sIHJlamVjdCwgc3RhdHVzLCBzdGF0dXNUZXh0KSAtPlxuICAgIEBfZGV0YWNoV2luZG93VW5sb2FkKClcblxuICAgIHJlamVjdFxuICAgICAgcmVhc29uOiAgICAgcmVhc29uXG4gICAgICBzdGF0dXM6ICAgICBzdGF0dXMgICAgIG9yIEBfeGhyLnN0YXR1c1xuICAgICAgc3RhdHVzVGV4dDogc3RhdHVzVGV4dCBvciBAX3hoci5zdGF0dXNUZXh0XG4gICAgICB4aHI6ICAgICAgICBAX3hoclxuXG4gICMjI1xuICAjIFhoclByb21pc2UuX2hhbmRsZVdpbmRvd1VubG9hZCgpXG4gICMjI1xuICBfaGFuZGxlV2luZG93VW5sb2FkOiAtPlxuICAgIEBfeGhyLmFib3J0KClcblxuZXhwb3J0IGRlZmF1bHQgWGhyUHJvbWlzZVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKVxufVxuIiwiaW1wb3J0IHRvU3RyaW5nIGZyb20gJ2VzLXRvc3RyaW5nJ1xuXG4jIFRlc3QgaWYgYHZhbHVlYCBpcyBhIG51bWJlci5cbiNcbiMgQHBhcmFtIHtNaXhlZH0gdmFsdWUgdmFsdWUgdG8gdGVzdFxuIyBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGB2YWx1ZWAgaXMgYSBudW1iZXIsIGZhbHNlIG90aGVyd2lzZVxuIyBAYXBpIHB1YmxpY1xuZXhwb3J0IGRlZmF1bHQgaXNOdW1iZXIgPSAodmFsdWUpIC0+XG4gIHRvU3RyaW5nKHZhbHVlKSA9PSAnW29iamVjdCBOdW1iZXJdJ1xuIiwiZ2V0T3duU3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHNcblxudG9PYmplY3QgPSAodmFsKSAtPlxuICBpZiB2YWwgPT0gbnVsbCBvciB2YWwgPT0gdW5kZWZpbmVkXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKVxuICBPYmplY3QgdmFsXG5cbnNob3VsZFVzZU5hdGl2ZSA9IC0+XG4gIHRyeVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgT2JqZWN0LmFzc2lnblxuXG4gICAgIyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cbiAgICAjIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTQxMThcbiAgICB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpXG4gICAgdGVzdDFbNV0gPSAnZGUnXG4gICAgcmV0dXJuIGZhbHNlIGlmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PSAnNSdcblxuICAgICMgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuICAgIHRlc3QyID0ge31cbiAgICBmb3IgaSBpbiBbMC4uOV1cbiAgICAgIHRlc3QyWydfJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoaSldID0gaVxuICAgIG9yZGVyMiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QyKS5tYXAgKG4pIC0+IHRlc3QyW25dXG4gICAgcmV0dXJuIGZhbHNlIGlmIG9yZGVyMi5qb2luKCcnKSAhPSAnMDEyMzQ1Njc4OSdcblxuICAgICMgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuICAgIHRlc3QzID0ge31cbiAgICBmb3IgbGV0dGVyIGluICdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpXG4gICAgICB0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyXG4gICAgaWYgT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB0cnVlXG4gIGNhdGNoIGVyclxuICAgICMgV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cbiAgICBmYWxzZVxuXG5leHBvcnQgZGVmYXVsdCBvYmplY3RBc3NpZ24gPSBkbyAtPlxuICByZXR1cm4gT2JqZWN0LmFzc2lnbiBpZiBzaG91bGRVc2VOYXRpdmUoKVxuXG4gICh0YXJnZXQsIHNvdXJjZXMuLi4pIC0+XG4gICAgdG8gPSB0b09iamVjdCB0YXJnZXRcblxuICAgIGZvciBzb3VyY2UgaW4gc291cmNlc1xuICAgICAgZnJvbSA9IE9iamVjdChzb3VyY2UpXG4gICAgICBmb3Iga2V5IG9mIGZyb21cbiAgICAgICAgaWYgT2JqZWN0OjpoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSlcbiAgICAgICAgICB0b1trZXldID0gZnJvbVtrZXldXG4gICAgICBpZiBnZXRPd25TeW1ib2xzXG4gICAgICAgIGZvciBzeW1ib2wgaW4gZ2V0T3duU3ltYm9scyhmcm9tKVxuICAgICAgICAgIGlmIE9iamVjdDo6cHJvcElzRW51bWVyYWJsZS5jYWxsIGZyb20sIHN5bWJvbFxuICAgICAgICAgICAgdG9bc3ltYm9sXSA9IGZyb21bc3ltYm9sXVxuICAgIHRvXG4iLCJpbXBvcnQgaXNOdW1iZXIgICAgIGZyb20gJ2VzLWlzL251bWJlcidcbmltcG9ydCBvYmplY3RBc3NpZ24gZnJvbSAnZXMtb2JqZWN0LWFzc2lnbidcblxuXG5jbGFzcyBDb29raWVzXG4gIGNvbnN0cnVjdG9yOiAoQGRlZmF1bHRzID0ge30pIC0+XG4gICAgQGdldCAgICAgPSAoa2V5KSA9PiBAcmVhZCBrZXlcbiAgICBAZ2V0SlNPTiA9IChrZXkpID0+XG4gICAgICB0cnlcbiAgICAgICAgSlNPTi5wYXJzZSBAcmVhZCBrZXlcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICB7fVxuXG4gICAgQHJlbW92ZSA9IChrZXksIGF0dHJzKSAgICAgICAgPT4gQHdyaXRlIGtleSwgJycsIG9iamVjdEFzc2lnbiBleHBpcmVzOiAtMSwgYXR0cnNcbiAgICBAc2V0ICAgID0gKGtleSwgdmFsdWUsIGF0dHJzKSA9PiBAd3JpdGUga2V5LCB2YWx1ZSwgYXR0cnNcblxuICByZWFkOiAoa2V5KSAtPlxuICAgIHVubGVzcyBrZXlcbiAgICAgIHJlc3VsdCA9IHt9XG5cbiAgICAjIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXkgaW4gY2FzZVxuICAgICMgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlbiBjYWxsaW5nXG4gICAgIyBcImdldCgpXCJcbiAgICBjb29raWVzID0gaWYgZG9jdW1lbnQuY29va2llIHRoZW4gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIGVsc2UgW11cbiAgICByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nXG5cbiAgICBmb3Iga3YgaW4gY29va2llc1xuICAgICAgcGFydHMgID0ga3Yuc3BsaXQgJz0nXG4gICAgICBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luICc9J1xuXG4gICAgICBpZiBjb29raWUuY2hhckF0KDApID09ICdcIidcbiAgICAgICAgY29va2llID0gY29va2llLnNsaWNlIDEsIC0xXG5cbiAgICAgIHRyeVxuICAgICAgICBuYW1lICAgPSBwYXJ0c1swXS5yZXBsYWNlIHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudFxuICAgICAgICBjb29raWUgPSBjb29raWUucmVwbGFjZSAgIHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudFxuXG4gICAgICAgIGlmIGtleSA9PSBuYW1lXG4gICAgICAgICAgcmV0dXJuIGNvb2tpZVxuICAgICAgICB1bmxlc3Mga2V5XG4gICAgICAgICAgcmVzdWx0W25hbWVdID0gY29va2llXG5cbiAgICAgIGNhdGNoIGVyclxuXG4gICAgcmVzdWx0XG5cbiAgd3JpdGU6IChrZXksIHZhbHVlLCBhdHRycykgLT5cbiAgICBhdHRycyA9IG9iamVjdEFzc2lnbiBwYXRoOiAnLycsIEBkZWZhdWx0cywgYXR0cnNcblxuICAgIGlmIGlzTnVtYmVyIGF0dHJzLmV4cGlyZXNcbiAgICAgIGV4cGlyZXMgPSBuZXcgRGF0ZVxuICAgICAgZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMgZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJzLmV4cGlyZXMgKiA4NjRlKzVcbiAgICAgIGF0dHJzLmV4cGlyZXMgPSBleHBpcmVzXG5cbiAgICAjIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuICAgIGF0dHJzLmV4cGlyZXMgPSBpZiBhdHRycy5leHBpcmVzIHRoZW4gYXR0cnMuZXhwaXJlcy50b1VUQ1N0cmluZygpIGVsc2UgJydcblxuICAgIHRyeVxuICAgICAgcmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgICBpZiAvXltcXHtcXFtdLy50ZXN0KHJlc3VsdClcbiAgICAgICAgdmFsdWUgPSByZXN1bHRcbiAgICBjYXRjaCBlcnJcblxuICAgIHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpLnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudClcbiAgICBrZXkgICA9IGVuY29kZVVSSUNvbXBvbmVudCBTdHJpbmcga2V5XG4gICAga2V5ICAgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgIGtleSAgID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSlcblxuICAgIHN0ckF0dHJzID0gJydcblxuICAgIGZvciBuYW1lLCBhdHRyIG9mIGF0dHJzXG4gICAgICBjb250aW51ZSB1bmxlc3MgYXR0clxuICAgICAgc3RyQXR0cnMgKz0gJzsgJyArIG5hbWVcbiAgICAgIGNvbnRpbnVlIGlmIGF0dHIgPT0gdHJ1ZVxuICAgICAgc3RyQXR0cnMgKz0gJz0nICsgYXR0clxuXG4gICAgZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJBdHRyc1xuXG5cbmV4cG9ydCBkZWZhdWx0IENvb2tpZXNcbiIsImltcG9ydCBDb29raWVzIGZyb20gJy4vY29va2llcydcbmV4cG9ydCBkZWZhdWx0IG5ldyBDb29raWVzKClcbiIsImltcG9ydCBjb29raWVzIGZyb20gJ2VzLWNvb2tpZXMnXG5cbmltcG9ydCB7aXNGdW5jdGlvbiwgdXBkYXRlUXVlcnl9IGZyb20gJy4uL3V0aWxzJ1xuXG5cbmNsYXNzIENsaWVudFxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICBAb3B0cyA9XG4gICAgICBkZWJ1ZzogICAgZmFsc2VcbiAgICAgIGVuZHBvaW50OiAnaHR0cHM6Ly9hcGkuaGFuem8uaW8nXG4gICAgICBzZXNzaW9uOlxuICAgICAgICBuYW1lOiAgICAnaHpvJ1xuICAgICAgICBleHBpcmVzOiA3ICogMjQgKiAzNjAwICogMTAwMFxuXG4gICAgZm9yIGssdiBvZiBvcHRzXG4gICAgICBAb3B0c1trXSA9IHZcblxuICBnZXRLZXk6IC0+XG4gICAgQG9wdHMua2V5XG5cbiAgc2V0S2V5OiAoa2V5KSAtPlxuICAgIEBvcHRzLmtleSA9IGtleVxuXG4gIGdldEN1c3RvbWVyVG9rZW46IC0+XG4gICAgaWYgKHNlc3Npb24gPSBjb29raWVzLmdldEpTT04gQG9wdHMuc2Vzc2lvbi5uYW1lKT9cbiAgICAgIEBjdXN0b21lclRva2VuID0gc2Vzc2lvbi5jdXN0b21lclRva2VuIGlmIHNlc3Npb24uY3VzdG9tZXJUb2tlbj9cbiAgICBAY3VzdG9tZXJUb2tlblxuXG4gIHNldEN1c3RvbWVyVG9rZW46IChrZXkpIC0+XG4gICAgY29va2llcy5zZXQgQG9wdHMuc2Vzc2lvbi5uYW1lLCB7Y3VzdG9tZXJUb2tlbjoga2V5fSwgZXhwaXJlczogQG9wdHMuc2Vzc2lvbi5leHBpcmVzXG4gICAgQGN1c3RvbWVyVG9rZW4gPSBrZXlcblxuICBkZWxldGVDdXN0b21lclRva2VuOiAtPlxuICAgIGNvb2tpZXMuc2V0IEBvcHRzLnNlc3Npb24ubmFtZSwge2N1c3RvbWVyVG9rZW46IG51bGx9LCBleHBpcmVzOiBAb3B0cy5zZXNzaW9uLmV4cGlyZXNcbiAgICBAY3VzdG9tZXJUb2tlbiA9IG51bGxcblxuICB1cmw6ICh1cmwsIGRhdGEsIGtleSkgLT5cbiAgICBpZiBpc0Z1bmN0aW9uIHVybFxuICAgICAgdXJsID0gdXJsLmNhbGwgQCwgZGF0YVxuXG4gICAgdXBkYXRlUXVlcnkgKEBvcHRzLmVuZHBvaW50ICsgdXJsKSwgdG9rZW46IGtleVxuXG4gIGxvZzogKGFyZ3MuLi4pIC0+XG4gICAgYXJncy51bnNoaWZ0ICdoYW56by5qcz4nXG4gICAgaWYgQG9wdHMuZGVidWcgYW5kIGNvbnNvbGU/XG4gICAgICBjb25zb2xlLmxvZyBhcmdzLi4uXG5cbmV4cG9ydCBkZWZhdWx0IENsaWVudFxuIiwiaW1wb3J0IFhociBmcm9tICdlcy14aHItcHJvbWlzZSdcblxuaW1wb3J0IENsaWVudCAgICAgZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQge25ld0Vycm9yLCB1cGRhdGVRdWVyeX0gZnJvbSAnLi4vdXRpbHMnXG5cbmNsYXNzIEJyb3dzZXJDbGllbnQgZXh0ZW5kcyBDbGllbnRcbiAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgIHJldHVybiBuZXcgQnJvd3NlckNsaWVudCBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQnJvd3NlckNsaWVudFxuICAgIHN1cGVyIG9wdHNcbiAgICBAZ2V0Q3VzdG9tZXJUb2tlbigpXG5cbiAgcmVxdWVzdDogKGJsdWVwcmludCwgZGF0YT17fSwga2V5ID0gQGdldEtleSgpKSAtPlxuICAgIG9wdHMgPVxuICAgICAgdXJsOiAgICBAdXJsIGJsdWVwcmludC51cmwsIGRhdGEsIGtleVxuICAgICAgbWV0aG9kOiBibHVlcHJpbnQubWV0aG9kXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kICE9ICdHRVQnXG4gICAgICBvcHRzLmhlYWRlcnMgPVxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kID09ICdHRVQnXG4gICAgICBvcHRzLnVybCAgPSB1cGRhdGVRdWVyeSBvcHRzLnVybCwgZGF0YVxuICAgIGVsc2VcbiAgICAgIG9wdHMuZGF0YSA9IEpTT04uc3RyaW5naWZ5IGRhdGFcblxuICAgIEBsb2cgJ3JlcXVlc3QnLCBrZXk6IGtleSwgb3B0czogb3B0c1xuXG4gICAgKG5ldyBYaHIpLnNlbmQgb3B0c1xuICAgICAgLnRoZW4gKHJlcykgPT5cbiAgICAgICAgQGxvZyAncmVzcG9uc2UnLCByZXNcbiAgICAgICAgcmVzLmRhdGEgPSByZXMucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc1xuICAgICAgLmNhdGNoIChyZXMpID0+XG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlcy5kYXRhID0gcmVzLnJlc3BvbnNlVGV4dCA/IChKU09OLnBhcnNlIHJlcy54aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICBjYXRjaCBlcnJcblxuICAgICAgICBlcnIgPSBuZXdFcnJvciBkYXRhLCByZXMsIGVyclxuICAgICAgICBAbG9nICdyZXNwb25zZScsIHJlc1xuICAgICAgICBAbG9nICdlcnJvcicsIGVyclxuXG4gICAgICAgIHRocm93IGVyclxuXG5leHBvcnQgZGVmYXVsdCBCcm93c2VyQ2xpZW50XG4iLCJpbXBvcnQge2lzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJ1xuXG4jIFdyYXAgYSB1cmwgZnVuY3Rpb24gdG8gcHJvdmlkZSBzdG9yZS1wcmVmaXhlZCBVUkxzXG5leHBvcnQgc3RvcmVQcmVmaXhlZCA9IHNwID0gKHUpIC0+XG4gICh4KSAtPlxuICAgIGlmIGlzRnVuY3Rpb24gdVxuICAgICAgdXJsID0gdSB4XG4gICAgZWxzZVxuICAgICAgdXJsID0gdVxuXG4gICAgaWYgQHN0b3JlSWQ/XG4gICAgICBcIi9zdG9yZS8je0BzdG9yZUlkfVwiICsgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgUmV0dXJucyBhIFVSTCBmb3IgZ2V0dGluZyBhIHNpbmdsZVxuZXhwb3J0IGJ5SWQgPSAobmFtZSkgLT5cbiAgc3dpdGNoIG5hbWVcbiAgICB3aGVuICdjb3Vwb24nXG4gICAgICBzcCAoeCkgLT4gXCIvY291cG9uLyN7eC5jb2RlID8geH1cIlxuICAgIHdoZW4gJ2NvbGxlY3Rpb24nXG4gICAgICBzcCAoeCkgLT4gXCIvY29sbGVjdGlvbi8je3guc2x1ZyA/IHh9XCJcbiAgICB3aGVuICdwcm9kdWN0J1xuICAgICAgc3AgKHgpIC0+IFwiL3Byb2R1Y3QvI3t4LmlkID8geC5zbHVnID8geH1cIlxuICAgIHdoZW4gJ3ZhcmlhbnQnXG4gICAgICBzcCAoeCkgLT4gXCIvdmFyaWFudC8je3guaWQgPyB4LnNrdSA/IHh9XCJcbiAgICB3aGVuICdzaXRlJ1xuICAgICAgKHgpIC0+IFwiL3NpdGUvI3t4LmlkID8geC5uYW1lID8geH1cIlxuICAgIGVsc2VcbiAgICAgICh4KSAtPiBcIi8je25hbWV9LyN7eC5pZCA/IHh9XCJcbiIsImltcG9ydCB7XG4gIEdFVFxuICBQT1NUXG4gIFBBVENIXG4gIGlzRnVuY3Rpb25cbiAgc3RhdHVzQ3JlYXRlZFxuICBzdGF0dXNOb0NvbnRlbnRcbiAgc3RhdHVzT2tcbn0gZnJvbSAnLi4vdXRpbHMnXG5cbmltcG9ydCB7YnlJZCwgc3RvcmVQcmVmaXhlZH0gZnJvbSAnLi91cmwnXG5cbiMgT25seSBsaXN0LCBnZXQgbWV0aG9kcyBvZiBhIGZldyBtb2RlbHMgYXJlIHN1cHBvcnRlZCB3aXRoIGEgcHVibGlzaGFibGUga2V5LFxuIyBzbyBvbmx5IHRoZXNlIG1ldGhvZHMgYXJlIGV4cG9zZWQgaW4gdGhlIGJyb3dzZXIuXG5jcmVhdGVCbHVlcHJpbnQgPSAobmFtZSkgLT5cbiAgZW5kcG9pbnQgPSBcIi8je25hbWV9XCJcblxuICBsaXN0OlxuICAgIHVybDogICAgIGVuZHBvaW50XG4gICAgbWV0aG9kOiAgR0VUXG4gICAgZXhwZWN0czogc3RhdHVzT2tcbiAgZ2V0OlxuICAgIHVybDogICAgIGJ5SWQgbmFtZVxuICAgIG1ldGhvZDogIEdFVFxuICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbmJsdWVwcmludHMgPVxuICAjIEFDQ09VTlRcbiAgYWNjb3VudDpcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICBHRVRcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICB1cGRhdGU6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICBQQVRDSFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIGV4aXN0czpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2V4aXN0cy8je3guZW1haWwgPyB4LnVzZXJuYW1lID8geC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIEdFVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHByb2Nlc3M6IChyZXMpIC0+IHJlcy5kYXRhLmV4aXN0c1xuXG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L2NyZWF0ZSdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGVuYWJsZTpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2VuYWJsZS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBsb2dpbjpcbiAgICAgIHVybDogICAgICcvYWNjb3VudC9sb2dpbidcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICBwcm9jZXNzOiAocmVzKSAtPlxuICAgICAgICBAc2V0Q3VzdG9tZXJUb2tlbiByZXMuZGF0YS50b2tlblxuICAgICAgICByZXNcblxuICAgIGxvZ291dDogLT5cbiAgICAgIEBkZWxldGVDdXN0b21lclRva2VuKClcblxuICAgIHJlc2V0OlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L3Jlc2V0J1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIHVwZGF0ZU9yZGVyOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvb3JkZXIvI3t4Lm9yZGVySWQgPyB4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgUEFUQ0hcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICBjb25maXJtOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvY29uZmlybS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgIyBDQVJUXG4gIGNhcnQ6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgICcvY2FydCdcbiAgICAgIG1ldGhvZDogICBQT1NUXG4gICAgICBleHBlY3RzOiAgc3RhdHVzQ3JlYXRlZFxuICAgIHVwZGF0ZTpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAgUEFUQ0hcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuICAgIGRpc2NhcmQ6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH0vZGlzY2FyZFwiXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG4gICAgc2V0OlxuICAgICAgdXJsOiAgICAgICh4KSAtPiBcIi9jYXJ0LyN7eC5pZCA/IHh9L3NldFwiXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG5cbiAgIyBSRVZJRVdTXG4gIHJldmlldzpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAgJy9yZXZpZXcnXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c0NyZWF0ZWRcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAgKHgpLT4gXCIvcmV2aWV3LyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICBHRVRcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuXG4gICMgQ0hFQ0tPVVRcbiAgY2hlY2tvdXQ6XG4gICAgYXV0aG9yaXplOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAnL2NoZWNrb3V0L2F1dGhvcml6ZSdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjYXB0dXJlOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAoeCkgLT4gXCIvY2hlY2tvdXQvY2FwdHVyZS8je3gub3JkZXJJZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjaGFyZ2U6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvY2hhcmdlJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIHBheXBhbDpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgJy9jaGVja291dC9wYXlwYWwnXG4gICAgICBtZXRob2Q6ICBQT1NUXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICMgUkVGRVJSRVJcbiAgcmVmZXJyZXI6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9yZWZlcnJlcidcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGdldDpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9yZWZlcnJlci8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICBHRVRcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiMgTU9ERUxTXG5tb2RlbHMgPSBbXG4gICdjb2xsZWN0aW9uJ1xuICAnY291cG9uJ1xuICAncHJvZHVjdCdcbiAgJ3ZhcmlhbnQnXG5dXG5cbmZvciBtb2RlbCBpbiBtb2RlbHNcbiAgZG8gKG1vZGVsKSAtPlxuICAgIGJsdWVwcmludHNbbW9kZWxdID0gY3JlYXRlQmx1ZXByaW50IG1vZGVsXG5cbmV4cG9ydCBkZWZhdWx0IGJsdWVwcmludHNcbiIsImltcG9ydCBBcGkgICAgICAgIGZyb20gJy4vYXBpJ1xuaW1wb3J0IENsaWVudCAgICAgZnJvbSAnLi9jbGllbnQvYnJvd3NlcidcbmltcG9ydCBibHVlcHJpbnRzIGZyb20gJy4vYmx1ZXByaW50cy9icm93c2VyJ1xuXG5BcGkuQkxVRVBSSU5UUyA9IGJsdWVwcmludHNcbkFwaS5DTElFTlQgICAgID0gQ2xpZW50XG5cbkhhbnpvID0gKG9wdHMgPSB7fSkgLT5cbiAgb3B0cy5jbGllbnQgICAgID89IG5ldyBDbGllbnQgb3B0c1xuICBvcHRzLmJsdWVwcmludHMgPz0gYmx1ZXByaW50c1xuICBuZXcgQXBpIG9wdHNcblxuSGFuem8uQXBpICAgICAgICA9IEFwaVxuSGFuem8uQ2xpZW50ICAgICA9IENsaWVudFxuXG5leHBvcnQgZGVmYXVsdCBIYW56b1xuZXhwb3J0IHtBcGksIENsaWVudH1cbiJdLCJuYW1lcyI6WyJfdW5kZWZpbmVkIiwiX3VuZGVmaW5lZFN0cmluZyIsIlByb21pc2UiLCJzb29uIiwiUHJvbWlzZUluc3BlY3Rpb24iLCJpbmRleCIsIm9iamVjdEFzc2lnbiIsInBhcnNlSGVhZGVycyIsImdldE93blN5bWJvbHMiLCJzbGljZSIsInRvT2JqZWN0Iiwic2hvdWxkVXNlTmF0aXZlIiwiaXNOdW1iZXIiLCJDb29raWVzIiwiQ2xpZW50IiwiY29va2llcyIsIlhociIsIkFwaSIsImJsdWVwcmludHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxJQUFBOztBQUFBLEFBQUEsSUFBTyxVQUFQLEdBQW9CLFNBQUMsRUFBRDtTQUFRLE9BQU8sRUFBUCxLQUFhOzs7QUFDekMsQUFBQTs7QUFHQSxBQUFBLElBQU8sUUFBUCxHQUF5QixTQUFDLEdBQUQ7U0FBUyxHQUFHLENBQUMsTUFBSixLQUFjOzs7QUFDaEQsQUFBQSxJQUFPLGFBQVAsR0FBeUIsU0FBQyxHQUFEO1NBQVMsR0FBRyxDQUFDLE1BQUosS0FBYzs7O0FBQ2hELEFBQUE7O0FBR0EsQUFBQSxJQUFPLEdBQVAsR0FBZTs7QUFDZixBQUFBLElBQU8sSUFBUCxHQUFlOztBQUNmLEFBQUEsSUFBTyxLQUFQ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
