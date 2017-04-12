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
        return _this.write(key, '', index({
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
    attrs = index({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuem8uanMiLCJzb3VyY2VzIjpbInNyYy91dGlscy5jb2ZmZWUiLCJzcmMvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm9rZW4vc3JjL3Byb21pc2UtaW5zcGVjdGlvbi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJva2VuL3NyYy91dGlscy5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJva2VuL3NyYy9zb29uLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm9rZW4vc3JjL3Byb21pc2UuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb2tlbi9zcmMvaGVscGVycy5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJva2VuL3NyYy9pbmRleC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXMtb2JqZWN0LWFzc2lnbi9zcmMvaW5kZXguY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXhoci1wcm9taXNlL3NyYy9wYXJzZS1oZWFkZXJzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy14aHItcHJvbWlzZS9zcmMvaW5kZXguY29mZmVlIiwibm9kZV9tb2R1bGVzL2VzLXRvc3RyaW5nL2luZGV4Lm1qcyIsIm5vZGVfbW9kdWxlcy9lcy1pcy9zcmMvbnVtYmVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL3NyYy9jb29raWVzLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9lcy1jb29raWVzL3NyYy9pbmRleC5jb2ZmZWUiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiLCJzcmMvY2xpZW50L2Jyb3dzZXIuY29mZmVlIiwic3JjL2JsdWVwcmludHMvdXJsLmNvZmZlZSIsInNyYy9ibHVlcHJpbnRzL2Jyb3dzZXIuY29mZmVlIiwic3JjL2Jyb3dzZXIuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbIiMgSGVscGVyc1xuZXhwb3J0IGlzRnVuY3Rpb24gPSAoZm4pIC0+IHR5cGVvZiBmbiBpcyAnZnVuY3Rpb24nXG5leHBvcnQgaXNTdHJpbmcgICA9IChzKSAgLT4gdHlwZW9mIHMgIGlzICdzdHJpbmcnXG5cbiMgRmV3IHN0YXR1cyBjb2RlcyB3ZSB1c2UgdGhyb3VnaG91dCBjb2RlIGJhc2VcbmV4cG9ydCBzdGF0dXNPayAgICAgICAgPSAocmVzKSAtPiByZXMuc3RhdHVzIGlzIDIwMFxuZXhwb3J0IHN0YXR1c0NyZWF0ZWQgICA9IChyZXMpIC0+IHJlcy5zdGF0dXMgaXMgMjAxXG5leHBvcnQgc3RhdHVzTm9Db250ZW50ID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDRcblxuIyBBbGxvdyBtZXRob2QgbmFtZXMgdG8gYmUgbWluaWZpZWRcbmV4cG9ydCBHRVQgICA9ICdHRVQnXG5leHBvcnQgUE9TVCAgPSAnUE9TVCdcbmV4cG9ydCBQQVRDSCA9ICdQQVRDSCdcblxuIyBUaHJvdyBcImZhdFwiIGVycm9ycy5cbmV4cG9ydCBuZXdFcnJvciA9IChkYXRhLCByZXMgPSB7fSwgZXJyKSAtPlxuICBtZXNzYWdlID0gcmVzLmRhdGE/LmVycm9yPy5tZXNzYWdlID8gJ1JlcXVlc3QgZmFpbGVkJ1xuXG4gIHVubGVzcyBlcnI/XG4gICAgZXJyID0gbmV3IEVycm9yIG1lc3NhZ2VcblxuICBlcnIuZGF0YSAgICAgICAgID0gcmVzLmRhdGFcbiAgZXJyLm1zZyAgICAgICAgICA9IG1lc3NhZ2VcbiAgZXJyLnJlcSAgICAgICAgICA9IGRhdGFcbiAgZXJyLnJlc3BvbnNlVGV4dCA9IHJlcy5kYXRhXG4gIGVyci5zdGF0dXMgICAgICAgPSByZXMuc3RhdHVzXG4gIGVyci50eXBlICAgICAgICAgPSByZXMuZGF0YT8uZXJyb3I/LnR5cGVcbiAgZXJyXG5cbiMgVXBkYXRlIHBhcmFtIGluIHF1ZXJ5XG51cGRhdGVQYXJhbSA9ICh1cmwsIGtleSwgdmFsdWUpIC0+XG4gIHJlID0gbmV3IFJlZ0V4cCgnKFs/Jl0pJyArIGtleSArICc9Lio/KCZ8I3wkKSguKiknLCAnZ2knKVxuXG4gIGlmIHJlLnRlc3QgdXJsXG4gICAgaWYgdmFsdWU/XG4gICAgICB1cmwucmVwbGFjZSByZSwgJyQxJyArIGtleSArICc9JyArIHZhbHVlICsgJyQyJDMnXG4gICAgZWxzZVxuICAgICAgaGFzaCA9IHVybC5zcGxpdCAnIydcbiAgICAgIHVybCA9IGhhc2hbMF0ucmVwbGFjZShyZSwgJyQxJDMnKS5yZXBsYWNlKC8oJnxcXD8pJC8sICcnKVxuICAgICAgdXJsICs9ICcjJyArIGhhc2hbMV0gaWYgaGFzaFsxXT9cbiAgICAgIHVybFxuICBlbHNlXG4gICAgaWYgdmFsdWU/XG4gICAgICBzZXBhcmF0b3IgPSBpZiB1cmwuaW5kZXhPZignPycpICE9IC0xIHRoZW4gJyYnIGVsc2UgJz8nXG4gICAgICBoYXNoID0gdXJsLnNwbGl0ICcjJ1xuICAgICAgdXJsID0gaGFzaFswXSArIHNlcGFyYXRvciArIGtleSArICc9JyArIHZhbHVlXG4gICAgICB1cmwgKz0gJyMnICsgaGFzaFsxXSBpZiBoYXNoWzFdP1xuICAgICAgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgVXBkYXRlIHF1ZXJ5IG9uIHVybFxuZXhwb3J0IHVwZGF0ZVF1ZXJ5ID0gKHVybCwgZGF0YSkgLT5cbiAgcmV0dXJuIHVybCBpZiB0eXBlb2YgZGF0YSAhPSAnb2JqZWN0J1xuXG4gIGZvciBrLHYgb2YgZGF0YVxuICAgIHVybCA9IHVwZGF0ZVBhcmFtIHVybCwgaywgdlxuICB1cmxcbiIsImltcG9ydCB7R0VULCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgbmV3RXJyb3IsIHN0YXR1c09rfSBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBBcGlcbiAgQEJMVUVQUklOVFMgPSB7fVxuICBAQ0xJRU5UICAgICA9IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IEFwaSBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQXBpXG5cbiAgICB7Ymx1ZXByaW50cywgY2xpZW50fSA9IG9wdHNcblxuICAgIEBjbGllbnQgPSBjbGllbnQgb3IgbmV3IEBjb25zdHJ1Y3Rvci5DTElFTlQgb3B0c1xuXG4gICAgYmx1ZXByaW50cyA/PSBAY29uc3RydWN0b3IuQkxVRVBSSU5UU1xuICAgIEBhZGRCbHVlcHJpbnRzIGssIHYgZm9yIGssIHYgb2YgYmx1ZXByaW50c1xuXG4gIGFkZEJsdWVwcmludHM6IChhcGksIGJsdWVwcmludHMpIC0+XG4gICAgQFthcGldID89IHt9XG4gICAgZm9yIG5hbWUsIGJwIG9mIGJsdWVwcmludHNcbiAgICAgIEBhZGRCbHVlcHJpbnQgYXBpLCBuYW1lLCBicFxuICAgIHJldHVyblxuXG4gIGFkZEJsdWVwcmludDogKGFwaSwgbmFtZSwgYnApIC0+XG4gICAgIyBOb3JtYWwgbWV0aG9kXG4gICAgaWYgaXNGdW5jdGlvbiBicFxuICAgICAgcmV0dXJuIEBbYXBpXVtuYW1lXSA9ID0+IGJwLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICAgIyBCbHVlcHJpbnQgbWV0aG9kXG4gICAgYnAuZXhwZWN0cyA/PSBzdGF0dXNPa1xuICAgIGJwLm1ldGhvZCAgPz0gR0VUXG5cbiAgICBtZXRob2QgPSAoZGF0YSwgY2IpID0+XG4gICAgICBrZXkgPSB1bmRlZmluZWRcbiAgICAgIGlmIGJwLnVzZUN1c3RvbWVyVG9rZW5cbiAgICAgICAga2V5ID0gQGNsaWVudC5nZXRDdXN0b21lclRva2VuKClcbiAgICAgIEBjbGllbnQucmVxdWVzdCBicCwgZGF0YSwga2V5XG4gICAgICAgIC50aGVuIChyZXMpID0+XG4gICAgICAgICAgaWYgcmVzLmRhdGE/LmVycm9yP1xuICAgICAgICAgICAgdGhyb3cgbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgICAgdW5sZXNzIGJwLmV4cGVjdHMgcmVzXG4gICAgICAgICAgICB0aHJvdyBuZXdFcnJvciBkYXRhLCByZXNcbiAgICAgICAgICBpZiBicC5wcm9jZXNzP1xuICAgICAgICAgICAgYnAucHJvY2Vzcy5jYWxsIEAsIHJlc1xuICAgICAgICAgIHJlcy5kYXRhID8gcmVzLmJvZHlcbiAgICAgICAgLmNhbGxiYWNrIGNiXG5cbiAgICBAW2FwaV1bbmFtZV0gPSBtZXRob2RcblxuICBzZXRLZXk6IChrZXkpIC0+XG4gICAgQGNsaWVudC5zZXRLZXkga2V5XG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBAY2xpZW50LnNldEN1c3RvbWVyVG9rZW4ga2V5XG5cbiAgZGVsZXRlQ3VzdG9tZXJUb2tlbjogLT5cbiAgICBAY2xpZW50LmRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gIHNldFN0b3JlOiAoaWQpIC0+XG4gICAgQHN0b3JlSWQgPSBpZFxuICAgIEBjbGllbnQuc2V0U3RvcmUgaWRcblxuZXhwb3J0IGRlZmF1bHQgQXBpXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9taXNlSW5zcGVjdGlvblxuICBjb25zdHJ1Y3RvcjogKHtAc3RhdGUsIEB2YWx1ZSwgQHJlYXNvbn0pIC0+XG5cbiAgaXNGdWxmaWxsZWQ6IC0+XG4gICAgQHN0YXRlIGlzICdmdWxmaWxsZWQnXG5cbiAgaXNSZWplY3RlZDogLT5cbiAgICBAc3RhdGUgaXMgJ3JlamVjdGVkJ1xuIiwiIyBMZXQgdGhlIG9iZmlzY2F0b3IgY29tcHJlc3MgdGhlc2UgZG93biBieSBhc3NpZ25pbmcgdGhlbSB0byB2YXJpYWJsZXNcbmV4cG9ydCBfdW5kZWZpbmVkICAgICAgID0gdW5kZWZpbmVkXG5leHBvcnQgX3VuZGVmaW5lZFN0cmluZyA9ICd1bmRlZmluZWQnXG4iLCJpbXBvcnQge191bmRlZmluZWQsIF91bmRlZmluZWRTdHJpbmd9IGZyb20gJy4vdXRpbHMnXG5cbiMgU2VlIGh0dHA6Ly93d3cuYmx1ZWphdmEuY29tLzROUy9TcGVlZC11cC15b3VyLVdlYnNpdGVzLXdpdGgtYS1GYXN0ZXItc2V0VGltZW91dC11c2luZy1zb29uXG4jIFRoaXMgaXMgYSB2ZXJ5IGZhc3QgXCJhc3luY2hyb25vdXNcIiBmbG93IGNvbnRyb2wgLSBpLmUuIGl0IHlpZWxkcyB0aGUgdGhyZWFkXG4jIGFuZCBleGVjdXRlcyBsYXRlciwgYnV0IG5vdCBtdWNoIGxhdGVyLiBJdCBpcyBmYXIgZmFzdGVyIGFuZCBsaWdodGVyIHRoYW5cbiMgdXNpbmcgc2V0VGltZW91dChmbiwwKSBmb3IgeWllbGRpbmcgdGhyZWFkcy4gIEl0cyBhbHNvIGZhc3RlciB0aGFuIG90aGVyXG4jIHNldEltbWVkaWF0ZSBzaGltcywgYXMgaXQgdXNlcyBNdXRhdGlvbiBPYnNlcnZlciBhbmQgXCJtYWlubGluZXNcIiBzdWNjZXNzaXZlXG4jIGNhbGxzIGludGVybmFsbHkuXG4jXG4jIFdBUk5JTkc6IFRoaXMgZG9lcyBub3QgeWllbGQgdG8gdGhlIGJyb3dzZXIgVUkgbG9vcCwgc28gYnkgdXNpbmcgdGhpc1xuIyAgICAgICAgICByZXBlYXRlZGx5IHlvdSBjYW4gc3RhcnZlIHRoZSBVSSBhbmQgYmUgdW5yZXNwb25zaXZlIHRvIHRoZSB1c2VyLlxuI1xuIyBUaGlzIGlzIGFuIGV2ZW4gRkFTVEVSIHZlcnNpb24gb2YgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYmx1ZWphdmEvOWI5NTQyZDFkYTJhMTY0ZDA0NTZcbiMgdGhhdCBnaXZlcyB1cCBwYXNzaW5nIGNvbnRleHQgYW5kIGFyZ3VtZW50cywgaW4gZXhjaGFuZ2UgZm9yIGEgMjV4IHNwZWVkXG4jIGluY3JlYXNlLiAoVXNlIGFub24gZnVuY3Rpb24gdG8gcGFzcyBjb250ZXh0L2FyZ3MpXG5zb29uID0gZG8gLT5cbiAgIyBGdW5jdGlvbiBxdWV1ZVxuICBmcSAgICAgICAgID0gW11cblxuICAjIEF2b2lkIHVzaW5nIHNoaWZ0KCkgYnkgbWFpbnRhaW5pbmcgYSBzdGFydCBwb2ludGVyIC0gYW5kIHJlbW92ZSBpdGVtcyBpblxuICAjIGNodW5rcyBvZiAxMDI0IChidWZmZXJTaXplKVxuICBmcVN0YXJ0ICAgID0gMFxuICBidWZmZXJTaXplID0gMTAyNFxuXG4gIGNhbGxRdWV1ZSA9IC0+XG4gICAgIyBUaGlzIGFwcHJvYWNoIGFsbG93cyBuZXcgeWllbGRzIHRvIHBpbGUgb24gZHVyaW5nIHRoZSBleGVjdXRpb24gb2YgdGhlc2VcbiAgICB3aGlsZSBmcS5sZW5ndGggLSBmcVN0YXJ0XG4gICAgICB0cnlcbiAgICAgICAgIyBObyBjb250ZXh0IG9yIGFyZ3MuLi5cbiAgICAgICAgZnFbZnFTdGFydF0oKVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIHVubGVzcyB0eXBlb2YgY29uc29sZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyXG5cbiAgICAgICMgSW5jcmVhc2Ugc3RhcnQgcG9pbnRlciBhbmQgZGVyZWZlcmVuY2UgZnVuY3Rpb24ganVzdCBjYWxsZWRcbiAgICAgIGZxW2ZxU3RhcnQrK10gPSBfdW5kZWZpbmVkXG5cbiAgICAgIGlmIGZxU3RhcnQgPT0gYnVmZmVyU2l6ZVxuICAgICAgICBmcS5zcGxpY2UgMCwgYnVmZmVyU2l6ZVxuICAgICAgICBmcVN0YXJ0ID0gMFxuXG4gICAgcmV0dXJuXG5cbiAgIyBSdW4gdGhlIGNhbGxRdWV1ZSBmdW5jdGlvbiBhc3luY2hyb25vdXNseSwgYXMgZmFzdCBhcyBwb3NzaWJsZVxuICBjcVlpZWxkID0gZG8gLT5cbiAgICAjIFRoaXMgaXMgdGhlIGZhc3Rlc3Qgd2F5IGJyb3dzZXJzIGhhdmUgdG8geWllbGQgcHJvY2Vzc2luZ1xuICAgIGlmIHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9IF91bmRlZmluZWRTdHJpbmdcbiAgICAgICMgRmlyc3QsIGNyZWF0ZSBhIGRpdiBub3QgYXR0YWNoZWQgdG8gRE9NIHRvICdvYnNlcnZlJ1xuICAgICAgZGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgICBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyIGNhbGxRdWV1ZVxuICAgICAgbW8ub2JzZXJ2ZSBkZCwgYXR0cmlidXRlczogdHJ1ZVxuXG4gICAgICByZXR1cm4gLT5cbiAgICAgICAgZGQuc2V0QXR0cmlidXRlICdhJywgMFxuICAgICAgICByZXR1cm5cblxuICAgICMgSWYgTm8gTXV0YXRpb25PYnNlcnZlciAtIHRoaXMgaXMgdGhlIG5leHQgYmVzdCB0aGluZyAtIGhhbmRsZXMgTm9kZSBhbmQgTVNJRVxuICAgIGlmIHR5cGVvZiBzZXRJbW1lZGlhdGUgIT0gX3VuZGVmaW5lZFN0cmluZ1xuICAgICAgcmV0dXJuIC0+XG4gICAgICAgIHNldEltbWVkaWF0ZSBjYWxsUXVldWVcbiAgICAgICAgcmV0dXJuXG5cbiAgICAjIEZpbmFsIGZhbGxiYWNrIC0gc2hvdWxkbid0IGJlIHVzZWQgZm9yIG11Y2ggZXhjZXB0IHZlcnkgb2xkIGJyb3dzZXJzXG4gICAgLT5cbiAgICAgIHNldFRpbWVvdXQgY2FsbFF1ZXVlLCAwXG4gICAgICByZXR1cm5cblxuXG4gICMgVGhpcyBpcyB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGFzc2lnbmVkIHRvIHNvb24gaXQgdGFrZXMgdGhlIGZ1bmN0aW9uIHRvXG4gICMgY2FsbCBhbmQgZXhhbWluZXMgYWxsIGFyZ3VtZW50cy5cbiAgKGZuKSAtPlxuICAgICMgUHVzaCB0aGUgZnVuY3Rpb24gYW5kIGFueSByZW1haW5pbmcgYXJndW1lbnRzIGFsb25nIHdpdGggY29udGV4dFxuICAgIGZxLnB1c2ggZm5cblxuICAgICMgVXBvbiBhZGRpbmcgb3VyIGZpcnN0IGVudHJ5LCBraWNrIG9mZiB0aGUgY2FsbGJhY2tcbiAgICBpZiBmcS5sZW5ndGggLSBmcVN0YXJ0ID09IDFcbiAgICAgIGNxWWllbGQoKVxuICAgIHJldHVyblxuXG5leHBvcnQgZGVmYXVsdCBzb29uXG4iLCIjIExhcmdlbHkgY29waWVkIGZyb20gWm91c2FuOiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWphdmEvem91c2FuXG5pbXBvcnQgUHJvbWlzZUluc3BlY3Rpb24gZnJvbSAnLi9wcm9taXNlLWluc3BlY3Rpb24nXG5pbXBvcnQgc29vbiBmcm9tICcuL3Nvb24nXG5cbiMgTGV0IHRoZSBvYmZpc2NhdG9yIGNvbXByZXNzIHRoZXNlIGRvd24gYnkgYXNzaWduaW5nIHRoZW0gdG8gdmFyaWFibGVzXG5fdW5kZWZpbmVkICAgICAgID0gdW5kZWZpbmVkXG5fdW5kZWZpbmVkU3RyaW5nID0gJ3VuZGVmaW5lZCdcblxuIyBUaGVzZSBhcmUgdGhlIHRocmVlIHBvc3NpYmxlIHN0YXRlcyAoUEVORElORyByZW1haW5zIHVuZGVmaW5lZCAtIGFzIGludGVuZGVkKVxuIyBhIHByb21pc2UgY2FuIGJlIGluLiAgVGhlIHN0YXRlIGlzIHN0b3JlZCBpbiB0aGlzLnN0YXRlIGFzIHJlYWQtb25seVxuU1RBVEVfUEVORElORyAgID0gX3VuZGVmaW5lZFxuU1RBVEVfRlVMRklMTEVEID0gJ2Z1bGZpbGxlZCdcblNUQVRFX1JFSkVDVEVEICA9ICdyZWplY3RlZCdcblxucmVzb2x2ZUNsaWVudCA9IChjLCBhcmcpIC0+XG4gIGlmIHR5cGVvZiBjLnkgPT0gJ2Z1bmN0aW9uJ1xuICAgIHRyeVxuICAgICAgeXJldCA9IGMueS5jYWxsKF91bmRlZmluZWQsIGFyZylcbiAgICAgIGMucC5yZXNvbHZlIHlyZXRcbiAgICBjYXRjaCBlcnJcbiAgICAgIGMucC5yZWplY3QgZXJyXG4gIGVsc2VcbiAgICAjIHBhc3MgdGhpcyBhbG9uZy4uLlxuICAgIGMucC5yZXNvbHZlIGFyZ1xuICByZXR1cm5cblxucmVqZWN0Q2xpZW50ID0gKGMsIHJlYXNvbikgLT5cbiAgaWYgdHlwZW9mIGMubiA9PSAnZnVuY3Rpb24nXG4gICAgdHJ5XG4gICAgICB5cmV0ID0gYy5uLmNhbGwoX3VuZGVmaW5lZCwgcmVhc29uKVxuICAgICAgYy5wLnJlc29sdmUgeXJldFxuICAgIGNhdGNoIGVyclxuICAgICAgYy5wLnJlamVjdCBlcnJcbiAgZWxzZVxuICAgICMgcGFzcyB0aGlzIGFsb25nLi4uXG4gICAgYy5wLnJlamVjdCByZWFzb25cbiAgcmV0dXJuXG5cblxuY2xhc3MgUHJvbWlzZVxuICBjb25zdHJ1Y3RvcjogKGZuKSAtPlxuICAgIGlmIGZuXG4gICAgICBmbiAoYXJnKSA9PlxuICAgICAgICBAcmVzb2x2ZSBhcmdcbiAgICAgICwgKGFyZykgPT5cbiAgICAgICAgQHJlamVjdCBhcmdcblxuICByZXNvbHZlOiAodmFsdWUpIC0+XG4gICAgaWYgQHN0YXRlICE9IFNUQVRFX1BFTkRJTkdcbiAgICAgIHJldHVyblxuXG4gICAgaWYgdmFsdWUgPT0gQFxuICAgICAgcmV0dXJuIEByZWplY3QgbmV3IFR5cGVFcnJvciAnQXR0ZW1wdCB0byByZXNvbHZlIHByb21pc2Ugd2l0aCBzZWxmJ1xuXG4gICAgaWYgdmFsdWUgYW5kICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyBvciB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpXG4gICAgICB0cnlcbiAgICAgICAgIyBGaXJzdCB0aW1lIHRocm91Z2g/XG4gICAgICAgIGZpcnN0ID0gdHJ1ZVxuICAgICAgICBuZXh0ID0gdmFsdWUudGhlblxuXG4gICAgICAgIGlmIHR5cGVvZiBuZXh0ID09ICdmdW5jdGlvbidcbiAgICAgICAgICAjIEFuZCBjYWxsIHRoZSB2YWx1ZS50aGVuICh3aGljaCBpcyBub3cgaW4gXCJ0aGVuXCIpIHdpdGggdmFsdWUgYXMgdGhlXG4gICAgICAgICAgIyBjb250ZXh0IGFuZCB0aGUgcmVzb2x2ZS9yZWplY3QgZnVuY3Rpb25zIHBlciB0aGVuYWJsZSBzcGVjXG4gICAgICAgICAgbmV4dC5jYWxsIHZhbHVlLCAocmEpID0+XG4gICAgICAgICAgICBpZiBmaXJzdFxuICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlIGlmIGZpcnN0XG4gICAgICAgICAgICAgIEByZXNvbHZlIHJhXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAsIChycikgPT5cbiAgICAgICAgICAgIGlmIGZpcnN0XG4gICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgICAgICAgQHJlamVjdCByclxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgcmV0dXJuXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgQHJlamVjdCBlcnIgaWYgZmlyc3RcbiAgICAgICAgcmV0dXJuXG5cbiAgICBAc3RhdGUgPSBTVEFURV9GVUxGSUxMRURcbiAgICBAdiAgICAgPSB2YWx1ZVxuXG4gICAgaWYgY2xpZW50cyA9IEBjXG4gICAgICBzb29uID0+XG4gICAgICAgIHJlc29sdmVDbGllbnQgYywgdmFsdWUgZm9yIGMgaW4gY2xpZW50c1xuICAgICAgICByZXR1cm5cbiAgICByZXR1cm5cblxuICByZWplY3Q6IChyZWFzb24pIC0+XG4gICAgcmV0dXJuIGlmIEBzdGF0ZSAhPSBTVEFURV9QRU5ESU5HXG5cbiAgICBAc3RhdGUgPSBTVEFURV9SRUpFQ1RFRFxuICAgIEB2ICAgICA9IHJlYXNvblxuXG4gICAgaWYgY2xpZW50cyA9IEBjXG4gICAgICBzb29uIC0+XG4gICAgICAgIHJlamVjdENsaWVudCBjLCByZWFzb24gZm9yIGMgaW4gY2xpZW50c1xuICAgICAgICByZXR1cm5cbiAgICBlbHNlIGlmICFQcm9taXNlLnN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciBhbmQgdHlwZW9mIGNvbnNvbGUgIT0gJ3VuZGVmaW5lZCdcbiAgICAgIGNvbnNvbGUubG9nICdCcm9rZW4gUHJvbWlzZSwgcGxlYXNlIGNhdGNoIHJlamVjdGlvbnM6ICcsIHJlYXNvbiwgaWYgcmVhc29uIHRoZW4gcmVhc29uLnN0YWNrIGVsc2UgbnVsbFxuXG4gICAgcmV0dXJuXG5cbiAgdGhlbjogKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSAtPlxuICAgIHAgPSBuZXcgUHJvbWlzZVxuXG4gICAgY2xpZW50ID1cbiAgICAgIHk6IG9uRnVsZmlsbGVkXG4gICAgICBuOiBvblJlamVjdGVkXG4gICAgICBwOiBwXG5cbiAgICBpZiBAc3RhdGUgPT0gU1RBVEVfUEVORElOR1xuICAgICAgIyBXZSBhcmUgcGVuZGluZywgc28gY2xpZW50IG11c3Qgd2FpdCAtIHNvIHB1c2ggY2xpZW50IHRvIGVuZCBvZiB0aGlzLmNcbiAgICAgICMgYXJyYXkgKGNyZWF0ZSBpZiBuZWNlc3NhcnkgZm9yIGVmZmljaWVuY3kpXG4gICAgICBpZiBAY1xuICAgICAgICBAYy5wdXNoIGNsaWVudFxuICAgICAgZWxzZVxuICAgICAgICBAYyA9IFsgY2xpZW50IF1cbiAgICBlbHNlXG4gICAgICBzID0gQHN0YXRlXG4gICAgICBhID0gQHZcbiAgICAgIHNvb24gLT5cbiAgICAgICAgIyBXZSBhcmUgbm90IHBlbmRpbmcsIHNvIHlpZWxkIHNjcmlwdCBhbmQgcmVzb2x2ZS9yZWplY3QgYXMgbmVlZGVkXG4gICAgICAgIGlmIHMgPT0gU1RBVEVfRlVMRklMTEVEXG4gICAgICAgICAgcmVzb2x2ZUNsaWVudCBjbGllbnQsIGFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlamVjdENsaWVudCBjbGllbnQsIGFcbiAgICAgICAgcmV0dXJuXG4gICAgcFxuXG4gIGNhdGNoOiAoY2ZuKSAtPlxuICAgIEB0aGVuIG51bGwsIGNmblxuXG4gIGZpbmFsbHk6IChjZm4pIC0+XG4gICAgQHRoZW4gY2ZuLCBjZm5cblxuICB0aW1lb3V0OiAobXMsIG1zZykgLT5cbiAgICBtc2cgPSBtc2cgb3IgJ3RpbWVvdXQnXG5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAjIFRoaXMgd2lsbCBmYWlsIHNpbGVudGx5IGlmIHByb21pc2UgYWxyZWFkeSByZXNvbHZlZCBvciByZWplY3RlZFxuICAgICAgICByZWplY3QgRXJyb3IobXNnKVxuICAgICAgLCBtc1xuXG4gICAgICAjIFRoaXMgd2lsbCBmYWlsIHNpbGVudGx5IGlmIHByb21pc2UgYWxyZWFkeSB0aW1lZCBvdXRcbiAgICAgIEB0aGVuICh2YWwpIC0+XG4gICAgICAgIHJlc29sdmUgdmFsXG4gICAgICAgIHJldHVyblxuICAgICAgLCAoZXJyKSAtPlxuICAgICAgICByZWplY3QgZXJyXG4gICAgICAgIHJldHVyblxuICAgICAgcmV0dXJuXG5cbiAgY2FsbGJhY2s6IChjYikgLT5cbiAgICBpZiB0eXBlb2YgY2IgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgQHRoZW4gICh2YWwpIC0+IGNiIG51bGwsIHZhbFxuICAgICAgQGNhdGNoIChlcnIpIC0+IGNiIGVyciwgbnVsbFxuICAgIEBcblxuZXhwb3J0IGRlZmF1bHQgUHJvbWlzZVxuIiwiaW1wb3J0IFByb21pc2UgZnJvbSAnLi9wcm9taXNlJ1xuaW1wb3J0IFByb21pc2VJbnNwZWN0aW9uIGZyb20gJy4vcHJvbWlzZS1pbnNwZWN0aW9uJ1xuXG5leHBvcnQgcmVzb2x2ZSA9ICh2YWwpIC0+XG4gIHogPSBuZXcgUHJvbWlzZVxuICB6LnJlc29sdmUgdmFsXG4gIHpcblxuZXhwb3J0IHJlamVjdCA9IChlcnIpIC0+XG4gIHogPSBuZXcgUHJvbWlzZVxuICB6LnJlamVjdCBlcnJcbiAgelxuXG5leHBvcnQgYWxsID0gKHBzKSAtPlxuICAjIFNlc3VsdHMgYW5kIHJlc29sdmVkIGNvdW50XG4gIHJlc3VsdHMgPSBbXVxuICByYyAgICAgID0gMFxuICByZXRQICAgID0gbmV3IFByb21pc2UoKVxuXG4gIHJlc29sdmVQcm9taXNlID0gKHAsIGkpIC0+XG4gICAgaWYgIXAgb3IgdHlwZW9mIHAudGhlbiAhPSAnZnVuY3Rpb24nXG4gICAgICBwID0gcmVzb2x2ZShwKVxuXG4gICAgcC50aGVuICh5dikgLT5cbiAgICAgIHJlc3VsdHNbaV0gPSB5dlxuICAgICAgcmMrK1xuICAgICAgaWYgcmMgPT0gcHMubGVuZ3RoXG4gICAgICAgIHJldFAucmVzb2x2ZSByZXN1bHRzXG4gICAgICByZXR1cm5cblxuICAgICwgKG52KSAtPlxuICAgICAgcmV0UC5yZWplY3QgbnZcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuXG5cbiAgcmVzb2x2ZVByb21pc2UgcCwgaSBmb3IgcCwgaSBpbiBwc1xuXG4gICMgRm9yIHplcm8gbGVuZ3RoIGFycmF5cywgcmVzb2x2ZSBpbW1lZGlhdGVseVxuICBpZiAhcHMubGVuZ3RoXG4gICAgcmV0UC5yZXNvbHZlIHJlc3VsdHNcblxuICByZXRQXG5cbmV4cG9ydCByZWZsZWN0ID0gKHByb21pc2UpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgcHJvbWlzZVxuICAgICAgLnRoZW4gKHZhbHVlKSAtPlxuICAgICAgICByZXNvbHZlIG5ldyBQcm9taXNlSW5zcGVjdGlvblxuICAgICAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJ1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgLmNhdGNoIChlcnIpIC0+XG4gICAgICAgIHJlc29sdmUgbmV3IFByb21pc2VJbnNwZWN0aW9uXG4gICAgICAgICAgc3RhdGU6ICdyZWplY3RlZCdcbiAgICAgICAgICByZWFzb246IGVyclxuXG5leHBvcnQgc2V0dGxlID0gKHByb21pc2VzKSAtPlxuICBhbGwgcHJvbWlzZXMubWFwIHJlZmxlY3RcbiIsImltcG9ydCBQcm9taXNlSW5zcGVjdGlvbiBmcm9tICcuL3Byb21pc2UtaW5zcGVjdGlvbidcbmltcG9ydCBQcm9taXNlIGZyb20gJy4vcHJvbWlzZSdcbmltcG9ydCBzb29uIGZyb20gJy4vc29vbidcbmltcG9ydCB7YWxsLCByZWZsZWN0LCByZWplY3QsIHJlc29sdmUsIHNldHRsZX0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5Qcm9taXNlLmFsbCA9IGFsbFxuUHJvbWlzZS5yZWZsZWN0ID0gcmVmbGVjdFxuUHJvbWlzZS5yZWplY3QgPSByZWplY3RcblByb21pc2UucmVzb2x2ZSA9IHJlc29sdmVcblByb21pc2Uuc2V0dGxlID0gc2V0dGxlXG5Qcm9taXNlLnNvb24gPSBzb29uXG5cbmV4cG9ydCBkZWZhdWx0IFByb21pc2VcbiIsImdldE93blN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzXG5cbnRvT2JqZWN0ID0gKHZhbCkgLT5cbiAgaWYgdmFsID09IG51bGwgb3IgdmFsID09IHVuZGVmaW5lZFxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgT2JqZWN0IHZhbFxuXG5zaG91bGRVc2VOYXRpdmUgPSAtPlxuICB0cnlcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIE9iamVjdC5hc3NpZ25cblxuICAgICMgRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG4gICAgIyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG4gICAgdGVzdDEgPSBuZXcgU3RyaW5nKCdhYmMnKVxuICAgIHRlc3QxWzVdID0gJ2RlJ1xuICAgIHJldHVybiBmYWxzZSBpZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF0gPT0gJzUnXG5cbiAgICAjIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcbiAgICB0ZXN0MiA9IHt9XG4gICAgZm9yIGkgaW4gWzAuLjldXG4gICAgICB0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGlcbiAgICBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwIChuKSAtPiB0ZXN0MltuXVxuICAgIHJldHVybiBmYWxzZSBpZiBvcmRlcjIuam9pbignJykgIT0gJzAxMjM0NTY3ODknXG5cbiAgICAjIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcbiAgICB0ZXN0MyA9IHt9XG4gICAgZm9yIGxldHRlciBpbiAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKVxuICAgICAgdGVzdDNbbGV0dGVyXSA9IGxldHRlclxuICAgIGlmIE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0J1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuICBjYXRjaCBlcnJcbiAgICAjIFdlIGRvbid0IGV4cGVjdCBhbnkgb2YgdGhlIGFib3ZlIHRvIHRocm93LCBidXQgYmV0dGVyIHRvIGJlIHNhZmUuXG4gICAgZmFsc2VcblxuZXhwb3J0IGRlZmF1bHQgb2JqZWN0QXNzaWduID0gZG8gLT5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24gaWYgc2hvdWxkVXNlTmF0aXZlKClcblxuICAodGFyZ2V0LCBzb3VyY2VzLi4uKSAtPlxuICAgIHRvID0gdG9PYmplY3QgdGFyZ2V0XG5cbiAgICBmb3Igc291cmNlIGluIHNvdXJjZXNcbiAgICAgIGZyb20gPSBPYmplY3Qoc291cmNlKVxuICAgICAgZm9yIGtleSBvZiBmcm9tXG4gICAgICAgIGlmIE9iamVjdDo6aGFzT3duUHJvcGVydHkuY2FsbChmcm9tLCBrZXkpXG4gICAgICAgICAgdG9ba2V5XSA9IGZyb21ba2V5XVxuICAgICAgaWYgZ2V0T3duU3ltYm9sc1xuICAgICAgICBmb3Igc3ltYm9sIGluIGdldE93blN5bWJvbHMoZnJvbSlcbiAgICAgICAgICBpZiBPYmplY3Q6OnByb3BJc0VudW1lcmFibGUuY2FsbCBmcm9tLCBzeW1ib2xcbiAgICAgICAgICAgIHRvW3N5bWJvbF0gPSBmcm9tW3N5bWJvbF1cbiAgICB0b1xuIiwidHJpbSA9IChzKSAtPlxuICBzLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcblxuaXNBcnJheSA9IChvYmopIC0+XG4gIE9iamVjdDo6dG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSdcblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VIZWFkZXJzID0gKGhlYWRlcnMpIC0+XG4gIHJldHVybiB7fSB1bmxlc3MgaGVhZGVyc1xuXG4gIHJlc3VsdCA9IHt9XG5cbiAgZm9yIHJvdyBpbiB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgIGluZGV4ID0gcm93LmluZGV4T2YoJzonKVxuICAgIGtleSA9IHRyaW0ocm93LnNsaWNlKDAsIGluZGV4KSkudG9Mb3dlckNhc2UoKVxuICAgIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcbiAgICBpZiB0eXBlb2YgcmVzdWx0W2tleV0gPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVcbiAgICBlbHNlIGlmIGlzQXJyYXkocmVzdWx0W2tleV0pXG4gICAgICByZXN1bHRba2V5XS5wdXNoIHZhbHVlXG4gICAgZWxzZVxuICAgICAgcmVzdWx0W2tleV0gPSBbXG4gICAgICAgIHJlc3VsdFtrZXldXG4gICAgICAgIHZhbHVlXG4gICAgICBdXG4gICAgcmV0dXJuXG4gIHJlc3VsdFxuIiwiIyMjXG4jIENvcHlyaWdodCAyMDE1IFNjb3R0IEJyYWR5XG4jIE1JVCBMaWNlbnNlXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGJyYWR5L3hoci1wcm9taXNlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiMjI1xuXG5pbXBvcnQgUHJvbWlzZSAgICAgIGZyb20gJ2Jyb2tlbidcbmltcG9ydCBvYmplY3RBc3NpZ24gZnJvbSAnZXMtb2JqZWN0LWFzc2lnbidcbmltcG9ydCBwYXJzZUhlYWRlcnMgZnJvbSAnLi9wYXJzZS1oZWFkZXJzJ1xuXG5kZWZhdWx0cyA9XG4gIG1ldGhvZDogICAnR0VUJ1xuICBoZWFkZXJzOiAge31cbiAgZGF0YTogICAgIG51bGxcbiAgdXNlcm5hbWU6IG51bGxcbiAgcGFzc3dvcmQ6IG51bGxcbiAgYXN5bmM6ICAgIHRydWVcblxuIyMjXG4jIE1vZHVsZSB0byB3cmFwIGFuIFhoclByb21pc2UgaW4gYSBwcm9taXNlLlxuIyMjXG5jbGFzcyBYaHJQcm9taXNlXG5cbiAgQERFRkFVTFRfQ09OVEVOVF9UWVBFOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04J1xuXG4gIEBQcm9taXNlOiBQcm9taXNlXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMgUHVibGljIG1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLnNlbmQob3B0aW9ucykgLT4gUHJvbWlzZVxuICAjIC0gb3B0aW9ucyAoT2JqZWN0KTogVVJMLCBtZXRob2QsIGRhdGEsIGV0Yy5cbiAgI1xuICAjIENyZWF0ZSB0aGUgWEhSIG9iamVjdCBhbmQgd2lyZSB1cCBldmVudCBoYW5kbGVycyB0byB1c2UgYSBwcm9taXNlLlxuICAjIyNcbiAgc2VuZDogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBvcHRpb25zID0gb2JqZWN0QXNzaWduIHt9LCBkZWZhdWx0cywgb3B0aW9uc1xuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHVubGVzcyBYTUxIdHRwUmVxdWVzdFxuICAgICAgICBAX2hhbmRsZUVycm9yICdicm93c2VyJywgcmVqZWN0LCBudWxsLCBcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0XCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIHR5cGVvZiBvcHRpb25zLnVybCBpc250ICdzdHJpbmcnIHx8IG9wdGlvbnMudXJsLmxlbmd0aCBpcyAwXG4gICAgICAgIEBfaGFuZGxlRXJyb3IgJ3VybCcsIHJlamVjdCwgbnVsbCwgJ1VSTCBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlcidcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgICMgWE1MSHR0cFJlcXVlc3QgaXMgc3VwcG9ydGVkIGJ5IElFIDcrXG4gICAgICBAX3hociA9IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgICMgc3VjY2VzcyBoYW5kbGVyXG4gICAgICB4aHIub25sb2FkID0gPT5cbiAgICAgICAgQF9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlc3BvbnNlVGV4dCA9IEBfZ2V0UmVzcG9uc2VUZXh0KClcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICBAX2hhbmRsZUVycm9yICdwYXJzZScsIHJlamVjdCwgbnVsbCwgJ2ludmFsaWQgSlNPTiByZXNwb25zZSdcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXNvbHZlXG4gICAgICAgICAgdXJsOiAgICAgICAgICBAX2dldFJlc3BvbnNlVXJsKClcbiAgICAgICAgICBoZWFkZXJzOiAgICAgIEBfZ2V0SGVhZGVycygpXG4gICAgICAgICAgcmVzcG9uc2VUZXh0OiByZXNwb25zZVRleHRcbiAgICAgICAgICBzdGF0dXM6ICAgICAgIHhoci5zdGF0dXNcbiAgICAgICAgICBzdGF0dXNUZXh0OiAgIHhoci5zdGF0dXNUZXh0XG4gICAgICAgICAgeGhyOiAgICAgICAgICB4aHJcblxuICAgICAgIyBlcnJvciBoYW5kbGVyc1xuICAgICAgeGhyLm9uZXJyb3IgICA9ID0+IEBfaGFuZGxlRXJyb3IgJ2Vycm9yJywgICByZWplY3RcbiAgICAgIHhoci5vbnRpbWVvdXQgPSA9PiBAX2hhbmRsZUVycm9yICd0aW1lb3V0JywgcmVqZWN0XG4gICAgICB4aHIub25hYm9ydCAgID0gPT4gQF9oYW5kbGVFcnJvciAnYWJvcnQnLCAgIHJlamVjdFxuXG4gICAgICBAX2F0dGFjaFdpbmRvd1VubG9hZCgpXG5cbiAgICAgIHhoci5vcGVuIG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgb3B0aW9ucy5hc3luYywgb3B0aW9ucy51c2VybmFtZSwgb3B0aW9ucy5wYXNzd29yZFxuXG4gICAgICBpZiBvcHRpb25zLmRhdGE/ICYmICFvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddXG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBAY29uc3RydWN0b3IuREVGQVVMVF9DT05URU5UX1RZUEVcblxuICAgICAgZm9yIGhlYWRlciwgdmFsdWUgb2Ygb3B0aW9ucy5oZWFkZXJzXG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpXG5cbiAgICAgIHRyeVxuICAgICAgICB4aHIuc2VuZChvcHRpb25zLmRhdGEpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIEBfaGFuZGxlRXJyb3IgJ3NlbmQnLCByZWplY3QsIG51bGwsIGUudG9TdHJpbmcoKVxuXG4gICMjI1xuICAjIFhoclByb21pc2UuZ2V0WEhSKCkgLT4gWGhyUHJvbWlzZVxuICAjIyNcbiAgZ2V0WEhSOiAtPiBAX3hoclxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMjIFBzdWVkby1wcml2YXRlIG1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fYXR0YWNoV2luZG93VW5sb2FkKClcbiAgI1xuICAjIEZpeCBmb3IgSUUgOSBhbmQgSUUgMTBcbiAgIyBJbnRlcm5ldCBFeHBsb3JlciBmcmVlemVzIHdoZW4geW91IGNsb3NlIGEgd2VicGFnZSBkdXJpbmcgYW4gWEhSIHJlcXVlc3RcbiAgIyBodHRwczovL3N1cHBvcnQubWljcm9zb2Z0LmNvbS9rYi8yODU2NzQ2XG4gICNcbiAgIyMjXG4gIF9hdHRhY2hXaW5kb3dVbmxvYWQ6IC0+XG4gICAgQF91bmxvYWRIYW5kbGVyID0gQF9oYW5kbGVXaW5kb3dVbmxvYWQuYmluZChAKVxuICAgIHdpbmRvdy5hdHRhY2hFdmVudCAnb251bmxvYWQnLCBAX3VubG9hZEhhbmRsZXIgaWYgd2luZG93LmF0dGFjaEV2ZW50XG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5fZGV0YWNoV2luZG93VW5sb2FkKClcbiAgIyMjXG4gIF9kZXRhY2hXaW5kb3dVbmxvYWQ6IC0+XG4gICAgd2luZG93LmRldGFjaEV2ZW50ICdvbnVubG9hZCcsIEBfdW5sb2FkSGFuZGxlciBpZiB3aW5kb3cuZGV0YWNoRXZlbnRcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRIZWFkZXJzKCkgLT4gT2JqZWN0XG4gICMjI1xuICBfZ2V0SGVhZGVyczogLT5cbiAgICBwYXJzZUhlYWRlcnMgQF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKClcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRSZXNwb25zZVRleHQoKSAtPiBNaXhlZFxuICAjXG4gICMgUGFyc2VzIHJlc3BvbnNlIHRleHQgSlNPTiBpZiBwcmVzZW50LlxuICAjIyNcbiAgX2dldFJlc3BvbnNlVGV4dDogLT5cbiAgICAjIEFjY2Vzc2luZyBiaW5hcnktZGF0YSByZXNwb25zZVRleHQgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpbiBJRTlcbiAgICByZXNwb25zZVRleHQgPSBpZiB0eXBlb2YgQF94aHIucmVzcG9uc2VUZXh0IGlzICdzdHJpbmcnIHRoZW4gQF94aHIucmVzcG9uc2VUZXh0IGVsc2UgJydcblxuICAgIHN3aXRjaCBAX3hoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJylcbiAgICAgIHdoZW4gJ2FwcGxpY2F0aW9uL2pzb24nLCAndGV4dC9qYXZhc2NyaXB0J1xuICAgICAgICAjIFdvcmthcm91bmQgQW5kcm9pZCAyLjMgZmFpbHVyZSB0byBzdHJpbmctY2FzdCBudWxsIGlucHV0XG4gICAgICAgIHJlc3BvbnNlVGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0ICsgJycpXG5cbiAgICByZXNwb25zZVRleHRcblxuICAjIyNcbiAgIyBYaHJQcm9taXNlLl9nZXRSZXNwb25zZVVybCgpIC0+IFN0cmluZ1xuICAjXG4gICMgQWN0dWFsIHJlc3BvbnNlIFVSTCBhZnRlciBmb2xsb3dpbmcgcmVkaXJlY3RzLlxuICAjIyNcbiAgX2dldFJlc3BvbnNlVXJsOiAtPlxuICAgIHJldHVybiBAX3hoci5yZXNwb25zZVVSTCBpZiBAX3hoci5yZXNwb25zZVVSTD9cblxuICAgICMgQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgcmV0dXJuIEBfeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJykgaWYgL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoQF94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG5cbiAgICAnJ1xuXG4gICMjI1xuICAjIFhoclByb21pc2UuX2hhbmRsZUVycm9yKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpXG4gICMgLSByZWFzb24gKFN0cmluZylcbiAgIyAtIHJlamVjdCAoRnVuY3Rpb24pXG4gICMgLSBzdGF0dXMgKFN0cmluZylcbiAgIyAtIHN0YXR1c1RleHQgKFN0cmluZylcbiAgIyMjXG4gIF9oYW5kbGVFcnJvcjogKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpIC0+XG4gICAgQF9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuXG4gICAgcmVqZWN0XG4gICAgICByZWFzb246ICAgICByZWFzb25cbiAgICAgIHN0YXR1czogICAgIHN0YXR1cyAgICAgb3IgQF94aHIuc3RhdHVzXG4gICAgICBzdGF0dXNUZXh0OiBzdGF0dXNUZXh0IG9yIEBfeGhyLnN0YXR1c1RleHRcbiAgICAgIHhocjogICAgICAgIEBfeGhyXG5cbiAgIyMjXG4gICMgWGhyUHJvbWlzZS5faGFuZGxlV2luZG93VW5sb2FkKClcbiAgIyMjXG4gIF9oYW5kbGVXaW5kb3dVbmxvYWQ6IC0+XG4gICAgQF94aHIuYWJvcnQoKVxuXG5leHBvcnQgZGVmYXVsdCBYaHJQcm9taXNlXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXG59XG4iLCJpbXBvcnQgdG9TdHJpbmcgZnJvbSAnZXMtdG9zdHJpbmcnXG5cbiMgVGVzdCBpZiBgdmFsdWVgIGlzIGEgbnVtYmVyLlxuI1xuIyBAcGFyYW0ge01peGVkfSB2YWx1ZSB2YWx1ZSB0byB0ZXN0XG4jIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYHZhbHVlYCBpcyBhIG51bWJlciwgZmFsc2Ugb3RoZXJ3aXNlXG4jIEBhcGkgcHVibGljXG5leHBvcnQgZGVmYXVsdCBpc051bWJlciA9ICh2YWx1ZSkgLT5cbiAgdG9TdHJpbmcodmFsdWUpID09ICdbb2JqZWN0IE51bWJlcl0nXG4iLCJpbXBvcnQgaXNOdW1iZXIgICAgIGZyb20gJ2VzLWlzL251bWJlcidcbmltcG9ydCBvYmplY3RBc3NpZ24gZnJvbSAnZXMtb2JqZWN0LWFzc2lnbidcblxuXG5jbGFzcyBDb29raWVzXG4gIGNvbnN0cnVjdG9yOiAoQGRlZmF1bHRzID0ge30pIC0+XG4gICAgQGdldCAgICAgPSAoa2V5KSA9PiBAcmVhZCBrZXlcbiAgICBAZ2V0SlNPTiA9IChrZXkpID0+XG4gICAgICB0cnlcbiAgICAgICAgSlNPTi5wYXJzZSBAcmVhZCBrZXlcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICB7fVxuXG4gICAgQHJlbW92ZSA9IChrZXksIGF0dHJzKSAgICAgICAgPT4gQHdyaXRlIGtleSwgJycsIG9iamVjdEFzc2lnbiBleHBpcmVzOiAtMSwgYXR0cnNcbiAgICBAc2V0ICAgID0gKGtleSwgdmFsdWUsIGF0dHJzKSA9PiBAd3JpdGUga2V5LCB2YWx1ZSwgYXR0cnNcblxuICByZWFkOiAoa2V5KSAtPlxuICAgIHVubGVzcyBrZXlcbiAgICAgIHJlc3VsdCA9IHt9XG5cbiAgICAjIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXkgaW4gY2FzZVxuICAgICMgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlbiBjYWxsaW5nXG4gICAgIyBcImdldCgpXCJcbiAgICBjb29raWVzID0gaWYgZG9jdW1lbnQuY29va2llIHRoZW4gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIGVsc2UgW11cbiAgICByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nXG5cbiAgICBmb3Iga3YgaW4gY29va2llc1xuICAgICAgcGFydHMgID0ga3Yuc3BsaXQgJz0nXG4gICAgICBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luICc9J1xuXG4gICAgICBpZiBjb29raWUuY2hhckF0KDApID09ICdcIidcbiAgICAgICAgY29va2llID0gY29va2llLnNsaWNlIDEsIC0xXG5cbiAgICAgIHRyeVxuICAgICAgICBuYW1lICAgPSBwYXJ0c1swXS5yZXBsYWNlIHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudFxuICAgICAgICBjb29raWUgPSBjb29raWUucmVwbGFjZSAgIHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudFxuXG4gICAgICAgIGlmIGtleSA9PSBuYW1lXG4gICAgICAgICAgcmV0dXJuIGNvb2tpZVxuICAgICAgICB1bmxlc3Mga2V5XG4gICAgICAgICAgcmVzdWx0W25hbWVdID0gY29va2llXG5cbiAgICAgIGNhdGNoIGVyclxuXG4gICAgcmVzdWx0XG5cbiAgd3JpdGU6IChrZXksIHZhbHVlLCBhdHRycykgLT5cbiAgICBhdHRycyA9IG9iamVjdEFzc2lnbiBwYXRoOiAnLycsIEBkZWZhdWx0cywgYXR0cnNcblxuICAgIGlmIGlzTnVtYmVyIGF0dHJzLmV4cGlyZXNcbiAgICAgIGV4cGlyZXMgPSBuZXcgRGF0ZVxuICAgICAgZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMgZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJzLmV4cGlyZXMgKiA4NjRlKzVcbiAgICAgIGF0dHJzLmV4cGlyZXMgPSBleHBpcmVzXG5cbiAgICAjIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuICAgIGF0dHJzLmV4cGlyZXMgPSBpZiBhdHRycy5leHBpcmVzIHRoZW4gYXR0cnMuZXhwaXJlcy50b1VUQ1N0cmluZygpIGVsc2UgJydcblxuICAgIHRyeVxuICAgICAgcmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgICBpZiAvXltcXHtcXFtdLy50ZXN0KHJlc3VsdClcbiAgICAgICAgdmFsdWUgPSByZXN1bHRcbiAgICBjYXRjaCBlcnJcblxuICAgIHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpLnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudClcbiAgICBrZXkgICA9IGVuY29kZVVSSUNvbXBvbmVudCBTdHJpbmcga2V5XG4gICAga2V5ICAgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KVxuICAgIGtleSAgID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSlcblxuICAgIHN0ckF0dHJzID0gJydcblxuICAgIGZvciBuYW1lLCBhdHRyIG9mIGF0dHJzXG4gICAgICBjb250aW51ZSB1bmxlc3MgYXR0clxuICAgICAgc3RyQXR0cnMgKz0gJzsgJyArIG5hbWVcbiAgICAgIGNvbnRpbnVlIGlmIGF0dHIgPT0gdHJ1ZVxuICAgICAgc3RyQXR0cnMgKz0gJz0nICsgYXR0clxuXG4gICAgZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJBdHRyc1xuXG5cbmV4cG9ydCBkZWZhdWx0IENvb2tpZXNcbiIsImltcG9ydCBDb29raWVzIGZyb20gJy4vY29va2llcydcbmV4cG9ydCBkZWZhdWx0IG5ldyBDb29raWVzKClcbiIsImltcG9ydCBjb29raWVzIGZyb20gJ2VzLWNvb2tpZXMnXG5cbmltcG9ydCB7aXNGdW5jdGlvbiwgdXBkYXRlUXVlcnl9IGZyb20gJy4uL3V0aWxzJ1xuXG5cbmNsYXNzIENsaWVudFxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICBAb3B0cyA9XG4gICAgICBkZWJ1ZzogICAgZmFsc2VcbiAgICAgIGVuZHBvaW50OiAnaHR0cHM6Ly9hcGkuaGFuem8uaW8nXG4gICAgICBzZXNzaW9uOlxuICAgICAgICBuYW1lOiAgICAnaHpvJ1xuICAgICAgICBleHBpcmVzOiA3ICogMjQgKiAzNjAwICogMTAwMFxuXG4gICAgZm9yIGssdiBvZiBvcHRzXG4gICAgICBAb3B0c1trXSA9IHZcblxuICBnZXRLZXk6IC0+XG4gICAgQG9wdHMua2V5XG5cbiAgc2V0S2V5OiAoa2V5KSAtPlxuICAgIEBvcHRzLmtleSA9IGtleVxuXG4gIGdldEN1c3RvbWVyVG9rZW46IC0+XG4gICAgaWYgKHNlc3Npb24gPSBjb29raWVzLmdldEpTT04gQG9wdHMuc2Vzc2lvbi5uYW1lKT9cbiAgICAgIEBjdXN0b21lclRva2VuID0gc2Vzc2lvbi5jdXN0b21lclRva2VuIGlmIHNlc3Npb24uY3VzdG9tZXJUb2tlbj9cbiAgICBAY3VzdG9tZXJUb2tlblxuXG4gIHNldEN1c3RvbWVyVG9rZW46IChrZXkpIC0+XG4gICAgY29va2llcy5zZXQgQG9wdHMuc2Vzc2lvbi5uYW1lLCB7Y3VzdG9tZXJUb2tlbjoga2V5fSwgZXhwaXJlczogQG9wdHMuc2Vzc2lvbi5leHBpcmVzXG4gICAgQGN1c3RvbWVyVG9rZW4gPSBrZXlcblxuICBkZWxldGVDdXN0b21lclRva2VuOiAtPlxuICAgIGNvb2tpZXMuc2V0IEBvcHRzLnNlc3Npb24ubmFtZSwge2N1c3RvbWVyVG9rZW46IG51bGx9LCBleHBpcmVzOiBAb3B0cy5zZXNzaW9uLmV4cGlyZXNcbiAgICBAY3VzdG9tZXJUb2tlbiA9IG51bGxcblxuICB1cmw6ICh1cmwsIGRhdGEsIGtleSkgLT5cbiAgICBpZiBpc0Z1bmN0aW9uIHVybFxuICAgICAgdXJsID0gdXJsLmNhbGwgQCwgZGF0YVxuXG4gICAgdXBkYXRlUXVlcnkgKEBvcHRzLmVuZHBvaW50ICsgdXJsKSwgdG9rZW46IGtleVxuXG4gIGxvZzogKGFyZ3MuLi4pIC0+XG4gICAgYXJncy51bnNoaWZ0ICdoYW56by5qcz4nXG4gICAgaWYgQG9wdHMuZGVidWcgYW5kIGNvbnNvbGU/XG4gICAgICBjb25zb2xlLmxvZyBhcmdzLi4uXG5cbmV4cG9ydCBkZWZhdWx0IENsaWVudFxuIiwiaW1wb3J0IFhociBmcm9tICdlcy14aHItcHJvbWlzZSdcblxuaW1wb3J0IENsaWVudCAgICAgZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQge25ld0Vycm9yLCB1cGRhdGVRdWVyeX0gZnJvbSAnLi4vdXRpbHMnXG5cbmNsYXNzIEJyb3dzZXJDbGllbnQgZXh0ZW5kcyBDbGllbnRcbiAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgIHJldHVybiBuZXcgQnJvd3NlckNsaWVudCBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQnJvd3NlckNsaWVudFxuICAgIHN1cGVyIG9wdHNcbiAgICBAZ2V0Q3VzdG9tZXJUb2tlbigpXG5cbiAgcmVxdWVzdDogKGJsdWVwcmludCwgZGF0YT17fSwga2V5ID0gQGdldEtleSgpKSAtPlxuICAgIG9wdHMgPVxuICAgICAgdXJsOiAgICBAdXJsIGJsdWVwcmludC51cmwsIGRhdGEsIGtleVxuICAgICAgbWV0aG9kOiBibHVlcHJpbnQubWV0aG9kXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kICE9ICdHRVQnXG4gICAgICBvcHRzLmhlYWRlcnMgPVxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kID09ICdHRVQnXG4gICAgICBvcHRzLnVybCAgPSB1cGRhdGVRdWVyeSBvcHRzLnVybCwgZGF0YVxuICAgIGVsc2VcbiAgICAgIG9wdHMuZGF0YSA9IEpTT04uc3RyaW5naWZ5IGRhdGFcblxuICAgIEBsb2cgJ3JlcXVlc3QnLCBrZXk6IGtleSwgb3B0czogb3B0c1xuXG4gICAgKG5ldyBYaHIpLnNlbmQgb3B0c1xuICAgICAgLnRoZW4gKHJlcykgPT5cbiAgICAgICAgQGxvZyAncmVzcG9uc2UnLCByZXNcbiAgICAgICAgcmVzLmRhdGEgPSByZXMucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc1xuICAgICAgLmNhdGNoIChyZXMpID0+XG4gICAgICAgIHRyeVxuICAgICAgICAgIHJlcy5kYXRhID0gcmVzLnJlc3BvbnNlVGV4dCA/IChKU09OLnBhcnNlIHJlcy54aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICBjYXRjaCBlcnJcblxuICAgICAgICBlcnIgPSBuZXdFcnJvciBkYXRhLCByZXMsIGVyclxuICAgICAgICBAbG9nICdyZXNwb25zZScsIHJlc1xuICAgICAgICBAbG9nICdlcnJvcicsIGVyclxuXG4gICAgICAgIHRocm93IGVyclxuXG5leHBvcnQgZGVmYXVsdCBCcm93c2VyQ2xpZW50XG4iLCJpbXBvcnQge2lzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJ1xuXG4jIFdyYXAgYSB1cmwgZnVuY3Rpb24gdG8gcHJvdmlkZSBzdG9yZS1wcmVmaXhlZCBVUkxzXG5leHBvcnQgc3RvcmVQcmVmaXhlZCA9IHNwID0gKHUpIC0+XG4gICh4KSAtPlxuICAgIGlmIGlzRnVuY3Rpb24gdVxuICAgICAgdXJsID0gdSB4XG4gICAgZWxzZVxuICAgICAgdXJsID0gdVxuXG4gICAgaWYgQHN0b3JlSWQ/XG4gICAgICBcIi9zdG9yZS8je0BzdG9yZUlkfVwiICsgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgUmV0dXJucyBhIFVSTCBmb3IgZ2V0dGluZyBhIHNpbmdsZVxuZXhwb3J0IGJ5SWQgPSAobmFtZSkgLT5cbiAgc3dpdGNoIG5hbWVcbiAgICB3aGVuICdjb3Vwb24nXG4gICAgICBzcCAoeCkgLT4gXCIvY291cG9uLyN7eC5jb2RlID8geH1cIlxuICAgIHdoZW4gJ2NvbGxlY3Rpb24nXG4gICAgICBzcCAoeCkgLT4gXCIvY29sbGVjdGlvbi8je3guc2x1ZyA/IHh9XCJcbiAgICB3aGVuICdwcm9kdWN0J1xuICAgICAgc3AgKHgpIC0+IFwiL3Byb2R1Y3QvI3t4LmlkID8geC5zbHVnID8geH1cIlxuICAgIHdoZW4gJ3ZhcmlhbnQnXG4gICAgICBzcCAoeCkgLT4gXCIvdmFyaWFudC8je3guaWQgPyB4LnNrdSA/IHh9XCJcbiAgICB3aGVuICdzaXRlJ1xuICAgICAgKHgpIC0+IFwiL3NpdGUvI3t4LmlkID8geC5uYW1lID8geH1cIlxuICAgIGVsc2VcbiAgICAgICh4KSAtPiBcIi8je25hbWV9LyN7eC5pZCA/IHh9XCJcbiIsImltcG9ydCB7XG4gIEdFVFxuICBQT1NUXG4gIFBBVENIXG4gIGlzRnVuY3Rpb25cbiAgc3RhdHVzQ3JlYXRlZFxuICBzdGF0dXNOb0NvbnRlbnRcbiAgc3RhdHVzT2tcbn0gZnJvbSAnLi4vdXRpbHMnXG5cbmltcG9ydCB7YnlJZCwgc3RvcmVQcmVmaXhlZH0gZnJvbSAnLi91cmwnXG5cbiMgT25seSBsaXN0LCBnZXQgbWV0aG9kcyBvZiBhIGZldyBtb2RlbHMgYXJlIHN1cHBvcnRlZCB3aXRoIGEgcHVibGlzaGFibGUga2V5LFxuIyBzbyBvbmx5IHRoZXNlIG1ldGhvZHMgYXJlIGV4cG9zZWQgaW4gdGhlIGJyb3dzZXIuXG5jcmVhdGVCbHVlcHJpbnQgPSAobmFtZSkgLT5cbiAgZW5kcG9pbnQgPSBcIi8je25hbWV9XCJcblxuICBsaXN0OlxuICAgIHVybDogICAgIGVuZHBvaW50XG4gICAgbWV0aG9kOiAgR0VUXG4gICAgZXhwZWN0czogc3RhdHVzT2tcbiAgZ2V0OlxuICAgIHVybDogICAgIGJ5SWQgbmFtZVxuICAgIG1ldGhvZDogIEdFVFxuICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbmJsdWVwcmludHMgPVxuICAjIEFDQ09VTlRcbiAgYWNjb3VudDpcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICBHRVRcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICB1cGRhdGU6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICBQQVRDSFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIGV4aXN0czpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2V4aXN0cy8je3guZW1haWwgPyB4LnVzZXJuYW1lID8geC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIEdFVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHByb2Nlc3M6IChyZXMpIC0+IHJlcy5kYXRhLmV4aXN0c1xuXG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L2NyZWF0ZSdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGVuYWJsZTpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2VuYWJsZS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBsb2dpbjpcbiAgICAgIHVybDogICAgICcvYWNjb3VudC9sb2dpbidcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICBwcm9jZXNzOiAocmVzKSAtPlxuICAgICAgICBAc2V0Q3VzdG9tZXJUb2tlbiByZXMuZGF0YS50b2tlblxuICAgICAgICByZXNcblxuICAgIGxvZ291dDogLT5cbiAgICAgIEBkZWxldGVDdXN0b21lclRva2VuKClcblxuICAgIHJlc2V0OlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L3Jlc2V0J1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIHVwZGF0ZU9yZGVyOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvb3JkZXIvI3t4Lm9yZGVySWQgPyB4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgUEFUQ0hcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICBjb25maXJtOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvY29uZmlybS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgIyBDQVJUXG4gIGNhcnQ6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgICcvY2FydCdcbiAgICAgIG1ldGhvZDogICBQT1NUXG4gICAgICBleHBlY3RzOiAgc3RhdHVzQ3JlYXRlZFxuICAgIHVwZGF0ZTpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAgUEFUQ0hcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuICAgIGRpc2NhcmQ6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH0vZGlzY2FyZFwiXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG4gICAgc2V0OlxuICAgICAgdXJsOiAgICAgICh4KSAtPiBcIi9jYXJ0LyN7eC5pZCA/IHh9L3NldFwiXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG5cbiAgIyBSRVZJRVdTXG4gIHJldmlldzpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAgJy9yZXZpZXcnXG4gICAgICBtZXRob2Q6ICAgUE9TVFxuICAgICAgZXhwZWN0czogIHN0YXR1c0NyZWF0ZWRcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAgKHgpLT4gXCIvcmV2aWV3LyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICBHRVRcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuXG4gICMgQ0hFQ0tPVVRcbiAgY2hlY2tvdXQ6XG4gICAgYXV0aG9yaXplOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAnL2NoZWNrb3V0L2F1dGhvcml6ZSdcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjYXB0dXJlOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAoeCkgLT4gXCIvY2hlY2tvdXQvY2FwdHVyZS8je3gub3JkZXJJZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjaGFyZ2U6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvY2hhcmdlJ1xuICAgICAgbWV0aG9kOiAgUE9TVFxuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIHBheXBhbDpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgJy9jaGVja291dC9wYXlwYWwnXG4gICAgICBtZXRob2Q6ICBQT1NUXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICMgUkVGRVJSRVJcbiAgcmVmZXJyZXI6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9yZWZlcnJlcidcbiAgICAgIG1ldGhvZDogIFBPU1RcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGdldDpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9yZWZlcnJlci8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICBHRVRcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiMgTU9ERUxTXG5tb2RlbHMgPSBbXG4gICdjb2xsZWN0aW9uJ1xuICAnY291cG9uJ1xuICAncHJvZHVjdCdcbiAgJ3ZhcmlhbnQnXG5dXG5cbmZvciBtb2RlbCBpbiBtb2RlbHNcbiAgZG8gKG1vZGVsKSAtPlxuICAgIGJsdWVwcmludHNbbW9kZWxdID0gY3JlYXRlQmx1ZXByaW50IG1vZGVsXG5cbmV4cG9ydCBkZWZhdWx0IGJsdWVwcmludHNcbiIsImltcG9ydCBBcGkgICAgICAgIGZyb20gJy4vYXBpJ1xuaW1wb3J0IENsaWVudCAgICAgZnJvbSAnLi9jbGllbnQvYnJvd3NlcidcbmltcG9ydCBibHVlcHJpbnRzIGZyb20gJy4vYmx1ZXByaW50cy9icm93c2VyJ1xuXG5BcGkuQkxVRVBSSU5UUyA9IGJsdWVwcmludHNcbkFwaS5DTElFTlQgICAgID0gQ2xpZW50XG5cbkhhbnpvID0gKG9wdHMgPSB7fSkgLT5cbiAgb3B0cy5jbGllbnQgICAgID89IG5ldyBDbGllbnQgb3B0c1xuICBvcHRzLmJsdWVwcmludHMgPz0gYmx1ZXByaW50c1xuICBuZXcgQXBpIG9wdHNcblxuSGFuem8uQXBpICAgICAgICA9IEFwaVxuSGFuem8uQ2xpZW50ICAgICA9IENsaWVudFxuXG5leHBvcnQgZGVmYXVsdCBIYW56b1xuZXhwb3J0IHtBcGksIENsaWVudH1cbiJdLCJuYW1lcyI6WyJfdW5kZWZpbmVkIiwiX3VuZGVmaW5lZFN0cmluZyIsIlByb21pc2UiLCJzb29uIiwiUHJvbWlzZUluc3BlY3Rpb24iLCJpbmRleCIsIm9iamVjdEFzc2lnbiIsInBhcnNlSGVhZGVycyIsImlzTnVtYmVyIiwiQ29va2llcyIsIkNsaWVudCIsInNsaWNlIiwiY29va2llcyIsIlhociIsIkFwaSIsImJsdWVwcmludHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxJQUFBOztBQUFBLEFBQUEsSUFBTyxVQUFQLEdBQW9CLFNBQUMsRUFBRDtTQUFRLE9BQU8sRUFBUCxLQUFhOzs7QUFDekMsQUFBQTs7QUFHQSxBQUFBLElBQU8sUUFBUCxHQUF5QixTQUFDLEdBQUQ7U0FBUyxHQUFHLENBQUMsTUFBSixLQUFjOzs7QUFDaEQsQUFBQSxJQUFPLGFBQVAsR0FBeUIsU0FBQyxHQUFEO1NBQVMsR0FBRyxDQUFDLE1BQUosS0FBYzs7O0FBQ2hELEFBQUE7O0FBR0EsQUFBQSxJQUFPLEdBQVAsR0FB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
