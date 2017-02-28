this.Hanzo = this.Hanzo || {};
this.Hanzo.js = (function () {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var updateParam;

var isFunction$1 = function(fn) {
  return typeof fn === 'function';
};

var isString$1 = function(s) {
  return typeof s === 'string';
};

var statusOk$1 = function(res) {
  return res.status === 200;
};

var statusCreated = function(res) {
  return res.status === 201;
};

var statusNoContent = function(res) {
  return res.status === 204;
};

var newError$1 = function(data, res, err) {
  var message, ref, ref1, ref2, ref3, ref4;
  if (res == null) {
    res = {};
  }
  message = (ref = res != null ? (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0 : void 0) != null ? ref : 'Request failed';
  if (err == null) {
    err = new Error(message);
    err.message = message;
  }
  err.req = data;
  err.data = res.data;
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

var utils = {
	isFunction: isFunction$1,
	isString: isString$1,
	statusOk: statusOk$1,
	statusCreated: statusCreated,
	statusNoContent: statusNoContent,
	newError: newError$1,
	updateQuery: updateQuery
};

var Api$1;
var isFunction;
var isString;
var newError;
var ref;
var statusOk;

ref = utils, isFunction = ref.isFunction, isString = ref.isString, newError = ref.newError, statusOk = ref.statusOk;

var api = Api$1 = (function() {
  Api.BLUEPRINTS = {};

  Api.CLIENT = null;

  function Api(opts) {
    var blueprints, client, debug, endpoint, k, key, v;
    if (opts == null) {
      opts = {};
    }
    if (!(this instanceof Api)) {
      return new Api(opts);
    }
    endpoint = opts.endpoint, debug = opts.debug, key = opts.key, client = opts.client, blueprints = opts.blueprints;
    this.debug = debug;
    if (blueprints == null) {
      blueprints = this.constructor.BLUEPRINTS;
    }
    if (client) {
      this.client = client;
    } else {
      this.client = new this.constructor.CLIENT({
        debug: debug,
        endpoint: endpoint,
        key: key
      });
    }
    for (k in blueprints) {
      v = blueprints[k];
      this.addBlueprints(k, v);
    }
  }

  Api.prototype.addBlueprints = function(api, blueprints) {
    var bp, fn, name;
    if (this[api] == null) {
      this[api] = {};
    }
    fn = (function(_this) {
      return function(name, bp) {
        var method;
        if (isFunction(bp)) {
          return _this[api][name] = function() {
            return bp.apply(_this, arguments);
          };
        }
        if (bp.expects == null) {
          bp.expects = statusOk;
        }
        if (bp.method == null) {
          bp.method = 'POST';
        }
        method = function(data, cb) {
          var key;
          key = void 0;
          if (bp.useCustomerToken) {
            key = _this.client.getCustomerToken();
          }
          return _this.client.request(bp, data, key).then(function(res) {
            var ref1, ref2;
            if (((ref1 = res.data) != null ? ref1.error : void 0) != null) {
              throw newError(data, res);
            }
            if (!bp.expects(res)) {
              throw newError(data, res);
            }
            if (bp.process != null) {
              bp.process.call(_this, res);
            }
            return (ref2 = res.data) != null ? ref2 : res.body;
          }).callback(cb);
        };
        return _this[api][name] = method;
      };
    })(this);
    for (name in blueprints) {
      bp = blueprints[name];
      fn(name, bp);
    }
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

var index$2 = createCommonjsModule(function (module, exports) {
exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};
});

var index$6 = isFunction$4;

var toString$1 = Object.prototype.toString;

function isFunction$4 (fn) {
  var string = toString$1.call(fn);
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
}

var isFunction$3 = index$6;

var index$4 = forEach$1;

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function forEach$1(list, iterator, context) {
    if (!isFunction$3(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this;
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context);
    else if (typeof list === 'string')
        forEachString(list, iterator, context);
    else
        forEachObject(list, iterator, context);
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array);
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string);
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object);
        }
    }
}

var trim = index$2;
var forEach = index$4;
var isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };

var parseHeaders = function (headers) {
  if (!headers)
    return {}

  var result = {};

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1));

        if (typeof(result[key]) === 'undefined') {
          result[key] = value;
        } else if (isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [ result[key], value ];
        }
      }
  );

  return result
};

/* eslint-disable no-unused-vars */
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

var index$8 = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty$1.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

/*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/xhr-promise/blob/master/LICENSE
 */
var ParseHeaders;
var XMLHttpRequestPromise;
var objectAssign;

ParseHeaders = parseHeaders;

objectAssign = index$8;


/*
 * Module to wrap an XMLHttpRequest in a promise.
 */

var index = XMLHttpRequestPromise = (function() {
  function XMLHttpRequestPromise() {}

  XMLHttpRequestPromise.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';

  XMLHttpRequestPromise.Promise = commonjsGlobal.Promise;


  /*
   * XMLHttpRequestPromise.send(options) -> Promise
   * - options (Object): URL, method, data, etc.
   *
   * Create the XHR object and wire up event handlers to use a promise.
   */

  XMLHttpRequestPromise.prototype.send = function(options) {
    var defaults;
    if (options == null) {
      options = {};
    }
    defaults = {
      method: 'GET',
      data: null,
      headers: {},
      async: true,
      username: null,
      password: null
    };
    options = objectAssign({}, defaults, options);
    return new this.constructor.Promise((function(_this) {
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
        _this._xhr = xhr = new XMLHttpRequest;
        xhr.onload = function() {
          var responseText;
          _this._detachWindowUnload();
          try {
            responseText = _this._getResponseText();
          } catch (_error) {
            _this._handleError('parse', reject, null, 'invalid JSON response');
            return;
          }
          return resolve({
            url: _this._getResponseUrl(),
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: responseText,
            headers: _this._getHeaders(),
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
        } catch (_error) {
          e = _error;
          return _this._handleError('send', reject, null, e.toString());
        }
      };
    })(this));
  };


  /*
   * XMLHttpRequestPromise.getXHR() -> XMLHttpRequest
   */

  XMLHttpRequestPromise.prototype.getXHR = function() {
    return this._xhr;
  };


  /*
   * XMLHttpRequestPromise._attachWindowUnload()
   *
   * Fix for IE 9 and IE 10
   * Internet Explorer freezes when you close a webpage during an XHR request
   * https://support.microsoft.com/kb/2856746
   *
   */

  XMLHttpRequestPromise.prototype._attachWindowUnload = function() {
    this._unloadHandler = this._handleWindowUnload.bind(this);
    if (window.attachEvent) {
      return window.attachEvent('onunload', this._unloadHandler);
    }
  };


  /*
   * XMLHttpRequestPromise._detachWindowUnload()
   */

  XMLHttpRequestPromise.prototype._detachWindowUnload = function() {
    if (window.detachEvent) {
      return window.detachEvent('onunload', this._unloadHandler);
    }
  };


  /*
   * XMLHttpRequestPromise._getHeaders() -> Object
   */

  XMLHttpRequestPromise.prototype._getHeaders = function() {
    return ParseHeaders(this._xhr.getAllResponseHeaders());
  };


  /*
   * XMLHttpRequestPromise._getResponseText() -> Mixed
   *
   * Parses response text JSON if present.
   */

  XMLHttpRequestPromise.prototype._getResponseText = function() {
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
   * XMLHttpRequestPromise._getResponseUrl() -> String
   *
   * Actual response URL after following redirects.
   */

  XMLHttpRequestPromise.prototype._getResponseUrl = function() {
    if (this._xhr.responseURL != null) {
      return this._xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
      return this._xhr.getResponseHeader('X-Request-URL');
    }
    return '';
  };


  /*
   * XMLHttpRequestPromise._handleError(reason, reject, status, statusText)
   * - reason (String)
   * - reject (Function)
   * - status (String)
   * - statusText (String)
   */

  XMLHttpRequestPromise.prototype._handleError = function(reason, reject, status, statusText) {
    this._detachWindowUnload();
    return reject({
      reason: reason,
      status: status || this._xhr.status,
      statusText: statusText || this._xhr.statusText,
      xhr: this._xhr
    });
  };


  /*
   * XMLHttpRequestPromise._handleWindowUnload()
   */

  XMLHttpRequestPromise.prototype._handleWindowUnload = function() {
    return this._xhr.abort();
  };

  return XMLHttpRequestPromise;

})();

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

var _undefined$1 = void 0;

var _undefinedString$1 = 'undefined';

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
        if (global.console) {
          global.console.error(err);
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
    } else if (!Promise.suppressUncaughtRejectionError && global.console) {
      global.console.log('Broken Promise, please catch rejections: ', reason, reason ? reason.stack : null);
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

Promise$2.all = all;

Promise$2.reflect = reflect;

Promise$2.reject = reject;

Promise$2.resolve = resolve;

Promise$2.settle = settle;

Promise$2.soon = soon$1;




var broken = Object.freeze({
	default: Promise$2
});

var js_cookie = createCommonjsModule(function (module, exports) {
/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof undefined === 'function' && undefined.amd) {
		undefined(factory);
		registeredInModuleLoader = true;
	}
	{
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '',
					attributes.domain ? '; domain=' + attributes.domain : '',
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
});

var require$$1$2 = ( broken && Promise$2 ) || broken;

var Xhr;
var XhrClient;
var cookie;
var isFunction$2;
var newError$2;
var ref$1;
var updateQuery$1;

Xhr = index;

Xhr.Promise = require$$1$2;

cookie = js_cookie;

ref$1 = utils, isFunction$2 = ref$1.isFunction, newError$2 = ref$1.newError, updateQuery$1 = ref$1.updateQuery;

var xhr = XhrClient = (function() {
  XhrClient.prototype.debug = false;

  XhrClient.prototype.endpoint = 'https://api.hanzo.io';

  XhrClient.prototype.sessionName = 'hnzo';

  function XhrClient(opts) {
    if (opts == null) {
      opts = {};
    }
    if (!(this instanceof XhrClient)) {
      return new XhrClient(opts);
    }
    this.key = opts.key, this.debug = opts.debug;
    if (opts.endpoint) {
      this.setEndpoint(opts.endpoint);
    }
    this.getCustomerToken();
  }

  XhrClient.prototype.setEndpoint = function(endpoint) {
    return this.endpoint = endpoint.replace(/\/$/, '');
  };

  XhrClient.prototype.setStore = function(id) {
    return this.storeId = id;
  };

  XhrClient.prototype.setKey = function(key) {
    return this.key = key;
  };

  XhrClient.prototype.getKey = function() {
    return this.key || this.constructor.KEY;
  };

  XhrClient.prototype.getCustomerToken = function() {
    var session;
    if ((session = cookie.getJSON(this.sessionName)) != null) {
      if (session.customerToken != null) {
        this.customerToken = session.customerToken;
      }
    }
    return this.customerToken;
  };

  XhrClient.prototype.setCustomerToken = function(key) {
    cookie.set(this.sessionName, {
      customerToken: key
    }, {
      expires: 7 * 24 * 3600 * 1000
    });
    return this.customerToken = key;
  };

  XhrClient.prototype.deleteCustomerToken = function() {
    cookie.set(this.sessionName, {
      customerToken: null
    }, {
      expires: 7 * 24 * 3600 * 1000
    });
    return this.customerToken = null;
  };

  XhrClient.prototype.getUrl = function(url, data, key) {
    if (isFunction$2(url)) {
      url = url.call(this, data);
    }
    return updateQuery$1(this.endpoint + url, {
      token: key
    });
  };

  XhrClient.prototype.request = function(blueprint, data, key) {
    var opts;
    if (data == null) {
      data = {};
    }
    if (key == null) {
      key = this.getKey();
    }
    opts = {
      url: this.getUrl(blueprint.url, data, key),
      method: blueprint.method
    };
    if (blueprint.method !== 'GET') {
      opts.headers = {
        'Content-Type': 'application/json'
      };
    }
    if (blueprint.method === 'GET') {
      opts.url = updateQuery$1(opts.url, data);
    } else {
      opts.data = JSON.stringify(data);
    }
    if (this.debug) {
      console.log('--KEY--');
      console.log(key);
      console.log('--REQUEST--');
      console.log(opts);
    }
    return (new Xhr).send(opts).then(function(res) {
      if (this.debug) {
        console.log('--RESPONSE--');
        console.log(res);
      }
      res.data = res.responseText;
      return res;
    })["catch"](function(res) {
      var err, ref1;
      try {
        res.data = (ref1 = res.responseText) != null ? ref1 : JSON.parse(res.xhr.responseText);
      } catch (error) {
        err = error;
      }
      err = newError$2(data, res);
      if (this.debug) {
        console.log('--RESPONSE--');
        console.log(res);
        console.log('ERROR:', err);
      }
      throw err;
    });
  };

  return XhrClient;

})();

var isFunction$6;
var sp;

isFunction$6 = utils.isFunction;

var storePrefixed$1 = sp = function(u) {
  return function(x) {
    var url;
    if (isFunction$6(u)) {
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

var byId$1 = function(name) {
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

var url = {
	storePrefixed: storePrefixed$1,
	byId: byId$1
};

var blueprints;
var byId;
var createBlueprint;
var fn;
var i;
var isFunction$5;
var len;
var model;
var models;
var ref$2;
var ref1;
var statusCreated$1;
var statusNoContent$1;
var statusOk$2;
var storePrefixed;

ref$2 = utils, isFunction$5 = ref$2.isFunction, statusCreated$1 = ref$2.statusCreated, statusNoContent$1 = ref$2.statusNoContent, statusOk$2 = ref$2.statusOk;

ref1 = url, byId = ref1.byId, storePrefixed = ref1.storePrefixed;

createBlueprint = function(name) {
  var endpoint;
  endpoint = "/" + name;
  return {
    list: {
      url: endpoint,
      method: 'GET',
      expects: statusOk$2
    },
    get: {
      url: byId(name),
      method: 'GET',
      expects: statusOk$2
    }
  };
};

blueprints = {
  account: {
    get: {
      url: '/account',
      method: 'GET',
      expects: statusOk$2,
      useCustomerToken: true
    },
    update: {
      url: '/account',
      method: 'PATCH',
      expects: statusOk$2,
      useCustomerToken: true
    },
    exists: {
      url: function(x) {
        var ref2, ref3, ref4;
        return "/account/exists/" + ((ref2 = (ref3 = (ref4 = x.email) != null ? ref4 : x.username) != null ? ref3 : x.id) != null ? ref2 : x);
      },
      method: 'GET',
      expects: statusOk$2,
      process: function(res) {
        return res.data.exists;
      }
    },
    create: {
      url: '/account/create',
      method: 'POST',
      expects: statusCreated$1
    },
    enable: {
      url: function(x) {
        var ref2;
        return "/account/enable/" + ((ref2 = x.tokenId) != null ? ref2 : x);
      },
      method: 'POST',
      expects: statusOk$2
    },
    login: {
      url: '/account/login',
      method: 'POST',
      expects: statusOk$2,
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
      method: 'POST',
      expects: statusOk$2,
      useCustomerToken: true
    },
    updateOrder: {
      url: function(x) {
        var ref2, ref3;
        return "/account/order/" + ((ref2 = (ref3 = x.orderId) != null ? ref3 : x.id) != null ? ref2 : x);
      },
      method: 'PATCH',
      expects: statusOk$2,
      useCustomerToken: true
    },
    confirm: {
      url: function(x) {
        var ref2;
        return "/account/confirm/" + ((ref2 = x.tokenId) != null ? ref2 : x);
      },
      method: 'POST',
      expects: statusOk$2,
      useCustomerToken: true
    }
  },
  cart: {
    create: {
      url: '/cart',
      method: 'POST',
      expects: statusCreated$1
    },
    update: {
      url: function(x) {
        var ref2;
        return "/cart/" + ((ref2 = x.id) != null ? ref2 : x);
      },
      method: 'PATCH',
      expects: statusOk$2
    },
    discard: {
      url: function(x) {
        var ref2;
        return "/cart/" + ((ref2 = x.id) != null ? ref2 : x) + "/discard";
      },
      method: 'POST',
      expects: statusOk$2
    },
    set: {
      url: function(x) {
        var ref2;
        return "/cart/" + ((ref2 = x.id) != null ? ref2 : x) + "/set";
      },
      method: 'POST',
      expects: statusOk$2
    }
  },
  review: {
    create: {
      url: '/review',
      method: 'POST',
      expects: statusCreated$1
    },
    get: {
      url: function(x) {
        var ref2;
        return "/review/" + ((ref2 = x.id) != null ? ref2 : x);
      },
      method: 'GET',
      expects: statusOk$2
    }
  },
  checkout: {
    authorize: {
      url: storePrefixed('/checkout/authorize'),
      method: 'POST',
      expects: statusOk$2
    },
    capture: {
      url: storePrefixed(function(x) {
        var ref2;
        return "/checkout/capture/" + ((ref2 = x.orderId) != null ? ref2 : x);
      }),
      method: 'POST',
      expects: statusOk$2
    },
    charge: {
      url: storePrefixed('/checkout/charge'),
      method: 'POST',
      expects: statusOk$2
    },
    paypal: {
      url: storePrefixed('/checkout/paypal'),
      method: 'POST',
      expects: statusOk$2
    }
  },
  referrer: {
    create: {
      url: '/referrer',
      method: 'POST',
      expects: statusCreated$1
    },
    get: {
      url: function(x) {
        var ref2;
        return "/referrer/" + ((ref2 = x.id) != null ? ref2 : x);
      },
      method: 'GET',
      expects: statusOk$2
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

var browser$2 = blueprints;

var Api;
var Client;

if (commonjsGlobal.Hanzo == null) {
  commonjsGlobal.Hanzo = {};
}

Api = api;

Client = xhr;

Api.CLIENT = Client;

Api.BLUEPRINTS = browser$2;

Hanzo.Api = Api;

Hanzo.Client = Client;

var browser = Hanzo;

return browser;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuem8uanMiLCJzb3VyY2VzIjpbInNyYy91dGlscy5jb2ZmZWUiLCJzcmMvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci1wcm9taXNlLWVzNi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2Rpc3QvYnJva2VuLm1qcyIsIm5vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsInNyYy9jbGllbnQveGhyLmNvZmZlZSIsInNyYy9ibHVlcHJpbnRzL3VybC5jb2ZmZWUiLCJzcmMvYmx1ZXByaW50cy9icm93c2VyLmNvZmZlZSIsInNyYy9icm93c2VyLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEhlbHBlcnNcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IChmbikgLT4gdHlwZW9mIGZuIGlzICdmdW5jdGlvbidcbmV4cG9ydHMuaXNTdHJpbmcgICA9IChzKSAgLT4gdHlwZW9mIHMgIGlzICdzdHJpbmcnXG5cbiMgRmV3IHN0YXR1cyBjb2RlcyB3ZSB1c2UgdGhyb3VnaG91dCBjb2RlIGJhc2VcbmV4cG9ydHMuc3RhdHVzT2sgICAgICAgID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDBcbmV4cG9ydHMuc3RhdHVzQ3JlYXRlZCAgID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDFcbmV4cG9ydHMuc3RhdHVzTm9Db250ZW50ID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDRcblxuIyBUaHJvdyBcImZhdFwiIGVycm9ycy5cbmV4cG9ydHMubmV3RXJyb3IgPSAoZGF0YSwgcmVzID0ge30sIGVycikgLT5cbiAgbWVzc2FnZSA9IHJlcz8uZGF0YT8uZXJyb3I/Lm1lc3NhZ2UgPyAnUmVxdWVzdCBmYWlsZWQnXG5cbiAgdW5sZXNzIGVycj9cbiAgICBlcnIgPSBuZXcgRXJyb3IgbWVzc2FnZVxuICAgIGVyci5tZXNzYWdlID0gbWVzc2FnZVxuXG4gIGVyci5yZXEgICAgICAgICAgPSBkYXRhXG4gIGVyci5kYXRhICAgICAgICAgPSByZXMuZGF0YVxuICBlcnIucmVzcG9uc2VUZXh0ID0gcmVzLmRhdGFcbiAgZXJyLnN0YXR1cyAgICAgICA9IHJlcy5zdGF0dXNcbiAgZXJyLnR5cGUgICAgICAgICA9IHJlcy5kYXRhPy5lcnJvcj8udHlwZVxuICBlcnJcblxudXBkYXRlUGFyYW0gPSAodXJsLCBrZXksIHZhbHVlKSAtPlxuICByZSA9IG5ldyBSZWdFeHAoJyhbPyZdKScgKyBrZXkgKyAnPS4qPygmfCN8JCkoLiopJywgJ2dpJylcblxuICBpZiByZS50ZXN0IHVybFxuICAgIGlmIHZhbHVlP1xuICAgICAgdXJsLnJlcGxhY2UgcmUsICckMScgKyBrZXkgKyAnPScgKyB2YWx1ZSArICckMiQzJ1xuICAgIGVsc2VcbiAgICAgIGhhc2ggPSB1cmwuc3BsaXQgJyMnXG4gICAgICB1cmwgPSBoYXNoWzBdLnJlcGxhY2UocmUsICckMSQzJykucmVwbGFjZSgvKCZ8XFw/KSQvLCAnJylcbiAgICAgIHVybCArPSAnIycgKyBoYXNoWzFdIGlmIGhhc2hbMV0/XG4gICAgICB1cmxcbiAgZWxzZVxuICAgIGlmIHZhbHVlP1xuICAgICAgc2VwYXJhdG9yID0gaWYgdXJsLmluZGV4T2YoJz8nKSAhPSAtMSB0aGVuICcmJyBlbHNlICc/J1xuICAgICAgaGFzaCA9IHVybC5zcGxpdCAnIydcbiAgICAgIHVybCA9IGhhc2hbMF0gKyBzZXBhcmF0b3IgKyBrZXkgKyAnPScgKyB2YWx1ZVxuICAgICAgdXJsICs9ICcjJyArIGhhc2hbMV0gaWYgaGFzaFsxXT9cbiAgICAgIHVybFxuICAgIGVsc2VcbiAgICAgIHVybFxuXG4jIFVwZGF0ZSBxdWVyeSBvbiB1cmxcbmV4cG9ydHMudXBkYXRlUXVlcnkgPSAodXJsLCBkYXRhKSAtPlxuICByZXR1cm4gdXJsIGlmIHR5cGVvZiBkYXRhICE9ICdvYmplY3QnXG5cbiAgZm9yIGssdiBvZiBkYXRhXG4gICAgdXJsID0gdXBkYXRlUGFyYW0gdXJsLCBrLCB2XG4gIHVybFxuIiwie2lzRnVuY3Rpb24sIGlzU3RyaW5nLCBuZXdFcnJvciwgc3RhdHVzT2t9ID0gcmVxdWlyZSAnLi91dGlscydcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBBcGlcbiAgQEJMVUVQUklOVFMgPSB7fVxuICBAQ0xJRU5UICAgICA9IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IEFwaSBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQXBpXG5cbiAgICB7ZW5kcG9pbnQsIGRlYnVnLCBrZXksIGNsaWVudCwgYmx1ZXByaW50c30gPSBvcHRzXG5cbiAgICBAZGVidWcgICAgICA9IGRlYnVnXG4gICAgYmx1ZXByaW50cyA/PSBAY29uc3RydWN0b3IuQkxVRVBSSU5UU1xuXG4gICAgaWYgY2xpZW50XG4gICAgICBAY2xpZW50ID0gY2xpZW50XG4gICAgZWxzZVxuICAgICAgQGNsaWVudCA9IG5ldyBAY29uc3RydWN0b3IuQ0xJRU5UXG4gICAgICAgIGRlYnVnOiAgICBkZWJ1Z1xuICAgICAgICBlbmRwb2ludDogZW5kcG9pbnRcbiAgICAgICAga2V5OiAgICAgIGtleVxuXG4gICAgQGFkZEJsdWVwcmludHMgaywgdiBmb3IgaywgdiBvZiBibHVlcHJpbnRzXG5cbiAgYWRkQmx1ZXByaW50czogKGFwaSwgYmx1ZXByaW50cykgLT5cbiAgICBAW2FwaV0gPz0ge31cblxuICAgIGZvciBuYW1lLCBicCBvZiBibHVlcHJpbnRzXG4gICAgICBkbyAobmFtZSwgYnApID0+XG4gICAgICAgICMgTm9ybWFsIG1ldGhvZFxuICAgICAgICBpZiBpc0Z1bmN0aW9uIGJwXG4gICAgICAgICAgcmV0dXJuIEBbYXBpXVtuYW1lXSA9ID0+IGJwLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICAgICAgICMgQmx1ZXByaW50IG1ldGhvZFxuICAgICAgICBicC5leHBlY3RzID89IHN0YXR1c09rXG4gICAgICAgIGJwLm1ldGhvZCAgPz0gJ1BPU1QnICAjIERlZmF1bHRpbmcgdG8gUE9TVCBzaGF2ZXMgYSBmZXcga2Igb2ZmIGJyb3dzZXIgYnVuZGxlXG5cbiAgICAgICAgbWV0aG9kID0gKGRhdGEsIGNiKSA9PlxuICAgICAgICAgIGtleSA9IHVuZGVmaW5lZFxuICAgICAgICAgIGlmIGJwLnVzZUN1c3RvbWVyVG9rZW5cbiAgICAgICAgICAgIGtleSA9IEBjbGllbnQuZ2V0Q3VzdG9tZXJUb2tlbigpXG4gICAgICAgICAgQGNsaWVudC5yZXF1ZXN0IGJwLCBkYXRhLCBrZXlcbiAgICAgICAgICAgIC50aGVuIChyZXMpID0+XG4gICAgICAgICAgICAgIGlmIHJlcy5kYXRhPy5lcnJvcj9cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXdFcnJvciBkYXRhLCByZXNcbiAgICAgICAgICAgICAgdW5sZXNzIGJwLmV4cGVjdHMgcmVzXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgICAgICAgIGlmIGJwLnByb2Nlc3M/XG4gICAgICAgICAgICAgICAgYnAucHJvY2Vzcy5jYWxsIEAsIHJlc1xuICAgICAgICAgICAgICByZXMuZGF0YSA/IHJlcy5ib2R5XG4gICAgICAgICAgICAuY2FsbGJhY2sgY2JcblxuICAgICAgICBAW2FwaV1bbmFtZV0gPSBtZXRob2RcbiAgICByZXR1cm5cblxuICBzZXRLZXk6IChrZXkpIC0+XG4gICAgQGNsaWVudC5zZXRLZXkga2V5XG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBAY2xpZW50LnNldEN1c3RvbWVyVG9rZW4ga2V5XG5cbiAgZGVsZXRlQ3VzdG9tZXJUb2tlbjogLT5cbiAgICBAY2xpZW50LmRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gIHNldFN0b3JlOiAoaWQpIC0+XG4gICAgQHN0b3JlSWQgPSBpZFxuICAgIEBjbGllbnQuc2V0U3RvcmUgaWRcbiIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbn07XG5cbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvblxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24gKGZuKSB7XG4gIHZhciBzdHJpbmcgPSB0b1N0cmluZy5jYWxsKGZuKVxuICByZXR1cm4gc3RyaW5nID09PSAnW29iamVjdCBGdW5jdGlvbl0nIHx8XG4gICAgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJiBzdHJpbmcgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB8fFxuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAvLyBJRTggYW5kIGJlbG93XG4gICAgIChmbiA9PT0gd2luZG93LnNldFRpbWVvdXQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuYWxlcnQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuY29uZmlybSB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5wcm9tcHQpKVxufTtcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnaXMtZnVuY3Rpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2hcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5mdW5jdGlvbiBmb3JFYWNoKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGl0ZXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBjb250ZXh0ID0gdGhpc1xuICAgIH1cbiAgICBcbiAgICBpZiAodG9TdHJpbmcuY2FsbChsaXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJylcbiAgICAgICAgZm9yRWFjaEFycmF5KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2UgaWYgKHR5cGVvZiBsaXN0ID09PSAnc3RyaW5nJylcbiAgICAgICAgZm9yRWFjaFN0cmluZyhsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlXG4gICAgICAgIGZvckVhY2hPYmplY3QobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG59XG5cbmZ1bmN0aW9uIGZvckVhY2hBcnJheShhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksIGkpKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaFN0cmluZyhzdHJpbmcsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHN0cmluZy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAvLyBubyBzdWNoIHRoaW5nIGFzIGEgc3BhcnNlIHN0cmluZy5cbiAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBzdHJpbmcuY2hhckF0KGkpLCBpLCBzdHJpbmcpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoT2JqZWN0KG9iamVjdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iamVjdCkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGspKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iamVjdFtrXSwgaywgb2JqZWN0KVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJylcbiAgLCBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKVxuICAsIGlzQXJyYXkgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgaWYgKCFoZWFkZXJzKVxuICAgIHJldHVybiB7fVxuXG4gIHZhciByZXN1bHQgPSB7fVxuXG4gIGZvckVhY2goXG4gICAgICB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgICwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaW5kZXggPSByb3cuaW5kZXhPZignOicpXG4gICAgICAgICAgLCBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAsIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcblxuICAgICAgICBpZiAodHlwZW9mKHJlc3VsdFtrZXldKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShyZXN1bHRba2V5XSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gWyByZXN1bHRba2V5XSwgdmFsdWUgXVxuICAgICAgICB9XG4gICAgICB9XG4gIClcblxuICByZXR1cm4gcmVzdWx0XG59IiwiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbHNbaV0pKSB7XG5cdFx0XHRcdFx0dG9bc3ltYm9sc1tpXV0gPSBmcm9tW3N5bWJvbHNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiIsIlxuLypcbiAqIENvcHlyaWdodCAyMDE1IFNjb3R0IEJyYWR5XG4gKiBNSVQgTGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0YnJhZHkveGhyLXByb21pc2UvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICovXG52YXIgUGFyc2VIZWFkZXJzLCBYTUxIdHRwUmVxdWVzdFByb21pc2UsIG9iamVjdEFzc2lnbjtcblxuUGFyc2VIZWFkZXJzID0gcmVxdWlyZSgncGFyc2UtaGVhZGVycycpO1xuXG5vYmplY3RBc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5cblxuLypcbiAqIE1vZHVsZSB0byB3cmFwIGFuIFhNTEh0dHBSZXF1ZXN0IGluIGEgcHJvbWlzZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFhNTEh0dHBSZXF1ZXN0UHJvbWlzZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gWE1MSHR0cFJlcXVlc3RQcm9taXNlKCkge31cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UuREVGQVVMVF9DT05URU5UX1RZUEUgPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04JztcblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UuUHJvbWlzZSA9IGdsb2JhbC5Qcm9taXNlO1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLnNlbmQob3B0aW9ucykgLT4gUHJvbWlzZVxuICAgKiAtIG9wdGlvbnMgKE9iamVjdCk6IFVSTCwgbWV0aG9kLCBkYXRhLCBldGMuXG4gICAqXG4gICAqIENyZWF0ZSB0aGUgWEhSIG9iamVjdCBhbmQgd2lyZSB1cCBldmVudCBoYW5kbGVycyB0byB1c2UgYSBwcm9taXNlLlxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRzO1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgZGF0YTogbnVsbCxcbiAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgYXN5bmM6IHRydWUsXG4gICAgICB1c2VybmFtZTogbnVsbCxcbiAgICAgIHBhc3N3b3JkOiBudWxsXG4gICAgfTtcbiAgICBvcHRpb25zID0gb2JqZWN0QXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yLlByb21pc2UoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciBlLCBoZWFkZXIsIHJlZiwgdmFsdWUsIHhocjtcbiAgICAgICAgaWYgKCFYTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVFcnJvcignYnJvd3NlcicsIHJlamVjdCwgbnVsbCwgXCJicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdFwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnVybCAhPT0gJ3N0cmluZycgfHwgb3B0aW9ucy51cmwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZUVycm9yKCd1cmwnLCByZWplY3QsIG51bGwsICdVUkwgaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuX3hociA9IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciByZXNwb25zZVRleHQ7XG4gICAgICAgICAgX3RoaXMuX2RldGFjaFdpbmRvd1VubG9hZCgpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNwb25zZVRleHQgPSBfdGhpcy5fZ2V0UmVzcG9uc2VUZXh0KCk7XG4gICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICBfdGhpcy5faGFuZGxlRXJyb3IoJ3BhcnNlJywgcmVqZWN0LCBudWxsLCAnaW52YWxpZCBKU09OIHJlc3BvbnNlJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKHtcbiAgICAgICAgICAgIHVybDogX3RoaXMuX2dldFJlc3BvbnNlVXJsKCksXG4gICAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHJlc3BvbnNlVGV4dDogcmVzcG9uc2VUZXh0LFxuICAgICAgICAgICAgaGVhZGVyczogX3RoaXMuX2dldEhlYWRlcnMoKSxcbiAgICAgICAgICAgIHhocjogeGhyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9oYW5kbGVFcnJvcignZXJyb3InLCByZWplY3QpO1xuICAgICAgICB9O1xuICAgICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9oYW5kbGVFcnJvcigndGltZW91dCcsIHJlamVjdCk7XG4gICAgICAgIH07XG4gICAgICAgIHhoci5vbmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9oYW5kbGVFcnJvcignYWJvcnQnLCByZWplY3QpO1xuICAgICAgICB9O1xuICAgICAgICBfdGhpcy5fYXR0YWNoV2luZG93VW5sb2FkKCk7XG4gICAgICAgIHhoci5vcGVuKG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgb3B0aW9ucy5hc3luYywgb3B0aW9ucy51c2VybmFtZSwgb3B0aW9ucy5wYXNzd29yZCk7XG4gICAgICAgIGlmICgob3B0aW9ucy5kYXRhICE9IG51bGwpICYmICFvcHRpb25zLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSB7XG4gICAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IF90aGlzLmNvbnN0cnVjdG9yLkRFRkFVTFRfQ09OVEVOVF9UWVBFO1xuICAgICAgICB9XG4gICAgICAgIHJlZiA9IG9wdGlvbnMuaGVhZGVycztcbiAgICAgICAgZm9yIChoZWFkZXIgaW4gcmVmKSB7XG4gICAgICAgICAgdmFsdWUgPSByZWZbaGVhZGVyXTtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiB4aHIuc2VuZChvcHRpb25zLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5faGFuZGxlRXJyb3IoJ3NlbmQnLCByZWplY3QsIG51bGwsIGUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLmdldFhIUigpIC0+IFhNTEh0dHBSZXF1ZXN0XG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuZ2V0WEhSID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3hocjtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5fYXR0YWNoV2luZG93VW5sb2FkKClcbiAgICpcbiAgICogRml4IGZvciBJRSA5IGFuZCBJRSAxMFxuICAgKiBJbnRlcm5ldCBFeHBsb3JlciBmcmVlemVzIHdoZW4geW91IGNsb3NlIGEgd2VicGFnZSBkdXJpbmcgYW4gWEhSIHJlcXVlc3RcbiAgICogaHR0cHM6Ly9zdXBwb3J0Lm1pY3Jvc29mdC5jb20va2IvMjg1Njc0NlxuICAgKlxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLl9hdHRhY2hXaW5kb3dVbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmxvYWRIYW5kbGVyID0gdGhpcy5faGFuZGxlV2luZG93VW5sb2FkLmJpbmQodGhpcyk7XG4gICAgaWYgKHdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5hdHRhY2hFdmVudCgnb251bmxvYWQnLCB0aGlzLl91bmxvYWRIYW5kbGVyKTtcbiAgICB9XG4gIH07XG5cblxuICAvKlxuICAgKiBYTUxIdHRwUmVxdWVzdFByb21pc2UuX2RldGFjaFdpbmRvd1VubG9hZCgpXG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuX2RldGFjaFdpbmRvd1VubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cuZGV0YWNoRXZlbnQpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuZGV0YWNoRXZlbnQoJ29udW5sb2FkJywgdGhpcy5fdW5sb2FkSGFuZGxlcik7XG4gICAgfVxuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLl9nZXRIZWFkZXJzKCkgLT4gT2JqZWN0XG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuX2dldEhlYWRlcnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gUGFyc2VIZWFkZXJzKHRoaXMuX3hoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBYTUxIdHRwUmVxdWVzdFByb21pc2UuX2dldFJlc3BvbnNlVGV4dCgpIC0+IE1peGVkXG4gICAqXG4gICAqIFBhcnNlcyByZXNwb25zZSB0ZXh0IEpTT04gaWYgcHJlc2VudC5cbiAgICovXG5cbiAgWE1MSHR0cFJlcXVlc3RQcm9taXNlLnByb3RvdHlwZS5fZ2V0UmVzcG9uc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlVGV4dDtcbiAgICByZXNwb25zZVRleHQgPSB0eXBlb2YgdGhpcy5feGhyLnJlc3BvbnNlVGV4dCA9PT0gJ3N0cmluZycgPyB0aGlzLl94aHIucmVzcG9uc2VUZXh0IDogJyc7XG4gICAgc3dpdGNoICh0aGlzLl94aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpKSB7XG4gICAgICBjYXNlICdhcHBsaWNhdGlvbi9qc29uJzpcbiAgICAgIGNhc2UgJ3RleHQvamF2YXNjcmlwdCc6XG4gICAgICAgIHJlc3BvbnNlVGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0ICsgJycpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VUZXh0O1xuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLl9nZXRSZXNwb25zZVVybCgpIC0+IFN0cmluZ1xuICAgKlxuICAgKiBBY3R1YWwgcmVzcG9uc2UgVVJMIGFmdGVyIGZvbGxvd2luZyByZWRpcmVjdHMuXG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuX2dldFJlc3BvbnNlVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3hoci5yZXNwb25zZVVSTCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5feGhyLnJlc3BvbnNlVVJMO1xuICAgIH1cbiAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QodGhpcy5feGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3hoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cblxuICAvKlxuICAgKiBYTUxIdHRwUmVxdWVzdFByb21pc2UuX2hhbmRsZUVycm9yKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpXG4gICAqIC0gcmVhc29uIChTdHJpbmcpXG4gICAqIC0gcmVqZWN0IChGdW5jdGlvbilcbiAgICogLSBzdGF0dXMgKFN0cmluZylcbiAgICogLSBzdGF0dXNUZXh0IChTdHJpbmcpXG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuX2hhbmRsZUVycm9yID0gZnVuY3Rpb24ocmVhc29uLCByZWplY3QsIHN0YXR1cywgc3RhdHVzVGV4dCkge1xuICAgIHRoaXMuX2RldGFjaFdpbmRvd1VubG9hZCgpO1xuICAgIHJldHVybiByZWplY3Qoe1xuICAgICAgcmVhc29uOiByZWFzb24sXG4gICAgICBzdGF0dXM6IHN0YXR1cyB8fCB0aGlzLl94aHIuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogc3RhdHVzVGV4dCB8fCB0aGlzLl94aHIuc3RhdHVzVGV4dCxcbiAgICAgIHhocjogdGhpcy5feGhyXG4gICAgfSk7XG4gIH07XG5cblxuICAvKlxuICAgKiBYTUxIdHRwUmVxdWVzdFByb21pc2UuX2hhbmRsZVdpbmRvd1VubG9hZCgpXG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuX2hhbmRsZVdpbmRvd1VubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl94aHIuYWJvcnQoKTtcbiAgfTtcblxuICByZXR1cm4gWE1MSHR0cFJlcXVlc3RQcm9taXNlO1xuXG59KSgpO1xuIiwidmFyIFByb21pc2VJbnNwZWN0aW9uO1xuXG52YXIgUHJvbWlzZUluc3BlY3Rpb24kMSA9IFByb21pc2VJbnNwZWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQcm9taXNlSW5zcGVjdGlvbihhcmcpIHtcbiAgICB0aGlzLnN0YXRlID0gYXJnLnN0YXRlLCB0aGlzLnZhbHVlID0gYXJnLnZhbHVlLCB0aGlzLnJlYXNvbiA9IGFyZy5yZWFzb247XG4gIH1cblxuICBQcm9taXNlSW5zcGVjdGlvbi5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gJ2Z1bGZpbGxlZCc7XG4gIH07XG5cbiAgUHJvbWlzZUluc3BlY3Rpb24ucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gJ3JlamVjdGVkJztcbiAgfTtcblxuICByZXR1cm4gUHJvbWlzZUluc3BlY3Rpb247XG5cbn0pKCk7XG5cbnZhciBfdW5kZWZpbmVkJDEgPSB2b2lkIDA7XG5cbnZhciBfdW5kZWZpbmVkU3RyaW5nJDEgPSAndW5kZWZpbmVkJztcblxudmFyIHNvb247XG5cbnNvb24gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBidWZmZXJTaXplLCBjYWxsUXVldWUsIGNxWWllbGQsIGZxLCBmcVN0YXJ0O1xuICBmcSA9IFtdO1xuICBmcVN0YXJ0ID0gMDtcbiAgYnVmZmVyU2l6ZSA9IDEwMjQ7XG4gIGNhbGxRdWV1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlcnI7XG4gICAgd2hpbGUgKGZxLmxlbmd0aCAtIGZxU3RhcnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZxW2ZxU3RhcnRdKCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBlcnIgPSBlcnJvcjtcbiAgICAgICAgaWYgKGdsb2JhbC5jb25zb2xlKSB7XG4gICAgICAgICAgZ2xvYmFsLmNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnFbZnFTdGFydCsrXSA9IF91bmRlZmluZWQkMTtcbiAgICAgIGlmIChmcVN0YXJ0ID09PSBidWZmZXJTaXplKSB7XG4gICAgICAgIGZxLnNwbGljZSgwLCBidWZmZXJTaXplKTtcbiAgICAgICAgZnFTdGFydCA9IDA7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBjcVlpZWxkID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZCwgbW87XG4gICAgaWYgKHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9PSBfdW5kZWZpbmVkU3RyaW5nJDEpIHtcbiAgICAgIGRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGNhbGxRdWV1ZSk7XG4gICAgICBtby5vYnNlcnZlKGRkLCB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBkZC5zZXRBdHRyaWJ1dGUoJ2EnLCAwKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlICE9PSBfdW5kZWZpbmVkU3RyaW5nJDEpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0SW1tZWRpYXRlKGNhbGxRdWV1ZSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGNhbGxRdWV1ZSwgMCk7XG4gICAgfTtcbiAgfSkoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGZuKSB7XG4gICAgZnEucHVzaChmbik7XG4gICAgaWYgKGZxLmxlbmd0aCAtIGZxU3RhcnQgPT09IDEpIHtcbiAgICAgIGNxWWllbGQoKTtcbiAgICB9XG4gIH07XG59KSgpO1xuXG52YXIgc29vbiQxID0gc29vbjtcblxudmFyIFByb21pc2UkMTtcbnZhciBTVEFURV9GVUxGSUxMRUQ7XG52YXIgU1RBVEVfUEVORElORztcbnZhciBTVEFURV9SRUpFQ1RFRDtcbnZhciBfdW5kZWZpbmVkO1xudmFyIHJlamVjdENsaWVudDtcbnZhciByZXNvbHZlQ2xpZW50O1xuXG5fdW5kZWZpbmVkID0gdm9pZCAwO1xuXG5TVEFURV9QRU5ESU5HID0gX3VuZGVmaW5lZDtcblxuU1RBVEVfRlVMRklMTEVEID0gJ2Z1bGZpbGxlZCc7XG5cblNUQVRFX1JFSkVDVEVEID0gJ3JlamVjdGVkJztcblxucmVzb2x2ZUNsaWVudCA9IGZ1bmN0aW9uKGMsIGFyZykge1xuICB2YXIgZXJyLCB5cmV0O1xuICBpZiAodHlwZW9mIGMueSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB5cmV0ID0gYy55LmNhbGwoX3VuZGVmaW5lZCwgYXJnKTtcbiAgICAgIGMucC5yZXNvbHZlKHlyZXQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBlcnIgPSBlcnJvcjtcbiAgICAgIGMucC5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYy5wLnJlc29sdmUoYXJnKTtcbiAgfVxufTtcblxucmVqZWN0Q2xpZW50ID0gZnVuY3Rpb24oYywgcmVhc29uKSB7XG4gIHZhciBlcnIsIHlyZXQ7XG4gIGlmICh0eXBlb2YgYy5uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHlyZXQgPSBjLm4uY2FsbChfdW5kZWZpbmVkLCByZWFzb24pO1xuICAgICAgYy5wLnJlc29sdmUoeXJldCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGVyciA9IGVycm9yO1xuICAgICAgYy5wLnJlamVjdChlcnIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjLnAucmVqZWN0KHJlYXNvbik7XG4gIH1cbn07XG5cblByb21pc2UkMSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICAgIGlmIChmbikge1xuICAgICAgZm4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVzb2x2ZShhcmcpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyksIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlamVjdChhcmcpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIFByb21pc2UucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBjbGllbnRzLCBlcnIsIGZpcnN0LCBuZXh0O1xuICAgIGlmICh0aGlzLnN0YXRlICE9PSBTVEFURV9QRU5ESU5HKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gdGhpcykge1xuICAgICAgcmV0dXJuIHRoaXMucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0F0dGVtcHQgdG8gcmVzb2x2ZSBwcm9taXNlIHdpdGggc2VsZicpKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICYmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgbmV4dCA9IHZhbHVlLnRoZW47XG4gICAgICAgIGlmICh0eXBlb2YgbmV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG5leHQuY2FsbCh2YWx1ZSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmEpIHtcbiAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5yZXNvbHZlKHJhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSh0aGlzKSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocnIpIHtcbiAgICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfdGhpcy5yZWplY3QocnIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKHRoaXMpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGVyciA9IGVycm9yO1xuICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICB0aGlzLnJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZVTEZJTExFRDtcbiAgICB0aGlzLnYgPSB2YWx1ZTtcbiAgICBpZiAoY2xpZW50cyA9IHRoaXMuYykge1xuICAgICAgc29vbiQxKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGMsIGksIGxlbjtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBjbGllbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBjID0gY2xpZW50c1tpXTtcbiAgICAgICAgICAgIHJlc29sdmVDbGllbnQoYywgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9XG4gIH07XG5cbiAgUHJvbWlzZS5wcm90b3R5cGUucmVqZWN0ID0gZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgdmFyIGNsaWVudHM7XG4gICAgaWYgKHRoaXMuc3RhdGUgIT09IFNUQVRFX1BFTkRJTkcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1JFSkVDVEVEO1xuICAgIHRoaXMudiA9IHJlYXNvbjtcbiAgICBpZiAoY2xpZW50cyA9IHRoaXMuYykge1xuICAgICAgc29vbiQxKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYywgaSwgbGVuO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBjbGllbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgYyA9IGNsaWVudHNbaV07XG4gICAgICAgICAgcmVqZWN0Q2xpZW50KGMsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoIVByb21pc2Uuc3VwcHJlc3NVbmNhdWdodFJlamVjdGlvbkVycm9yICYmIGdsb2JhbC5jb25zb2xlKSB7XG4gICAgICBnbG9iYWwuY29uc29sZS5sb2coJ0Jyb2tlbiBQcm9taXNlLCBwbGVhc2UgY2F0Y2ggcmVqZWN0aW9uczogJywgcmVhc29uLCByZWFzb24gPyByZWFzb24uc3RhY2sgOiBudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgdmFyIGEsIGNsaWVudCwgcCwgcztcbiAgICBwID0gbmV3IFByb21pc2U7XG4gICAgY2xpZW50ID0ge1xuICAgICAgeTogb25GdWxmaWxsZWQsXG4gICAgICBuOiBvblJlamVjdGVkLFxuICAgICAgcDogcFxuICAgIH07XG4gICAgaWYgKHRoaXMuc3RhdGUgPT09IFNUQVRFX1BFTkRJTkcpIHtcbiAgICAgIGlmICh0aGlzLmMpIHtcbiAgICAgICAgdGhpcy5jLnB1c2goY2xpZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYyA9IFtjbGllbnRdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzID0gdGhpcy5zdGF0ZTtcbiAgICAgIGEgPSB0aGlzLnY7XG4gICAgICBzb29uJDEoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzID09PSBTVEFURV9GVUxGSUxMRUQpIHtcbiAgICAgICAgICByZXNvbHZlQ2xpZW50KGNsaWVudCwgYSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0Q2xpZW50KGNsaWVudCwgYSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24oY2ZuKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBjZm4pO1xuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uKGNmbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oY2ZuLCBjZm4pO1xuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcywgbXNnKSB7XG4gICAgbXNnID0gbXNnIHx8ICd0aW1lb3V0JztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChFcnJvcihtc2cpKTtcbiAgICAgICAgfSwgbXMpO1xuICAgICAgICBfdGhpcy50aGVuKGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgIHJlc29sdmUodmFsKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgUHJvbWlzZS5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihjYikge1xuICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMudGhlbihmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIHZhbCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXNbXCJjYXRjaFwiXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNiKGVyciwgbnVsbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2U7XG5cbn0pKCk7XG5cbnZhciBQcm9taXNlJDIgPSBQcm9taXNlJDE7XG5cbnZhciByZXNvbHZlID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciB6O1xuICB6ID0gbmV3IFByb21pc2UkMjtcbiAgei5yZXNvbHZlKHZhbCk7XG4gIHJldHVybiB6O1xufTtcblxudmFyIHJlamVjdCA9IGZ1bmN0aW9uKGVycikge1xuICB2YXIgejtcbiAgeiA9IG5ldyBQcm9taXNlJDI7XG4gIHoucmVqZWN0KGVycik7XG4gIHJldHVybiB6O1xufTtcblxudmFyIGFsbCA9IGZ1bmN0aW9uKHBzKSB7XG4gIHZhciBpLCBqLCBsZW4sIHAsIHJjLCByZXNvbHZlUHJvbWlzZSwgcmVzdWx0cywgcmV0UDtcbiAgcmVzdWx0cyA9IFtdO1xuICByYyA9IDA7XG4gIHJldFAgPSBuZXcgUHJvbWlzZSQyKCk7XG4gIHJlc29sdmVQcm9taXNlID0gZnVuY3Rpb24ocCwgaSkge1xuICAgIGlmICghcCB8fCB0eXBlb2YgcC50aGVuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwID0gcmVzb2x2ZShwKTtcbiAgICB9XG4gICAgcC50aGVuKGZ1bmN0aW9uKHl2KSB7XG4gICAgICByZXN1bHRzW2ldID0geXY7XG4gICAgICByYysrO1xuICAgICAgaWYgKHJjID09PSBwcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0UC5yZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uKG52KSB7XG4gICAgICByZXRQLnJlamVjdChudik7XG4gICAgfSk7XG4gIH07XG4gIGZvciAoaSA9IGogPSAwLCBsZW4gPSBwcy5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICBwID0gcHNbaV07XG4gICAgcmVzb2x2ZVByb21pc2UocCwgaSk7XG4gIH1cbiAgaWYgKCFwcy5sZW5ndGgpIHtcbiAgICByZXRQLnJlc29sdmUocmVzdWx0cyk7XG4gIH1cbiAgcmV0dXJuIHJldFA7XG59O1xuXG52YXIgcmVmbGVjdCA9IGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlJDIoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmUobmV3IFByb21pc2VJbnNwZWN0aW9uJDEoe1xuICAgICAgICBzdGF0ZTogJ2Z1bGZpbGxlZCcsXG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgfSkpO1xuICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24oZXJyKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShuZXcgUHJvbWlzZUluc3BlY3Rpb24kMSh7XG4gICAgICAgIHN0YXRlOiAncmVqZWN0ZWQnLFxuICAgICAgICByZWFzb246IGVyclxuICAgICAgfSkpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbnZhciBzZXR0bGUgPSBmdW5jdGlvbihwcm9taXNlcykge1xuICByZXR1cm4gYWxsKHByb21pc2VzLm1hcChyZWZsZWN0KSk7XG59O1xuXG5Qcm9taXNlJDIuYWxsID0gYWxsO1xuXG5Qcm9taXNlJDIucmVmbGVjdCA9IHJlZmxlY3Q7XG5cblByb21pc2UkMi5yZWplY3QgPSByZWplY3Q7XG5cblByb21pc2UkMi5yZXNvbHZlID0gcmVzb2x2ZTtcblxuUHJvbWlzZSQyLnNldHRsZSA9IHNldHRsZTtcblxuUHJvbWlzZSQyLnNvb24gPSBzb29uJDE7XG5cbmV4cG9ydCBkZWZhdWx0IFByb21pc2UkMjtcbiIsIi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMS4zXG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHR2YXIgcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gZmFsc2U7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAoIXJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcikge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdyaXRlXG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YXIgZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMoZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gZXhwaXJlcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0XHRpZiAoIWNvbnZlcnRlci53cml0ZSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IFtcblx0XHRcdFx0XHRrZXksICc9JywgdmFsdWUsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID8gJzsgZXhwaXJlcz0nICsgYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJywgLy8gdXNlIGV4cGlyZXMgYXR0cmlidXRlLCBtYXgtYWdlIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLnBhdGggPyAnOyBwYXRoPScgKyBhdHRyaWJ1dGVzLnBhdGggOiAnJyxcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmRvbWFpbiA/ICc7IGRvbWFpbj0nICsgYXR0cmlidXRlcy5kb21haW4gOiAnJyxcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLnNlY3VyZSA/ICc7IHNlY3VyZScgOiAnJ1xuXHRcdFx0XHRdLmpvaW4oJycpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVhZFxuXG5cdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRyZXN1bHQgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheVxuXHRcdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuXG5cdFx0XHQvLyBjYWxsaW5nIFwiZ2V0KClcIlxuXHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcblx0XHRcdHZhciByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nO1xuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHRmb3IgKDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBhcnRzID0gY29va2llc1tpXS5zcGxpdCgnPScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG5cdFx0XHRcdGlmIChjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llLnNsaWNlKDEsIC0xKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBwYXJ0c1swXS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdFx0Y29va2llID0gY29udmVydGVyLnJlYWQgP1xuXHRcdFx0XHRcdFx0Y29udmVydGVyLnJlYWQoY29va2llLCBuYW1lKSA6IGNvbnZlcnRlcihjb29raWUsIG5hbWUpIHx8XG5cdFx0XHRcdFx0XHRjb29raWUucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBjb29raWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gY29va2llO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gYXBpO1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gYXBpLmNhbGwoYXBpLCBrZXkpO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gYXBpLmFwcGx5KHtcblx0XHRcdFx0anNvbjogdHJ1ZVxuXHRcdFx0fSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHR9O1xuXHRcdGFwaS5kZWZhdWx0cyA9IHt9O1xuXG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdGFwaShrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkud2l0aENvbnZlcnRlciA9IGluaXQ7XG5cblx0XHRyZXR1cm4gYXBpO1xuXHR9XG5cblx0cmV0dXJuIGluaXQoZnVuY3Rpb24gKCkge30pO1xufSkpO1xuIiwiWGhyICAgICAgICAgPSByZXF1aXJlICd4aHItcHJvbWlzZS1lczYnXG5YaHIuUHJvbWlzZSA9IHJlcXVpcmUgJ2Jyb2tlbidcblxuY29va2llID0gcmVxdWlyZSAnanMtY29va2llJ1xuXG57aXNGdW5jdGlvbiwgbmV3RXJyb3IsIHVwZGF0ZVF1ZXJ5fSA9IHJlcXVpcmUgJy4uL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFhockNsaWVudFxuICBkZWJ1ZzogICAgICAgZmFsc2VcbiAgZW5kcG9pbnQ6ICAgICdodHRwczovL2FwaS5oYW56by5pbydcbiAgc2Vzc2lvbk5hbWU6ICdobnpvJ1xuXG4gIGNvbnN0cnVjdG9yOiAob3B0cyA9IHt9KSAtPlxuICAgIHJldHVybiBuZXcgWGhyQ2xpZW50IG9wdHMgdW5sZXNzIEAgaW5zdGFuY2VvZiBYaHJDbGllbnRcblxuICAgIHtAa2V5LCBAZGVidWd9ID0gb3B0c1xuXG4gICAgaWYgb3B0cy5lbmRwb2ludFxuICAgICAgQHNldEVuZHBvaW50IG9wdHMuZW5kcG9pbnRcblxuICAgIEBnZXRDdXN0b21lclRva2VuKClcblxuICBzZXRFbmRwb2ludDogKGVuZHBvaW50KSAtPlxuICAgIEBlbmRwb2ludCA9IGVuZHBvaW50LnJlcGxhY2UgL1xcLyQvLCAnJ1xuXG4gIHNldFN0b3JlOiAoaWQpIC0+XG4gICAgQHN0b3JlSWQgPSBpZFxuXG4gIHNldEtleTogKGtleSkgLT5cbiAgICBAa2V5ID0ga2V5XG5cbiAgZ2V0S2V5OiAtPlxuICAgIEBrZXkgb3IgQGNvbnN0cnVjdG9yLktFWVxuXG4gIGdldEN1c3RvbWVyVG9rZW46IC0+XG4gICAgaWYgKHNlc3Npb24gPSBjb29raWUuZ2V0SlNPTiBAc2Vzc2lvbk5hbWUpP1xuICAgICAgQGN1c3RvbWVyVG9rZW4gPSBzZXNzaW9uLmN1c3RvbWVyVG9rZW4gaWYgc2Vzc2lvbi5jdXN0b21lclRva2VuP1xuICAgIEBjdXN0b21lclRva2VuXG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBjb29raWUuc2V0IEBzZXNzaW9uTmFtZSwge2N1c3RvbWVyVG9rZW46IGtleX0sIGV4cGlyZXM6IDcgKiAyNCAqIDM2MDAgKiAxMDAwXG4gICAgQGN1c3RvbWVyVG9rZW4gPSBrZXlcblxuICBkZWxldGVDdXN0b21lclRva2VuOiAtPlxuICAgIGNvb2tpZS5zZXQgQHNlc3Npb25OYW1lLCB7Y3VzdG9tZXJUb2tlbjogbnVsbH0sIGV4cGlyZXM6IDcgKiAyNCAqIDM2MDAgKiAxMDAwXG4gICAgQGN1c3RvbWVyVG9rZW4gPSBudWxsXG5cbiAgZ2V0VXJsOiAodXJsLCBkYXRhLCBrZXkpIC0+XG4gICAgaWYgaXNGdW5jdGlvbiB1cmxcbiAgICAgIHVybCA9IHVybC5jYWxsIEAsIGRhdGFcblxuICAgIHVwZGF0ZVF1ZXJ5IChAZW5kcG9pbnQgKyB1cmwpLCB0b2tlbjoga2V5XG5cbiAgcmVxdWVzdDogKGJsdWVwcmludCwgZGF0YT17fSwga2V5ID0gQGdldEtleSgpKSAtPlxuICAgIG9wdHMgPVxuICAgICAgdXJsOiAgICBAZ2V0VXJsIGJsdWVwcmludC51cmwsIGRhdGEsIGtleVxuICAgICAgbWV0aG9kOiBibHVlcHJpbnQubWV0aG9kXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kICE9ICdHRVQnXG4gICAgICBvcHRzLmhlYWRlcnMgPVxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cbiAgICBpZiBibHVlcHJpbnQubWV0aG9kID09ICdHRVQnXG4gICAgICBvcHRzLnVybCAgPSB1cGRhdGVRdWVyeSBvcHRzLnVybCwgZGF0YVxuICAgIGVsc2VcbiAgICAgIG9wdHMuZGF0YSA9IEpTT04uc3RyaW5naWZ5IGRhdGFcblxuICAgIGlmIEBkZWJ1Z1xuICAgICAgY29uc29sZS5sb2cgJy0tS0VZLS0nXG4gICAgICBjb25zb2xlLmxvZyBrZXlcbiAgICAgIGNvbnNvbGUubG9nICctLVJFUVVFU1QtLSdcbiAgICAgIGNvbnNvbGUubG9nIG9wdHNcblxuICAgIChuZXcgWGhyKS5zZW5kIG9wdHNcbiAgICAgIC50aGVuIChyZXMpIC0+XG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgIGNvbnNvbGUubG9nICctLVJFU1BPTlNFLS0nXG4gICAgICAgICAgY29uc29sZS5sb2cgcmVzXG5cbiAgICAgICAgcmVzLmRhdGEgICA9IHJlcy5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzXG4gICAgICAuY2F0Y2ggKHJlcykgLT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgcmVzLmRhdGEgICA9IHJlcy5yZXNwb25zZVRleHQgPyAoSlNPTi5wYXJzZSByZXMueGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgY2F0Y2ggZXJyXG5cbiAgICAgICAgZXJyID0gbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgIGlmIEBkZWJ1Z1xuICAgICAgICAgIGNvbnNvbGUubG9nICctLVJFU1BPTlNFLS0nXG4gICAgICAgICAgY29uc29sZS5sb2cgcmVzXG4gICAgICAgICAgY29uc29sZS5sb2cgJ0VSUk9SOicsIGVyclxuXG4gICAgICAgIHRocm93IGVyclxuIiwie2lzRnVuY3Rpb259ID0gcmVxdWlyZSAnLi4vdXRpbHMnXG5cbiMgV3JhcCBhIHVybCBmdW5jdGlvbiB0byBwcm92aWRlIHN0b3JlLXByZWZpeGVkIFVSTHNcbmV4cG9ydHMuc3RvcmVQcmVmaXhlZCA9IHNwID0gKHUpIC0+XG4gICh4KSAtPlxuICAgIGlmIGlzRnVuY3Rpb24gdVxuICAgICAgdXJsID0gdSB4XG4gICAgZWxzZVxuICAgICAgdXJsID0gdVxuXG4gICAgaWYgQHN0b3JlSWQ/XG4gICAgICBcIi9zdG9yZS8je0BzdG9yZUlkfVwiICsgdXJsXG4gICAgZWxzZVxuICAgICAgdXJsXG5cbiMgUmV0dXJucyBhIFVSTCBmb3IgZ2V0dGluZyBhIHNpbmdsZVxuZXhwb3J0cy5ieUlkID0gKG5hbWUpIC0+XG4gIHN3aXRjaCBuYW1lXG4gICAgd2hlbiAnY291cG9uJ1xuICAgICAgc3AgKHgpIC0+IFwiL2NvdXBvbi8je3guY29kZSA/IHh9XCJcbiAgICB3aGVuICdjb2xsZWN0aW9uJ1xuICAgICAgc3AgKHgpIC0+IFwiL2NvbGxlY3Rpb24vI3t4LnNsdWcgPyB4fVwiXG4gICAgd2hlbiAncHJvZHVjdCdcbiAgICAgIHNwICh4KSAtPiBcIi9wcm9kdWN0LyN7eC5pZCA/IHguc2x1ZyA/IHh9XCJcbiAgICB3aGVuICd2YXJpYW50J1xuICAgICAgc3AgKHgpIC0+IFwiL3ZhcmlhbnQvI3t4LmlkID8geC5za3UgPyB4fVwiXG4gICAgd2hlbiAnc2l0ZSdcbiAgICAgICh4KSAtPiBcIi9zaXRlLyN7eC5pZCA/IHgubmFtZSA/IHh9XCJcbiAgICBlbHNlXG4gICAgICAoeCkgLT4gXCIvI3tuYW1lfS8je3guaWQgPyB4fVwiXG4iLCJ7XG4gIGlzRnVuY3Rpb25cbiAgc3RhdHVzQ3JlYXRlZFxuICBzdGF0dXNOb0NvbnRlbnRcbiAgc3RhdHVzT2tcbn0gPSByZXF1aXJlICcuLi91dGlscydcblxue2J5SWQsIHN0b3JlUHJlZml4ZWR9ID0gcmVxdWlyZSAnLi91cmwnXG5cbiMgT25seSBsaXN0LCBnZXQgbWV0aG9kcyBvZiBhIGZldyBtb2RlbHMgYXJlIHN1cHBvcnRlZCB3aXRoIGEgcHVibGlzaGFibGUga2V5LFxuIyBzbyBvbmx5IHRoZXNlIG1ldGhvZHMgYXJlIGV4cG9zZWQgaW4gdGhlIGJyb3dzZXIuXG5jcmVhdGVCbHVlcHJpbnQgPSAobmFtZSkgLT5cbiAgZW5kcG9pbnQgPSBcIi8je25hbWV9XCJcblxuICBsaXN0OlxuICAgIHVybDogICAgIGVuZHBvaW50XG4gICAgbWV0aG9kOiAgJ0dFVCdcbiAgICBleHBlY3RzOiBzdGF0dXNPa1xuICBnZXQ6XG4gICAgdXJsOiAgICAgYnlJZCBuYW1lXG4gICAgbWV0aG9kOiAgJ0dFVCdcbiAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG5ibHVlcHJpbnRzID1cbiAgIyBBQ0NPVU5UXG4gIGFjY291bnQ6XG4gICAgZ2V0OlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50J1xuICAgICAgbWV0aG9kOiAgJ0dFVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICB1cGRhdGU6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQnXG4gICAgICBtZXRob2Q6ICAnUEFUQ0gnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgdXNlQ3VzdG9tZXJUb2tlbjogdHJ1ZVxuXG4gICAgZXhpc3RzOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvZXhpc3RzLyN7eC5lbWFpbCA/IHgudXNlcm5hbWUgPyB4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgJ0dFVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICBwcm9jZXNzOiAocmVzKSAtPiByZXMuZGF0YS5leGlzdHNcblxuICAgIGNyZWF0ZTpcbiAgICAgIHVybDogICAgICcvYWNjb3VudC9jcmVhdGUnXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGVuYWJsZTpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2VuYWJsZS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIGxvZ2luOlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50L2xvZ2luJ1xuICAgICAgbWV0aG9kOiAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgcHJvY2VzczogKHJlcykgLT5cbiAgICAgICAgQHNldEN1c3RvbWVyVG9rZW4gcmVzLmRhdGEudG9rZW5cbiAgICAgICAgcmVzXG5cbiAgICBsb2dvdXQ6IC0+XG4gICAgICBAZGVsZXRlQ3VzdG9tZXJUb2tlbigpXG5cbiAgICByZXNldDpcbiAgICAgIHVybDogICAgICcvYWNjb3VudC9yZXNldCdcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIHVwZGF0ZU9yZGVyOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvb3JkZXIvI3t4Lm9yZGVySWQgPyB4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgJ1BBVENIJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIGNvbmZpcm06XG4gICAgICB1cmw6ICAgICAoeCkgLT4gXCIvYWNjb3VudC9jb25maXJtLyN7eC50b2tlbklkID8geH1cIlxuICAgICAgbWV0aG9kOiAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgdXNlQ3VzdG9tZXJUb2tlbjogdHJ1ZVxuXG4gICMgQ0FSVFxuICBjYXJ0OlxuICAgIGNyZWF0ZTpcbiAgICAgIHVybDogICAgICAnL2NhcnQnXG4gICAgICBtZXRob2Q6ICAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiAgc3RhdHVzQ3JlYXRlZFxuICAgIHVwZGF0ZTpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAgJ1BBVENIJ1xuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG4gICAgZGlzY2FyZDpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fS9kaXNjYXJkXCJcbiAgICAgIG1ldGhvZDogICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuICAgIHNldDpcbiAgICAgIHVybDogICAgICAoeCkgLT4gXCIvY2FydC8je3guaWQgPyB4fS9zZXRcIlxuICAgICAgbWV0aG9kOiAgICdQT1NUJ1xuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG5cbiAgIyBSRVZJRVdTXG4gIHJldmlldzpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAgJy9yZXZpZXcnXG4gICAgICBtZXRob2Q6ICAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiAgc3RhdHVzQ3JlYXRlZFxuICAgIGdldDpcbiAgICAgIHVybDogICAgICAoeCktPiBcIi9yZXZpZXcvI3t4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgICdHRVQnXG4gICAgICBleHBlY3RzOiAgc3RhdHVzT2tcblxuICAjIENIRUNLT1VUXG4gIGNoZWNrb3V0OlxuICAgIGF1dGhvcml6ZTpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgJy9jaGVja291dC9hdXRob3JpemUnXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjYXB0dXJlOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAoeCkgLT4gXCIvY2hlY2tvdXQvY2FwdHVyZS8je3gub3JkZXJJZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAgIGNoYXJnZTpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgJy9jaGVja291dC9jaGFyZ2UnXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBwYXlwYWw6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvcGF5cGFsJ1xuICAgICAgbWV0aG9kOiAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICMgUkVGRVJSRVJcbiAgcmVmZXJyZXI6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgJy9yZWZlcnJlcidcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzQ3JlYXRlZFxuXG4gICAgZ2V0OlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL3JlZmVycmVyLyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICdHRVQnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4jIE1PREVMU1xubW9kZWxzID0gW1xuICAnY29sbGVjdGlvbidcbiAgJ2NvdXBvbidcbiAgJ3Byb2R1Y3QnXG4gICd2YXJpYW50J1xuXVxuXG5mb3IgbW9kZWwgaW4gbW9kZWxzXG4gIGRvIChtb2RlbCkgLT5cbiAgICBibHVlcHJpbnRzW21vZGVsXSA9IGNyZWF0ZUJsdWVwcmludCBtb2RlbFxuXG5tb2R1bGUuZXhwb3J0cyA9IGJsdWVwcmludHNcbiIsImdsb2JhbC5IYW56byA/PSB7fVxuXG5BcGkgICAgPSByZXF1aXJlICcuL2FwaSdcbkNsaWVudCA9IHJlcXVpcmUgJy4vY2xpZW50L3hocidcblxuQXBpLkNMSUVOVCAgICAgPSBDbGllbnRcbkFwaS5CTFVFUFJJTlRTID0gcmVxdWlyZSAnLi9ibHVlcHJpbnRzL2Jyb3dzZXInXG5cbkhhbnpvLkFwaSAgICA9IEFwaVxuSGFuem8uQ2xpZW50ID0gQ2xpZW50XG5cbm1vZHVsZS5leHBvcnRzID0gSGFuem9cbiJdLCJuYW1lcyI6WyJBcGkiLCJyZXF1aXJlJCQwIiwiaXNGdW5jdGlvbiIsInRvU3RyaW5nIiwiZm9yRWFjaCIsInJlcXVpcmUkJDEiLCJoYXNPd25Qcm9wZXJ0eSIsImdsb2JhbCIsImRlZmluZSIsInJlcXVpcmUkJDIiLCJyZWYiLCJyZXF1aXJlJCQzIiwibmV3RXJyb3IiLCJ1cGRhdGVRdWVyeSIsInN0YXR1c0NyZWF0ZWQiLCJzdGF0dXNOb0NvbnRlbnQiLCJzdGF0dXNPayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFBOztBQUFBLG1CQUFxQixTQUFDLEVBQUQ7U0FBUSxPQUFPLEVBQVAsS0FBYTs7O0FBQzFDLGlCQUFxQixTQUFDLENBQUQ7U0FBUSxPQUFPLENBQVAsS0FBYTs7O0FBRzFDLGlCQUEwQixTQUFDLEdBQUQ7U0FBUyxHQUFHLENBQUMsTUFBSixLQUFjOzs7QUFDakQsb0JBQTBCLFNBQUMsR0FBRDtTQUFTLEdBQUcsQ0FBQyxNQUFKLEtBQWM7OztBQUNqRCxzQkFBMEIsU0FBQyxHQUFEO1NBQVMsR0FBRyxDQUFDLE1BQUosS0FBYzs7O0FBR2pELGlCQUFtQixTQUFDLElBQUQsRUFBTyxHQUFQLEVBQWlCLEdBQWpCO01BQ2pCOztJQUR3QixNQUFNOztFQUM5QixPQUFBLDJJQUFzQztFQUV0QyxJQUFPLFdBQVA7SUFDRSxHQUFBLEdBQU0sSUFBSSxLQUFKLENBQVUsT0FBVjtJQUNOLEdBQUcsQ0FBQyxPQUFKLEdBQWMsUUFGaEI7O0VBSUEsR0FBRyxDQUFDLEdBQUosR0FBbUI7RUFDbkIsR0FBRyxDQUFDLElBQUosR0FBbUIsR0FBRyxDQUFDO0VBQ3ZCLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLEdBQUcsQ0FBQztFQUN2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
