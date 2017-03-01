this.Hanzo = this.Hanzo || {};
this.Hanzo.js = (function () {
'use strict';

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



var newError = function(data, res, err) {
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

var Api;

Api = (function() {
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

var Api$1 = Api;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
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

var index$5 = isFunction$2;

var toString$1 = Object.prototype.toString;

function isFunction$2 (fn) {
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

var isFunction$1 = index$5;

var index$3 = forEach$1;

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function forEach$1(list, iterator, context) {
    if (!isFunction$1(iterator)) {
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

var trim = index$1;
var forEach = index$3;
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

var index$7 = Object.assign || function (target, source) {
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

objectAssign = index$7;


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

var XhrClient;

index.Promise = Promise$2;

XhrClient = (function() {
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
    if ((session = js_cookie.getJSON(this.sessionName)) != null) {
      if (session.customerToken != null) {
        this.customerToken = session.customerToken;
      }
    }
    return this.customerToken;
  };

  XhrClient.prototype.setCustomerToken = function(key) {
    js_cookie.set(this.sessionName, {
      customerToken: key
    }, {
      expires: 7 * 24 * 3600 * 1000
    });
    return this.customerToken = key;
  };

  XhrClient.prototype.deleteCustomerToken = function() {
    js_cookie.set(this.sessionName, {
      customerToken: null
    }, {
      expires: 7 * 24 * 3600 * 1000
    });
    return this.customerToken = null;
  };

  XhrClient.prototype.getUrl = function(url, data, key) {
    if (isFunction(url)) {
      url = url.call(this, data);
    }
    return updateQuery(this.endpoint + url, {
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
      opts.url = updateQuery(opts.url, data);
    } else {
      opts.data = JSON.stringify(data);
    }
    if (this.debug) {
      console.log('--KEY--');
      console.log(key);
      console.log('--REQUEST--');
      console.log(opts);
    }
    return (new index).send(opts).then(function(res) {
      if (this.debug) {
        console.log('--RESPONSE--');
        console.log(res);
      }
      res.data = res.responseText;
      return res;
    })["catch"](function(res) {
      var err, ref;
      try {
        res.data = (ref = res.responseText) != null ? ref : JSON.parse(res.xhr.responseText);
      } catch (error) {
        err = error;
      }
      err = newError(data, res);
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

var Client = XhrClient;

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
      method: 'GET',
      expects: statusOk
    },
    get: {
      url: byId(name),
      method: 'GET',
      expects: statusOk
    }
  };
};

blueprints = {
  account: {
    get: {
      url: '/account',
      method: 'GET',
      expects: statusOk,
      useCustomerToken: true
    },
    update: {
      url: '/account',
      method: 'PATCH',
      expects: statusOk,
      useCustomerToken: true
    },
    exists: {
      url: function(x) {
        var ref, ref1, ref2;
        return "/account/exists/" + ((ref = (ref1 = (ref2 = x.email) != null ? ref2 : x.username) != null ? ref1 : x.id) != null ? ref : x);
      },
      method: 'GET',
      expects: statusOk,
      process: function(res) {
        return res.data.exists;
      }
    },
    create: {
      url: '/account/create',
      method: 'POST',
      expects: statusCreated
    },
    enable: {
      url: function(x) {
        var ref;
        return "/account/enable/" + ((ref = x.tokenId) != null ? ref : x);
      },
      method: 'POST',
      expects: statusOk
    },
    login: {
      url: '/account/login',
      method: 'POST',
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
      method: 'POST',
      expects: statusOk,
      useCustomerToken: true
    },
    updateOrder: {
      url: function(x) {
        var ref, ref1;
        return "/account/order/" + ((ref = (ref1 = x.orderId) != null ? ref1 : x.id) != null ? ref : x);
      },
      method: 'PATCH',
      expects: statusOk,
      useCustomerToken: true
    },
    confirm: {
      url: function(x) {
        var ref;
        return "/account/confirm/" + ((ref = x.tokenId) != null ? ref : x);
      },
      method: 'POST',
      expects: statusOk,
      useCustomerToken: true
    }
  },
  cart: {
    create: {
      url: '/cart',
      method: 'POST',
      expects: statusCreated
    },
    update: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x);
      },
      method: 'PATCH',
      expects: statusOk
    },
    discard: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x) + "/discard";
      },
      method: 'POST',
      expects: statusOk
    },
    set: {
      url: function(x) {
        var ref;
        return "/cart/" + ((ref = x.id) != null ? ref : x) + "/set";
      },
      method: 'POST',
      expects: statusOk
    }
  },
  review: {
    create: {
      url: '/review',
      method: 'POST',
      expects: statusCreated
    },
    get: {
      url: function(x) {
        var ref;
        return "/review/" + ((ref = x.id) != null ? ref : x);
      },
      method: 'GET',
      expects: statusOk
    }
  },
  checkout: {
    authorize: {
      url: storePrefixed('/checkout/authorize'),
      method: 'POST',
      expects: statusOk
    },
    capture: {
      url: storePrefixed(function(x) {
        var ref;
        return "/checkout/capture/" + ((ref = x.orderId) != null ? ref : x);
      }),
      method: 'POST',
      expects: statusOk
    },
    charge: {
      url: storePrefixed('/checkout/charge'),
      method: 'POST',
      expects: statusOk
    },
    paypal: {
      url: storePrefixed('/checkout/paypal'),
      method: 'POST',
      expects: statusOk
    }
  },
  referrer: {
    create: {
      url: '/referrer',
      method: 'POST',
      expects: statusCreated
    },
    get: {
      url: function(x) {
        var ref;
        return "/referrer/" + ((ref = x.id) != null ? ref : x);
      },
      method: 'GET',
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

var Hanzo;

Hanzo = {
  Api: Api$1,
  Client: Client,
  blueprints: blueprints$1
};

var Hanzo$1 = Hanzo;

return Hanzo$1;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuem8uanMiLCJzb3VyY2VzIjpbInNyYy91dGlscy5jb2ZmZWUiLCJzcmMvYXBpLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci1wcm9taXNlLWVzNi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJva2VuL2Rpc3QvYnJva2VuLm1qcyIsIm5vZGVfbW9kdWxlcy9qcy1jb29raWUvc3JjL2pzLmNvb2tpZS5qcyIsInNyYy9jbGllbnQvYnJvd3Nlci5jb2ZmZWUiLCJzcmMvYmx1ZXByaW50cy91cmwuY29mZmVlIiwic3JjL2JsdWVwcmludHMvYnJvd3Nlci5jb2ZmZWUiLCJzcmMvYnJvd3Nlci5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyBIZWxwZXJzXG5leHBvcnQgaXNGdW5jdGlvbiA9IChmbikgLT4gdHlwZW9mIGZuIGlzICdmdW5jdGlvbidcbmV4cG9ydCBpc1N0cmluZyAgID0gKHMpICAtPiB0eXBlb2YgcyAgaXMgJ3N0cmluZydcblxuIyBGZXcgc3RhdHVzIGNvZGVzIHdlIHVzZSB0aHJvdWdob3V0IGNvZGUgYmFzZVxuZXhwb3J0IHN0YXR1c09rICAgICAgICA9IChyZXMpIC0+IHJlcy5zdGF0dXMgaXMgMjAwXG5leHBvcnQgc3RhdHVzQ3JlYXRlZCAgID0gKHJlcykgLT4gcmVzLnN0YXR1cyBpcyAyMDFcbmV4cG9ydCBzdGF0dXNOb0NvbnRlbnQgPSAocmVzKSAtPiByZXMuc3RhdHVzIGlzIDIwNFxuXG4jIFRocm93IFwiZmF0XCIgZXJyb3JzLlxuZXhwb3J0IG5ld0Vycm9yID0gKGRhdGEsIHJlcyA9IHt9LCBlcnIpIC0+XG4gIG1lc3NhZ2UgPSByZXM/LmRhdGE/LmVycm9yPy5tZXNzYWdlID8gJ1JlcXVlc3QgZmFpbGVkJ1xuXG4gIHVubGVzcyBlcnI/XG4gICAgZXJyID0gbmV3IEVycm9yIG1lc3NhZ2VcbiAgICBlcnIubWVzc2FnZSA9IG1lc3NhZ2VcblxuICBlcnIucmVxICAgICAgICAgID0gZGF0YVxuICBlcnIuZGF0YSAgICAgICAgID0gcmVzLmRhdGFcbiAgZXJyLnJlc3BvbnNlVGV4dCA9IHJlcy5kYXRhXG4gIGVyci5zdGF0dXMgICAgICAgPSByZXMuc3RhdHVzXG4gIGVyci50eXBlICAgICAgICAgPSByZXMuZGF0YT8uZXJyb3I/LnR5cGVcbiAgZXJyXG5cbnVwZGF0ZVBhcmFtID0gKHVybCwga2V5LCB2YWx1ZSkgLT5cbiAgcmUgPSBuZXcgUmVnRXhwKCcoWz8mXSknICsga2V5ICsgJz0uKj8oJnwjfCQpKC4qKScsICdnaScpXG5cbiAgaWYgcmUudGVzdCB1cmxcbiAgICBpZiB2YWx1ZT9cbiAgICAgIHVybC5yZXBsYWNlIHJlLCAnJDEnICsga2V5ICsgJz0nICsgdmFsdWUgKyAnJDIkMydcbiAgICBlbHNlXG4gICAgICBoYXNoID0gdXJsLnNwbGl0ICcjJ1xuICAgICAgdXJsID0gaGFzaFswXS5yZXBsYWNlKHJlLCAnJDEkMycpLnJlcGxhY2UoLygmfFxcPykkLywgJycpXG4gICAgICB1cmwgKz0gJyMnICsgaGFzaFsxXSBpZiBoYXNoWzFdP1xuICAgICAgdXJsXG4gIGVsc2VcbiAgICBpZiB2YWx1ZT9cbiAgICAgIHNlcGFyYXRvciA9IGlmIHVybC5pbmRleE9mKCc/JykgIT0gLTEgdGhlbiAnJicgZWxzZSAnPydcbiAgICAgIGhhc2ggPSB1cmwuc3BsaXQgJyMnXG4gICAgICB1cmwgPSBoYXNoWzBdICsgc2VwYXJhdG9yICsga2V5ICsgJz0nICsgdmFsdWVcbiAgICAgIHVybCArPSAnIycgKyBoYXNoWzFdIGlmIGhhc2hbMV0/XG4gICAgICB1cmxcbiAgICBlbHNlXG4gICAgICB1cmxcblxuIyBVcGRhdGUgcXVlcnkgb24gdXJsXG5leHBvcnQgdXBkYXRlUXVlcnkgPSAodXJsLCBkYXRhKSAtPlxuICByZXR1cm4gdXJsIGlmIHR5cGVvZiBkYXRhICE9ICdvYmplY3QnXG5cbiAgZm9yIGssdiBvZiBkYXRhXG4gICAgdXJsID0gdXBkYXRlUGFyYW0gdXJsLCBrLCB2XG4gIHVybFxuIiwiaW1wb3J0IHtpc0Z1bmN0aW9uLCBpc1N0cmluZywgbmV3RXJyb3IsIHN0YXR1c09rfSBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBBcGlcbiAgQEJMVUVQUklOVFMgPSB7fVxuICBAQ0xJRU5UICAgICA9IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKG9wdHMgPSB7fSkgLT5cbiAgICByZXR1cm4gbmV3IEFwaSBvcHRzIHVubGVzcyBAIGluc3RhbmNlb2YgQXBpXG5cbiAgICB7ZW5kcG9pbnQsIGRlYnVnLCBrZXksIGNsaWVudCwgYmx1ZXByaW50c30gPSBvcHRzXG5cbiAgICBAZGVidWcgICAgICA9IGRlYnVnXG4gICAgYmx1ZXByaW50cyA/PSBAY29uc3RydWN0b3IuQkxVRVBSSU5UU1xuXG4gICAgaWYgY2xpZW50XG4gICAgICBAY2xpZW50ID0gY2xpZW50XG4gICAgZWxzZVxuICAgICAgQGNsaWVudCA9IG5ldyBAY29uc3RydWN0b3IuQ0xJRU5UXG4gICAgICAgIGRlYnVnOiAgICBkZWJ1Z1xuICAgICAgICBlbmRwb2ludDogZW5kcG9pbnRcbiAgICAgICAga2V5OiAgICAgIGtleVxuXG4gICAgQGFkZEJsdWVwcmludHMgaywgdiBmb3IgaywgdiBvZiBibHVlcHJpbnRzXG5cbiAgYWRkQmx1ZXByaW50czogKGFwaSwgYmx1ZXByaW50cykgLT5cbiAgICBAW2FwaV0gPz0ge31cblxuICAgIGZvciBuYW1lLCBicCBvZiBibHVlcHJpbnRzXG4gICAgICBkbyAobmFtZSwgYnApID0+XG4gICAgICAgICMgTm9ybWFsIG1ldGhvZFxuICAgICAgICBpZiBpc0Z1bmN0aW9uIGJwXG4gICAgICAgICAgcmV0dXJuIEBbYXBpXVtuYW1lXSA9ID0+IGJwLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICAgICAgICMgQmx1ZXByaW50IG1ldGhvZFxuICAgICAgICBicC5leHBlY3RzID89IHN0YXR1c09rXG4gICAgICAgIGJwLm1ldGhvZCAgPz0gJ1BPU1QnICAjIERlZmF1bHRpbmcgdG8gUE9TVCBzaGF2ZXMgYSBmZXcga2Igb2ZmIGJyb3dzZXIgYnVuZGxlXG5cbiAgICAgICAgbWV0aG9kID0gKGRhdGEsIGNiKSA9PlxuICAgICAgICAgIGtleSA9IHVuZGVmaW5lZFxuICAgICAgICAgIGlmIGJwLnVzZUN1c3RvbWVyVG9rZW5cbiAgICAgICAgICAgIGtleSA9IEBjbGllbnQuZ2V0Q3VzdG9tZXJUb2tlbigpXG4gICAgICAgICAgQGNsaWVudC5yZXF1ZXN0IGJwLCBkYXRhLCBrZXlcbiAgICAgICAgICAgIC50aGVuIChyZXMpID0+XG4gICAgICAgICAgICAgIGlmIHJlcy5kYXRhPy5lcnJvcj9cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXdFcnJvciBkYXRhLCByZXNcbiAgICAgICAgICAgICAgdW5sZXNzIGJwLmV4cGVjdHMgcmVzXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3RXJyb3IgZGF0YSwgcmVzXG4gICAgICAgICAgICAgIGlmIGJwLnByb2Nlc3M/XG4gICAgICAgICAgICAgICAgYnAucHJvY2Vzcy5jYWxsIEAsIHJlc1xuICAgICAgICAgICAgICByZXMuZGF0YSA/IHJlcy5ib2R5XG4gICAgICAgICAgICAuY2FsbGJhY2sgY2JcblxuICAgICAgICBAW2FwaV1bbmFtZV0gPSBtZXRob2RcbiAgICByZXR1cm5cblxuICBzZXRLZXk6IChrZXkpIC0+XG4gICAgQGNsaWVudC5zZXRLZXkga2V5XG5cbiAgc2V0Q3VzdG9tZXJUb2tlbjogKGtleSkgLT5cbiAgICBAY2xpZW50LnNldEN1c3RvbWVyVG9rZW4ga2V5XG5cbiAgZGVsZXRlQ3VzdG9tZXJUb2tlbjogLT5cbiAgICBAY2xpZW50LmRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gIHNldFN0b3JlOiAoaWQpIC0+XG4gICAgQHN0b3JlSWQgPSBpZFxuICAgIEBjbGllbnQuc2V0U3RvcmUgaWRcblxuZXhwb3J0IGRlZmF1bHQgQXBpXG4iLCJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHRyaW07XG5cbmZ1bmN0aW9uIHRyaW0oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG59XG5cbmV4cG9ydHMubGVmdCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJyk7XG59O1xuXG5leHBvcnRzLnJpZ2h0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb25cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uIChmbikge1xuICB2YXIgc3RyaW5nID0gdG9TdHJpbmcuY2FsbChmbilcbiAgcmV0dXJuIHN0cmluZyA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJyB8fFxuICAgICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgc3RyaW5nICE9PSAnW29iamVjdCBSZWdFeHBdJykgfHxcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgLy8gSUU4IGFuZCBiZWxvd1xuICAgICAoZm4gPT09IHdpbmRvdy5zZXRUaW1lb3V0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmFsZXJ0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmNvbmZpcm0gfHxcbiAgICAgIGZuID09PSB3aW5kb3cucHJvbXB0KSlcbn07XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2lzLWZ1bmN0aW9uJylcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcblxuZnVuY3Rpb24gZm9yRWFjaChsaXN0LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXNGdW5jdGlvbihpdGVyYXRvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaXRlcmF0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICB9XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgY29udGV4dCA9IHRoaXNcbiAgICB9XG4gICAgXG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobGlzdCkgPT09ICdbb2JqZWN0IEFycmF5XScpXG4gICAgICAgIGZvckVhY2hBcnJheShsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlIGlmICh0eXBlb2YgbGlzdCA9PT0gJ3N0cmluZycpXG4gICAgICAgIGZvckVhY2hTdHJpbmcobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG4gICAgZWxzZVxuICAgICAgICBmb3JFYWNoT2JqZWN0KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoQXJyYXkoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGFycmF5LCBpKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hTdHJpbmcoc3RyaW5nLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzdHJpbmcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgLy8gbm8gc3VjaCB0aGluZyBhcyBhIHNwYXJzZSBzdHJpbmcuXG4gICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgc3RyaW5nLmNoYXJBdChpKSwgaSwgc3RyaW5nKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaE9iamVjdChvYmplY3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmplY3Rba10sIGssIG9iamVjdClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInZhciB0cmltID0gcmVxdWlyZSgndHJpbScpXG4gICwgZm9yRWFjaCA9IHJlcXVpcmUoJ2Zvci1lYWNoJylcbiAgLCBpc0FycmF5ID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoZWFkZXJzKSB7XG4gIGlmICghaGVhZGVycylcbiAgICByZXR1cm4ge31cblxuICB2YXIgcmVzdWx0ID0ge31cblxuICBmb3JFYWNoKFxuICAgICAgdHJpbShoZWFkZXJzKS5zcGxpdCgnXFxuJylcbiAgICAsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gcm93LmluZGV4T2YoJzonKVxuICAgICAgICAgICwga2V5ID0gdHJpbShyb3cuc2xpY2UoMCwgaW5kZXgpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgLCB2YWx1ZSA9IHRyaW0ocm93LnNsaWNlKGluZGV4ICsgMSkpXG5cbiAgICAgICAgaWYgKHR5cGVvZihyZXN1bHRba2V5XSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkocmVzdWx0W2tleV0pKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IFsgcmVzdWx0W2tleV0sIHZhbHVlIF1cbiAgICAgICAgfVxuICAgICAgfVxuICApXG5cbiAgcmV0dXJuIHJlc3VsdFxufSIsIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4ndXNlIHN0cmljdCc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCJcbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSBTY290dCBCcmFkeVxuICogTUlUIExpY2Vuc2VcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGJyYWR5L3hoci1wcm9taXNlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xudmFyIFBhcnNlSGVhZGVycywgWE1MSHR0cFJlcXVlc3RQcm9taXNlLCBvYmplY3RBc3NpZ247XG5cblBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJ3BhcnNlLWhlYWRlcnMnKTtcblxub2JqZWN0QXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXG5cbi8qXG4gKiBNb2R1bGUgdG8gd3JhcCBhbiBYTUxIdHRwUmVxdWVzdCBpbiBhIHByb21pc2UuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBYTUxIdHRwUmVxdWVzdFByb21pc2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZSgpIHt9XG5cbiAgWE1MSHR0cFJlcXVlc3RQcm9taXNlLkRFRkFVTFRfQ09OVEVOVF9UWVBFID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCc7XG5cbiAgWE1MSHR0cFJlcXVlc3RQcm9taXNlLlByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcblxuXG4gIC8qXG4gICAqIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5zZW5kKG9wdGlvbnMpIC0+IFByb21pc2VcbiAgICogLSBvcHRpb25zIChPYmplY3QpOiBVUkwsIG1ldGhvZCwgZGF0YSwgZXRjLlxuICAgKlxuICAgKiBDcmVhdGUgdGhlIFhIUiBvYmplY3QgYW5kIHdpcmUgdXAgZXZlbnQgaGFuZGxlcnMgdG8gdXNlIGEgcHJvbWlzZS5cbiAgICovXG5cbiAgWE1MSHR0cFJlcXVlc3RQcm9taXNlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cztcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGRhdGE6IG51bGwsXG4gICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgdXNlcm5hbWU6IG51bGwsXG4gICAgICBwYXNzd29yZDogbnVsbFxuICAgIH07XG4gICAgb3B0aW9ucyA9IG9iamVjdEFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvci5Qcm9taXNlKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgZSwgaGVhZGVyLCByZWYsIHZhbHVlLCB4aHI7XG4gICAgICAgIGlmICghWE1MSHR0cFJlcXVlc3QpIHtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlRXJyb3IoJ2Jyb3dzZXInLCByZWplY3QsIG51bGwsIFwiYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgWE1MSHR0cFJlcXVlc3RcIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy51cmwgIT09ICdzdHJpbmcnIHx8IG9wdGlvbnMudXJsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVFcnJvcigndXJsJywgcmVqZWN0LCBudWxsLCAnVVJMIGlzIGEgcmVxdWlyZWQgcGFyYW1ldGVyJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLl94aHIgPSB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcmVzcG9uc2VUZXh0O1xuICAgICAgICAgIF90aGlzLl9kZXRhY2hXaW5kb3dVbmxvYWQoKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzcG9uc2VUZXh0ID0gX3RoaXMuX2dldFJlc3BvbnNlVGV4dCgpO1xuICAgICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICAgICAgX3RoaXMuX2hhbmRsZUVycm9yKCdwYXJzZScsIHJlamVjdCwgbnVsbCwgJ2ludmFsaWQgSlNPTiByZXNwb25zZScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7XG4gICAgICAgICAgICB1cmw6IF90aGlzLl9nZXRSZXNwb25zZVVybCgpLFxuICAgICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgICByZXNwb25zZVRleHQ6IHJlc3BvbnNlVGV4dCxcbiAgICAgICAgICAgIGhlYWRlcnM6IF90aGlzLl9nZXRIZWFkZXJzKCksXG4gICAgICAgICAgICB4aHI6IHhoclxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5faGFuZGxlRXJyb3IoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfTtcbiAgICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5faGFuZGxlRXJyb3IoJ3RpbWVvdXQnLCByZWplY3QpO1xuICAgICAgICB9O1xuICAgICAgICB4aHIub25hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5faGFuZGxlRXJyb3IoJ2Fib3J0JywgcmVqZWN0KTtcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuX2F0dGFjaFdpbmRvd1VubG9hZCgpO1xuICAgICAgICB4aHIub3BlbihvcHRpb25zLm1ldGhvZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMuYXN5bmMsIG9wdGlvbnMudXNlcm5hbWUsIG9wdGlvbnMucGFzc3dvcmQpO1xuICAgICAgICBpZiAoKG9wdGlvbnMuZGF0YSAhPSBudWxsKSAmJiAhb3B0aW9ucy5oZWFkZXJzWydDb250ZW50LVR5cGUnXSkge1xuICAgICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSBfdGhpcy5jb25zdHJ1Y3Rvci5ERUZBVUxUX0NPTlRFTlRfVFlQRTtcbiAgICAgICAgfVxuICAgICAgICByZWYgPSBvcHRpb25zLmhlYWRlcnM7XG4gICAgICAgIGZvciAoaGVhZGVyIGluIHJlZikge1xuICAgICAgICAgIHZhbHVlID0gcmVmW2hlYWRlcl07XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4geGhyLnNlbmQob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgZSA9IF9lcnJvcjtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX2hhbmRsZUVycm9yKCdzZW5kJywgcmVqZWN0LCBudWxsLCBlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5nZXRYSFIoKSAtPiBYTUxIdHRwUmVxdWVzdFxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLmdldFhIUiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl94aHI7XG4gIH07XG5cblxuICAvKlxuICAgKiBYTUxIdHRwUmVxdWVzdFByb21pc2UuX2F0dGFjaFdpbmRvd1VubG9hZCgpXG4gICAqXG4gICAqIEZpeCBmb3IgSUUgOSBhbmQgSUUgMTBcbiAgICogSW50ZXJuZXQgRXhwbG9yZXIgZnJlZXplcyB3aGVuIHlvdSBjbG9zZSBhIHdlYnBhZ2UgZHVyaW5nIGFuIFhIUiByZXF1ZXN0XG4gICAqIGh0dHBzOi8vc3VwcG9ydC5taWNyb3NvZnQuY29tL2tiLzI4NTY3NDZcbiAgICpcbiAgICovXG5cbiAgWE1MSHR0cFJlcXVlc3RQcm9taXNlLnByb3RvdHlwZS5fYXR0YWNoV2luZG93VW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5sb2FkSGFuZGxlciA9IHRoaXMuX2hhbmRsZVdpbmRvd1VubG9hZC5iaW5kKHRoaXMpO1xuICAgIGlmICh3aW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuYXR0YWNoRXZlbnQoJ29udW5sb2FkJywgdGhpcy5fdW5sb2FkSGFuZGxlcik7XG4gICAgfVxuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLl9kZXRhY2hXaW5kb3dVbmxvYWQoKVxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLl9kZXRhY2hXaW5kb3dVbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAod2luZG93LmRldGFjaEV2ZW50KSB7XG4gICAgICByZXR1cm4gd2luZG93LmRldGFjaEV2ZW50KCdvbnVubG9hZCcsIHRoaXMuX3VubG9hZEhhbmRsZXIpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qXG4gICAqIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5fZ2V0SGVhZGVycygpIC0+IE9iamVjdFxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLl9nZXRIZWFkZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFBhcnNlSGVhZGVycyh0aGlzLl94aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLl9nZXRSZXNwb25zZVRleHQoKSAtPiBNaXhlZFxuICAgKlxuICAgKiBQYXJzZXMgcmVzcG9uc2UgdGV4dCBKU09OIGlmIHByZXNlbnQuXG4gICAqL1xuXG4gIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5wcm90b3R5cGUuX2dldFJlc3BvbnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZVRleHQ7XG4gICAgcmVzcG9uc2VUZXh0ID0gdHlwZW9mIHRoaXMuX3hoci5yZXNwb25zZVRleHQgPT09ICdzdHJpbmcnID8gdGhpcy5feGhyLnJlc3BvbnNlVGV4dCA6ICcnO1xuICAgIHN3aXRjaCAodGhpcy5feGhyLmdldFJlc3BvbnNlSGVhZGVyKCdDb250ZW50LVR5cGUnKSkge1xuICAgICAgY2FzZSAnYXBwbGljYXRpb24vanNvbic6XG4gICAgICBjYXNlICd0ZXh0L2phdmFzY3JpcHQnOlxuICAgICAgICByZXNwb25zZVRleHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCArICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlVGV4dDtcbiAgfTtcblxuXG4gIC8qXG4gICAqIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZS5fZ2V0UmVzcG9uc2VVcmwoKSAtPiBTdHJpbmdcbiAgICpcbiAgICogQWN0dWFsIHJlc3BvbnNlIFVSTCBhZnRlciBmb2xsb3dpbmcgcmVkaXJlY3RzLlxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLl9nZXRSZXNwb25zZVVybCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl94aHIucmVzcG9uc2VVUkwgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3hoci5yZXNwb25zZVVSTDtcbiAgICB9XG4gICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHRoaXMuX3hoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl94aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLl9oYW5kbGVFcnJvcihyZWFzb24sIHJlamVjdCwgc3RhdHVzLCBzdGF0dXNUZXh0KVxuICAgKiAtIHJlYXNvbiAoU3RyaW5nKVxuICAgKiAtIHJlamVjdCAoRnVuY3Rpb24pXG4gICAqIC0gc3RhdHVzIChTdHJpbmcpXG4gICAqIC0gc3RhdHVzVGV4dCAoU3RyaW5nKVxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLl9oYW5kbGVFcnJvciA9IGZ1bmN0aW9uKHJlYXNvbiwgcmVqZWN0LCBzdGF0dXMsIHN0YXR1c1RleHQpIHtcbiAgICB0aGlzLl9kZXRhY2hXaW5kb3dVbmxvYWQoKTtcbiAgICByZXR1cm4gcmVqZWN0KHtcbiAgICAgIHJlYXNvbjogcmVhc29uLFxuICAgICAgc3RhdHVzOiBzdGF0dXMgfHwgdGhpcy5feGhyLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHN0YXR1c1RleHQgfHwgdGhpcy5feGhyLnN0YXR1c1RleHQsXG4gICAgICB4aHI6IHRoaXMuX3hoclxuICAgIH0pO1xuICB9O1xuXG5cbiAgLypcbiAgICogWE1MSHR0cFJlcXVlc3RQcm9taXNlLl9oYW5kbGVXaW5kb3dVbmxvYWQoKVxuICAgKi9cblxuICBYTUxIdHRwUmVxdWVzdFByb21pc2UucHJvdG90eXBlLl9oYW5kbGVXaW5kb3dVbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5feGhyLmFib3J0KCk7XG4gIH07XG5cbiAgcmV0dXJuIFhNTEh0dHBSZXF1ZXN0UHJvbWlzZTtcblxufSkoKTtcbiIsInZhciBQcm9taXNlSW5zcGVjdGlvbjtcblxudmFyIFByb21pc2VJbnNwZWN0aW9uJDEgPSBQcm9taXNlSW5zcGVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUHJvbWlzZUluc3BlY3Rpb24oYXJnKSB7XG4gICAgdGhpcy5zdGF0ZSA9IGFyZy5zdGF0ZSwgdGhpcy52YWx1ZSA9IGFyZy52YWx1ZSwgdGhpcy5yZWFzb24gPSBhcmcucmVhc29uO1xuICB9XG5cbiAgUHJvbWlzZUluc3BlY3Rpb24ucHJvdG90eXBlLmlzRnVsZmlsbGVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09ICdmdWxmaWxsZWQnO1xuICB9O1xuXG4gIFByb21pc2VJbnNwZWN0aW9uLnByb3RvdHlwZS5pc1JlamVjdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09ICdyZWplY3RlZCc7XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2VJbnNwZWN0aW9uO1xuXG59KSgpO1xuXG52YXIgX3VuZGVmaW5lZCQxID0gdm9pZCAwO1xuXG52YXIgX3VuZGVmaW5lZFN0cmluZyQxID0gJ3VuZGVmaW5lZCc7XG5cbnZhciBzb29uO1xuXG5zb29uID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgYnVmZmVyU2l6ZSwgY2FsbFF1ZXVlLCBjcVlpZWxkLCBmcSwgZnFTdGFydDtcbiAgZnEgPSBbXTtcbiAgZnFTdGFydCA9IDA7XG4gIGJ1ZmZlclNpemUgPSAxMDI0O1xuICBjYWxsUXVldWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZXJyO1xuICAgIHdoaWxlIChmcS5sZW5ndGggLSBmcVN0YXJ0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBmcVtmcVN0YXJ0XSgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgZXJyID0gZXJyb3I7XG4gICAgICAgIGlmIChnbG9iYWwuY29uc29sZSkge1xuICAgICAgICAgIGdsb2JhbC5jb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZxW2ZxU3RhcnQrK10gPSBfdW5kZWZpbmVkJDE7XG4gICAgICBpZiAoZnFTdGFydCA9PT0gYnVmZmVyU2l6ZSkge1xuICAgICAgICBmcS5zcGxpY2UoMCwgYnVmZmVyU2l6ZSk7XG4gICAgICAgIGZxU3RhcnQgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgY3FZaWVsZCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZGQsIG1vO1xuICAgIGlmICh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gX3VuZGVmaW5lZFN0cmluZyQxKSB7XG4gICAgICBkZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgbW8gPSBuZXcgTXV0YXRpb25PYnNlcnZlcihjYWxsUXVldWUpO1xuICAgICAgbW8ub2JzZXJ2ZShkZCwge1xuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgZGQuc2V0QXR0cmlidXRlKCdhJywgMCk7XG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSAhPT0gX3VuZGVmaW5lZFN0cmluZyQxKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldEltbWVkaWF0ZShjYWxsUXVldWUpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgc2V0VGltZW91dChjYWxsUXVldWUsIDApO1xuICAgIH07XG4gIH0pKCk7XG4gIHJldHVybiBmdW5jdGlvbihmbikge1xuICAgIGZxLnB1c2goZm4pO1xuICAgIGlmIChmcS5sZW5ndGggLSBmcVN0YXJ0ID09PSAxKSB7XG4gICAgICBjcVlpZWxkKCk7XG4gICAgfVxuICB9O1xufSkoKTtcblxudmFyIHNvb24kMSA9IHNvb247XG5cbnZhciBQcm9taXNlJDE7XG52YXIgU1RBVEVfRlVMRklMTEVEO1xudmFyIFNUQVRFX1BFTkRJTkc7XG52YXIgU1RBVEVfUkVKRUNURUQ7XG52YXIgX3VuZGVmaW5lZDtcbnZhciByZWplY3RDbGllbnQ7XG52YXIgcmVzb2x2ZUNsaWVudDtcblxuX3VuZGVmaW5lZCA9IHZvaWQgMDtcblxuU1RBVEVfUEVORElORyA9IF91bmRlZmluZWQ7XG5cblNUQVRFX0ZVTEZJTExFRCA9ICdmdWxmaWxsZWQnO1xuXG5TVEFURV9SRUpFQ1RFRCA9ICdyZWplY3RlZCc7XG5cbnJlc29sdmVDbGllbnQgPSBmdW5jdGlvbihjLCBhcmcpIHtcbiAgdmFyIGVyciwgeXJldDtcbiAgaWYgKHR5cGVvZiBjLnkgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgeXJldCA9IGMueS5jYWxsKF91bmRlZmluZWQsIGFyZyk7XG4gICAgICBjLnAucmVzb2x2ZSh5cmV0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZXJyID0gZXJyb3I7XG4gICAgICBjLnAucmVqZWN0KGVycik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGMucC5yZXNvbHZlKGFyZyk7XG4gIH1cbn07XG5cbnJlamVjdENsaWVudCA9IGZ1bmN0aW9uKGMsIHJlYXNvbikge1xuICB2YXIgZXJyLCB5cmV0O1xuICBpZiAodHlwZW9mIGMubiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB5cmV0ID0gYy5uLmNhbGwoX3VuZGVmaW5lZCwgcmVhc29uKTtcbiAgICAgIGMucC5yZXNvbHZlKHlyZXQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBlcnIgPSBlcnJvcjtcbiAgICAgIGMucC5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYy5wLnJlamVjdChyZWFzb24pO1xuICB9XG59O1xuXG5Qcm9taXNlJDEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFByb21pc2UoZm4pIHtcbiAgICBpZiAoZm4pIHtcbiAgICAgIGZuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc29sdmUoYXJnKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZWplY3QoYXJnKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBQcm9taXNlLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgY2xpZW50cywgZXJyLCBmaXJzdCwgbmV4dDtcbiAgICBpZiAodGhpcy5zdGF0ZSAhPT0gU1RBVEVfUEVORElORykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IHRoaXMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlamVjdChuZXcgVHlwZUVycm9yKCdBdHRlbXB0IHRvIHJlc29sdmUgcHJvbWlzZSB3aXRoIHNlbGYnKSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAmJiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBmaXJzdCA9IHRydWU7XG4gICAgICAgIG5leHQgPSB2YWx1ZS50aGVuO1xuICAgICAgICBpZiAodHlwZW9mIG5leHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBuZXh0LmNhbGwodmFsdWUsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJhKSB7XG4gICAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMucmVzb2x2ZShyYSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcyksIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJyKSB7XG4gICAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMucmVqZWN0KHJyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSh0aGlzKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBlcnIgPSBlcnJvcjtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSBTVEFURV9GVUxGSUxMRUQ7XG4gICAgdGhpcy52ID0gdmFsdWU7XG4gICAgaWYgKGNsaWVudHMgPSB0aGlzLmMpIHtcbiAgICAgIHNvb24kMSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjLCBpLCBsZW47XG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gY2xpZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgYyA9IGNsaWVudHNbaV07XG4gICAgICAgICAgICByZXNvbHZlQ2xpZW50KGMsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfVxuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLnJlamVjdCA9IGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIHZhciBjbGllbnRzO1xuICAgIGlmICh0aGlzLnN0YXRlICE9PSBTVEFURV9QRU5ESU5HKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSBTVEFURV9SRUpFQ1RFRDtcbiAgICB0aGlzLnYgPSByZWFzb247XG4gICAgaWYgKGNsaWVudHMgPSB0aGlzLmMpIHtcbiAgICAgIHNvb24kMShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGMsIGksIGxlbjtcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gY2xpZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGMgPSBjbGllbnRzW2ldO1xuICAgICAgICAgIHJlamVjdENsaWVudChjLCByZWFzb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFQcm9taXNlLnN1cHByZXNzVW5jYXVnaHRSZWplY3Rpb25FcnJvciAmJiBnbG9iYWwuY29uc29sZSkge1xuICAgICAgZ2xvYmFsLmNvbnNvbGUubG9nKCdCcm9rZW4gUHJvbWlzZSwgcGxlYXNlIGNhdGNoIHJlamVjdGlvbnM6ICcsIHJlYXNvbiwgcmVhc29uID8gcmVhc29uLnN0YWNrIDogbnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgIHZhciBhLCBjbGllbnQsIHAsIHM7XG4gICAgcCA9IG5ldyBQcm9taXNlO1xuICAgIGNsaWVudCA9IHtcbiAgICAgIHk6IG9uRnVsZmlsbGVkLFxuICAgICAgbjogb25SZWplY3RlZCxcbiAgICAgIHA6IHBcbiAgICB9O1xuICAgIGlmICh0aGlzLnN0YXRlID09PSBTVEFURV9QRU5ESU5HKSB7XG4gICAgICBpZiAodGhpcy5jKSB7XG4gICAgICAgIHRoaXMuYy5wdXNoKGNsaWVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmMgPSBbY2xpZW50XTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcyA9IHRoaXMuc3RhdGU7XG4gICAgICBhID0gdGhpcy52O1xuICAgICAgc29vbiQxKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocyA9PT0gU1RBVEVfRlVMRklMTEVEKSB7XG4gICAgICAgICAgcmVzb2x2ZUNsaWVudChjbGllbnQsIGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdENsaWVudChjbGllbnQsIGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH07XG5cbiAgUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uKGNmbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgY2ZuKTtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbihjZm4pIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGNmbiwgY2ZuKTtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMsIG1zZykge1xuICAgIG1zZyA9IG1zZyB8fCAndGltZW91dCc7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiByZWplY3QoRXJyb3IobXNnKSk7XG4gICAgICAgIH0sIG1zKTtcbiAgICAgICAgX3RoaXMudGhlbihmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICByZXNvbHZlKHZhbCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnRoZW4oZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBjYihudWxsLCB2YWwpO1xuICAgICAgfSk7XG4gICAgICB0aGlzW1wiY2F0Y2hcIl0oZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIHJldHVybiBjYihlcnIsIG51bGwpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBQcm9taXNlO1xuXG59KSgpO1xuXG52YXIgUHJvbWlzZSQyID0gUHJvbWlzZSQxO1xuXG52YXIgcmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgejtcbiAgeiA9IG5ldyBQcm9taXNlJDI7XG4gIHoucmVzb2x2ZSh2YWwpO1xuICByZXR1cm4gejtcbn07XG5cbnZhciByZWplY3QgPSBmdW5jdGlvbihlcnIpIHtcbiAgdmFyIHo7XG4gIHogPSBuZXcgUHJvbWlzZSQyO1xuICB6LnJlamVjdChlcnIpO1xuICByZXR1cm4gejtcbn07XG5cbnZhciBhbGwgPSBmdW5jdGlvbihwcykge1xuICB2YXIgaSwgaiwgbGVuLCBwLCByYywgcmVzb2x2ZVByb21pc2UsIHJlc3VsdHMsIHJldFA7XG4gIHJlc3VsdHMgPSBbXTtcbiAgcmMgPSAwO1xuICByZXRQID0gbmV3IFByb21pc2UkMigpO1xuICByZXNvbHZlUHJvbWlzZSA9IGZ1bmN0aW9uKHAsIGkpIHtcbiAgICBpZiAoIXAgfHwgdHlwZW9mIHAudGhlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcCA9IHJlc29sdmUocCk7XG4gICAgfVxuICAgIHAudGhlbihmdW5jdGlvbih5dikge1xuICAgICAgcmVzdWx0c1tpXSA9IHl2O1xuICAgICAgcmMrKztcbiAgICAgIGlmIChyYyA9PT0gcHMubGVuZ3RoKSB7XG4gICAgICAgIHJldFAucmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbihudikge1xuICAgICAgcmV0UC5yZWplY3QobnYpO1xuICAgIH0pO1xuICB9O1xuICBmb3IgKGkgPSBqID0gMCwgbGVuID0gcHMubGVuZ3RoOyBqIDwgbGVuOyBpID0gKytqKSB7XG4gICAgcCA9IHBzW2ldO1xuICAgIHJlc29sdmVQcm9taXNlKHAsIGkpO1xuICB9XG4gIGlmICghcHMubGVuZ3RoKSB7XG4gICAgcmV0UC5yZXNvbHZlKHJlc3VsdHMpO1xuICB9XG4gIHJldHVybiByZXRQO1xufTtcblxudmFyIHJlZmxlY3QgPSBmdW5jdGlvbihwcm9taXNlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSQyKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKG5ldyBQcm9taXNlSW5zcGVjdGlvbiQxKHtcbiAgICAgICAgc3RhdGU6ICdmdWxmaWxsZWQnLFxuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgIH0pKTtcbiAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGVycikge1xuICAgICAgcmV0dXJuIHJlc29sdmUobmV3IFByb21pc2VJbnNwZWN0aW9uJDEoe1xuICAgICAgICBzdGF0ZTogJ3JlamVjdGVkJyxcbiAgICAgICAgcmVhc29uOiBlcnJcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG52YXIgc2V0dGxlID0gZnVuY3Rpb24ocHJvbWlzZXMpIHtcbiAgcmV0dXJuIGFsbChwcm9taXNlcy5tYXAocmVmbGVjdCkpO1xufTtcblxuUHJvbWlzZSQyLmFsbCA9IGFsbDtcblxuUHJvbWlzZSQyLnJlZmxlY3QgPSByZWZsZWN0O1xuXG5Qcm9taXNlJDIucmVqZWN0ID0gcmVqZWN0O1xuXG5Qcm9taXNlJDIucmVzb2x2ZSA9IHJlc29sdmU7XG5cblByb21pc2UkMi5zZXR0bGUgPSBzZXR0bGU7XG5cblByb21pc2UkMi5zb29uID0gc29vbiQxO1xuXG5leHBvcnQgZGVmYXVsdCBQcm9taXNlJDI7XG4iLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjEuM1xuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IGZhbHNlO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBbXG5cdFx0XHRcdFx0a2V5LCAnPScsIHZhbHVlLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA/ICc7IGV4cGlyZXM9JyArIGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJycsIC8vIHVzZSBleHBpcmVzIGF0dHJpYnV0ZSwgbWF4LWFnZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5wYXRoID8gJzsgcGF0aD0nICsgYXR0cmlidXRlcy5wYXRoIDogJycsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5kb21haW4gPyAnOyBkb21haW49JyArIGF0dHJpYnV0ZXMuZG9tYWluIDogJycsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5zZWN1cmUgPyAnOyBzZWN1cmUnIDogJydcblx0XHRcdFx0XS5qb2luKCcnKSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gcGFydHNbMF0ucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvbnZlcnRlci5yZWFkID9cblx0XHRcdFx0XHRcdGNvbnZlcnRlci5yZWFkKGNvb2tpZSwgbmFtZSkgOiBjb252ZXJ0ZXIoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0Y29va2llLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gY29va2llO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IGNvb2tpZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IGFwaTtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGFwaS5jYWxsKGFwaSwga2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsImltcG9ydCBYaHIgICAgIGZyb20gJ3hoci1wcm9taXNlLWVzNidcbmltcG9ydCBQcm9taXNlIGZyb20gJ2Jyb2tlbidcbmltcG9ydCBjb29raWUgIGZyb20gJ2pzLWNvb2tpZSdcblxuaW1wb3J0IHtpc0Z1bmN0aW9uLCBuZXdFcnJvciwgdXBkYXRlUXVlcnl9IGZyb20gJy4uL3V0aWxzJ1xuXG5YaHIuUHJvbWlzZSA9IFByb21pc2VcblxuY2xhc3MgWGhyQ2xpZW50XG4gIGRlYnVnOiAgICAgICBmYWxzZVxuICBlbmRwb2ludDogICAgJ2h0dHBzOi8vYXBpLmhhbnpvLmlvJ1xuICBzZXNzaW9uTmFtZTogJ2huem8nXG5cbiAgY29uc3RydWN0b3I6IChvcHRzID0ge30pIC0+XG4gICAgcmV0dXJuIG5ldyBYaHJDbGllbnQgb3B0cyB1bmxlc3MgQCBpbnN0YW5jZW9mIFhockNsaWVudFxuXG4gICAge0BrZXksIEBkZWJ1Z30gPSBvcHRzXG5cbiAgICBpZiBvcHRzLmVuZHBvaW50XG4gICAgICBAc2V0RW5kcG9pbnQgb3B0cy5lbmRwb2ludFxuXG4gICAgQGdldEN1c3RvbWVyVG9rZW4oKVxuXG4gIHNldEVuZHBvaW50OiAoZW5kcG9pbnQpIC0+XG4gICAgQGVuZHBvaW50ID0gZW5kcG9pbnQucmVwbGFjZSAvXFwvJC8sICcnXG5cbiAgc2V0U3RvcmU6IChpZCkgLT5cbiAgICBAc3RvcmVJZCA9IGlkXG5cbiAgc2V0S2V5OiAoa2V5KSAtPlxuICAgIEBrZXkgPSBrZXlcblxuICBnZXRLZXk6IC0+XG4gICAgQGtleSBvciBAY29uc3RydWN0b3IuS0VZXG5cbiAgZ2V0Q3VzdG9tZXJUb2tlbjogLT5cbiAgICBpZiAoc2Vzc2lvbiA9IGNvb2tpZS5nZXRKU09OIEBzZXNzaW9uTmFtZSk/XG4gICAgICBAY3VzdG9tZXJUb2tlbiA9IHNlc3Npb24uY3VzdG9tZXJUb2tlbiBpZiBzZXNzaW9uLmN1c3RvbWVyVG9rZW4/XG4gICAgQGN1c3RvbWVyVG9rZW5cblxuICBzZXRDdXN0b21lclRva2VuOiAoa2V5KSAtPlxuICAgIGNvb2tpZS5zZXQgQHNlc3Npb25OYW1lLCB7Y3VzdG9tZXJUb2tlbjoga2V5fSwgZXhwaXJlczogNyAqIDI0ICogMzYwMCAqIDEwMDBcbiAgICBAY3VzdG9tZXJUb2tlbiA9IGtleVxuXG4gIGRlbGV0ZUN1c3RvbWVyVG9rZW46IC0+XG4gICAgY29va2llLnNldCBAc2Vzc2lvbk5hbWUsIHtjdXN0b21lclRva2VuOiBudWxsfSwgZXhwaXJlczogNyAqIDI0ICogMzYwMCAqIDEwMDBcbiAgICBAY3VzdG9tZXJUb2tlbiA9IG51bGxcblxuICBnZXRVcmw6ICh1cmwsIGRhdGEsIGtleSkgLT5cbiAgICBpZiBpc0Z1bmN0aW9uIHVybFxuICAgICAgdXJsID0gdXJsLmNhbGwgQCwgZGF0YVxuXG4gICAgdXBkYXRlUXVlcnkgKEBlbmRwb2ludCArIHVybCksIHRva2VuOiBrZXlcblxuICByZXF1ZXN0OiAoYmx1ZXByaW50LCBkYXRhPXt9LCBrZXkgPSBAZ2V0S2V5KCkpIC0+XG4gICAgb3B0cyA9XG4gICAgICB1cmw6ICAgIEBnZXRVcmwgYmx1ZXByaW50LnVybCwgZGF0YSwga2V5XG4gICAgICBtZXRob2Q6IGJsdWVwcmludC5tZXRob2RcblxuICAgIGlmIGJsdWVwcmludC5tZXRob2QgIT0gJ0dFVCdcbiAgICAgIG9wdHMuaGVhZGVycyA9XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcblxuICAgIGlmIGJsdWVwcmludC5tZXRob2QgPT0gJ0dFVCdcbiAgICAgIG9wdHMudXJsICA9IHVwZGF0ZVF1ZXJ5IG9wdHMudXJsLCBkYXRhXG4gICAgZWxzZVxuICAgICAgb3B0cy5kYXRhID0gSlNPTi5zdHJpbmdpZnkgZGF0YVxuXG4gICAgaWYgQGRlYnVnXG4gICAgICBjb25zb2xlLmxvZyAnLS1LRVktLSdcbiAgICAgIGNvbnNvbGUubG9nIGtleVxuICAgICAgY29uc29sZS5sb2cgJy0tUkVRVUVTVC0tJ1xuICAgICAgY29uc29sZS5sb2cgb3B0c1xuXG4gICAgKG5ldyBYaHIpLnNlbmQgb3B0c1xuICAgICAgLnRoZW4gKHJlcykgLT5cbiAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgY29uc29sZS5sb2cgJy0tUkVTUE9OU0UtLSdcbiAgICAgICAgICBjb25zb2xlLmxvZyByZXNcblxuICAgICAgICByZXMuZGF0YSAgID0gcmVzLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNcbiAgICAgIC5jYXRjaCAocmVzKSAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICByZXMuZGF0YSAgID0gcmVzLnJlc3BvbnNlVGV4dCA/IChKU09OLnBhcnNlIHJlcy54aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICBjYXRjaCBlcnJcblxuICAgICAgICBlcnIgPSBuZXdFcnJvciBkYXRhLCByZXNcbiAgICAgICAgaWYgQGRlYnVnXG4gICAgICAgICAgY29uc29sZS5sb2cgJy0tUkVTUE9OU0UtLSdcbiAgICAgICAgICBjb25zb2xlLmxvZyByZXNcbiAgICAgICAgICBjb25zb2xlLmxvZyAnRVJST1I6JywgZXJyXG5cbiAgICAgICAgdGhyb3cgZXJyXG5cbmV4cG9ydCBkZWZhdWx0IFhockNsaWVudFxuIiwiaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuLi91dGlscydcblxuIyBXcmFwIGEgdXJsIGZ1bmN0aW9uIHRvIHByb3ZpZGUgc3RvcmUtcHJlZml4ZWQgVVJMc1xuZXhwb3J0IHN0b3JlUHJlZml4ZWQgPSBzcCA9ICh1KSAtPlxuICAoeCkgLT5cbiAgICBpZiBpc0Z1bmN0aW9uIHVcbiAgICAgIHVybCA9IHUgeFxuICAgIGVsc2VcbiAgICAgIHVybCA9IHVcblxuICAgIGlmIEBzdG9yZUlkP1xuICAgICAgXCIvc3RvcmUvI3tAc3RvcmVJZH1cIiArIHVybFxuICAgIGVsc2VcbiAgICAgIHVybFxuXG4jIFJldHVybnMgYSBVUkwgZm9yIGdldHRpbmcgYSBzaW5nbGVcbmV4cG9ydCBieUlkID0gKG5hbWUpIC0+XG4gIHN3aXRjaCBuYW1lXG4gICAgd2hlbiAnY291cG9uJ1xuICAgICAgc3AgKHgpIC0+IFwiL2NvdXBvbi8je3guY29kZSA/IHh9XCJcbiAgICB3aGVuICdjb2xsZWN0aW9uJ1xuICAgICAgc3AgKHgpIC0+IFwiL2NvbGxlY3Rpb24vI3t4LnNsdWcgPyB4fVwiXG4gICAgd2hlbiAncHJvZHVjdCdcbiAgICAgIHNwICh4KSAtPiBcIi9wcm9kdWN0LyN7eC5pZCA/IHguc2x1ZyA/IHh9XCJcbiAgICB3aGVuICd2YXJpYW50J1xuICAgICAgc3AgKHgpIC0+IFwiL3ZhcmlhbnQvI3t4LmlkID8geC5za3UgPyB4fVwiXG4gICAgd2hlbiAnc2l0ZSdcbiAgICAgICh4KSAtPiBcIi9zaXRlLyN7eC5pZCA/IHgubmFtZSA/IHh9XCJcbiAgICBlbHNlXG4gICAgICAoeCkgLT4gXCIvI3tuYW1lfS8je3guaWQgPyB4fVwiXG4iLCJpbXBvcnQge1xuICBpc0Z1bmN0aW9uXG4gIHN0YXR1c0NyZWF0ZWRcbiAgc3RhdHVzTm9Db250ZW50XG4gIHN0YXR1c09rXG59IGZyb20gJy4uL3V0aWxzJ1xuXG5pbXBvcnQge2J5SWQsIHN0b3JlUHJlZml4ZWR9IGZyb20gJy4vdXJsJ1xuXG4jIE9ubHkgbGlzdCwgZ2V0IG1ldGhvZHMgb2YgYSBmZXcgbW9kZWxzIGFyZSBzdXBwb3J0ZWQgd2l0aCBhIHB1Ymxpc2hhYmxlIGtleSxcbiMgc28gb25seSB0aGVzZSBtZXRob2RzIGFyZSBleHBvc2VkIGluIHRoZSBicm93c2VyLlxuY3JlYXRlQmx1ZXByaW50ID0gKG5hbWUpIC0+XG4gIGVuZHBvaW50ID0gXCIvI3tuYW1lfVwiXG5cbiAgbGlzdDpcbiAgICB1cmw6ICAgICBlbmRwb2ludFxuICAgIG1ldGhvZDogICdHRVQnXG4gICAgZXhwZWN0czogc3RhdHVzT2tcbiAgZ2V0OlxuICAgIHVybDogICAgIGJ5SWQgbmFtZVxuICAgIG1ldGhvZDogICdHRVQnXG4gICAgZXhwZWN0czogc3RhdHVzT2tcblxuYmx1ZXByaW50cyA9XG4gICMgQUNDT1VOVFxuICBhY2NvdW50OlxuICAgIGdldDpcbiAgICAgIHVybDogICAgICcvYWNjb3VudCdcbiAgICAgIG1ldGhvZDogICdHRVQnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgdXNlQ3VzdG9tZXJUb2tlbjogdHJ1ZVxuXG4gICAgdXBkYXRlOlxuICAgICAgdXJsOiAgICAgJy9hY2NvdW50J1xuICAgICAgbWV0aG9kOiAgJ1BBVENIJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAgIGV4aXN0czpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L2V4aXN0cy8je3guZW1haWwgPyB4LnVzZXJuYW1lID8geC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICdHRVQnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuICAgICAgcHJvY2VzczogKHJlcykgLT4gcmVzLmRhdGEuZXhpc3RzXG5cbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQvY3JlYXRlJ1xuICAgICAgbWV0aG9kOiAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiBzdGF0dXNDcmVhdGVkXG5cbiAgICBlbmFibGU6XG4gICAgICB1cmw6ICAgICAoeCkgLT4gXCIvYWNjb3VudC9lbmFibGUvI3t4LnRva2VuSWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBsb2dpbjpcbiAgICAgIHVybDogICAgICcvYWNjb3VudC9sb2dpbidcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHByb2Nlc3M6IChyZXMpIC0+XG4gICAgICAgIEBzZXRDdXN0b21lclRva2VuIHJlcy5kYXRhLnRva2VuXG4gICAgICAgIHJlc1xuXG4gICAgbG9nb3V0OiAtPlxuICAgICAgQGRlbGV0ZUN1c3RvbWVyVG9rZW4oKVxuXG4gICAgcmVzZXQ6XG4gICAgICB1cmw6ICAgICAnL2FjY291bnQvcmVzZXQnXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICB1cGRhdGVPcmRlcjpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9hY2NvdW50L29yZGVyLyN7eC5vcmRlcklkID8geC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICdQQVRDSCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG4gICAgICB1c2VDdXN0b21lclRva2VuOiB0cnVlXG5cbiAgICBjb25maXJtOlxuICAgICAgdXJsOiAgICAgKHgpIC0+IFwiL2FjY291bnQvY29uZmlybS8je3gudG9rZW5JZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcbiAgICAgIHVzZUN1c3RvbWVyVG9rZW46IHRydWVcblxuICAjIENBUlRcbiAgY2FydDpcbiAgICBjcmVhdGU6XG4gICAgICB1cmw6ICAgICAgJy9jYXJ0J1xuICAgICAgbWV0aG9kOiAgICdQT1NUJ1xuICAgICAgZXhwZWN0czogIHN0YXR1c0NyZWF0ZWRcbiAgICB1cGRhdGU6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH1cIlxuICAgICAgbWV0aG9kOiAgICdQQVRDSCdcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuICAgIGRpc2NhcmQ6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH0vZGlzY2FyZFwiXG4gICAgICBtZXRob2Q6ICAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiAgc3RhdHVzT2tcbiAgICBzZXQ6XG4gICAgICB1cmw6ICAgICAgKHgpIC0+IFwiL2NhcnQvI3t4LmlkID8geH0vc2V0XCJcbiAgICAgIG1ldGhvZDogICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6ICBzdGF0dXNPa1xuXG4gICMgUkVWSUVXU1xuICByZXZpZXc6XG4gICAgY3JlYXRlOlxuICAgICAgdXJsOiAgICAgICcvcmV2aWV3J1xuICAgICAgbWV0aG9kOiAgICdQT1NUJ1xuICAgICAgZXhwZWN0czogIHN0YXR1c0NyZWF0ZWRcbiAgICBnZXQ6XG4gICAgICB1cmw6ICAgICAgKHgpLT4gXCIvcmV2aWV3LyN7eC5pZCA/IHh9XCJcbiAgICAgIG1ldGhvZDogICAnR0VUJ1xuICAgICAgZXhwZWN0czogIHN0YXR1c09rXG5cbiAgIyBDSEVDS09VVFxuICBjaGVja291dDpcbiAgICBhdXRob3JpemU6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvYXV0aG9yaXplJ1xuICAgICAgbWV0aG9kOiAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICAgY2FwdHVyZTpcbiAgICAgIHVybDogICAgIHN0b3JlUHJlZml4ZWQgKHgpIC0+IFwiL2NoZWNrb3V0L2NhcHR1cmUvI3t4Lm9yZGVySWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c09rXG5cbiAgICBjaGFyZ2U6XG4gICAgICB1cmw6ICAgICBzdG9yZVByZWZpeGVkICcvY2hlY2tvdXQvY2hhcmdlJ1xuICAgICAgbWV0aG9kOiAgJ1BPU1QnXG4gICAgICBleHBlY3RzOiBzdGF0dXNPa1xuXG4gICAgcGF5cGFsOlxuICAgICAgdXJsOiAgICAgc3RvcmVQcmVmaXhlZCAnL2NoZWNrb3V0L3BheXBhbCdcbiAgICAgIG1ldGhvZDogICdQT1NUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuICAjIFJFRkVSUkVSXG4gIHJlZmVycmVyOlxuICAgIGNyZWF0ZTpcbiAgICAgIHVybDogICAgICcvcmVmZXJyZXInXG4gICAgICBtZXRob2Q6ICAnUE9TVCdcbiAgICAgIGV4cGVjdHM6IHN0YXR1c0NyZWF0ZWRcblxuICAgIGdldDpcbiAgICAgIHVybDogICAgICh4KSAtPiBcIi9yZWZlcnJlci8je3guaWQgPyB4fVwiXG4gICAgICBtZXRob2Q6ICAnR0VUJ1xuICAgICAgZXhwZWN0czogc3RhdHVzT2tcblxuIyBNT0RFTFNcbm1vZGVscyA9IFtcbiAgJ2NvbGxlY3Rpb24nXG4gICdjb3Vwb24nXG4gICdwcm9kdWN0J1xuICAndmFyaWFudCdcbl1cblxuZm9yIG1vZGVsIGluIG1vZGVsc1xuICBkbyAobW9kZWwpIC0+XG4gICAgYmx1ZXByaW50c1ttb2RlbF0gPSBjcmVhdGVCbHVlcHJpbnQgbW9kZWxcblxuZXhwb3J0IGRlZmF1bHQgYmx1ZXByaW50c1xuIiwiaW1wb3J0IEFwaSAgICAgICAgZnJvbSAnLi9hcGknXG5pbXBvcnQgQ2xpZW50ICAgICBmcm9tICcuL2NsaWVudC9icm93c2VyJ1xuaW1wb3J0IGJsdWVwcmludHMgZnJvbSAnLi9ibHVlcHJpbnRzL2Jyb3dzZXInXG5cbkhhbnpvID1cbiAgQXBpOiAgICAgICAgQXBpXG4gIENsaWVudDogICAgIENsaWVudFxuICBibHVlcHJpbnRzOiBibHVlcHJpbnRzXG5cbmV4cG9ydCBkZWZhdWx0IEhhbnpvXG4iXSwibmFtZXMiOlsiaXNGdW5jdGlvbiIsInRvU3RyaW5nIiwicmVxdWlyZSQkMCIsImZvckVhY2giLCJyZXF1aXJlJCQxIiwiaGFzT3duUHJvcGVydHkiLCJnbG9iYWwiLCJkZWZpbmUiLCJYaHIiLCJQcm9taXNlIiwiY29va2llIiwiQXBpIiwiYmx1ZXByaW50cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUNBLElBQUE7O0FBQUEsQUFBQSxJQUFPLFVBQVAsR0FBb0IsU0FBQyxFQUFEO1NBQVEsT0FBTyxFQUFQLEtBQWE7OztBQUN6QyxBQUFBOztBQUdBLEFBQUEsSUFBTyxRQUFQLEdBQXlCLFNBQUMsR0FBRDtTQUFTLEdBQUcsQ0FBQyxNQUFKLEtBQWM7OztBQUNoRCxBQUFBLElBQU8sYUFBUCxHQUF5QixTQUFDLEdBQUQ7U0FBUyxHQUFHLENBQUMsTUFBSixLQUFjOzs7QUFDaEQsQUFBQTs7QUFHQSxBQUFBLElBQU8sUUFBUCxHQUFrQixTQUFDLElBQUQsRUFBTyxHQUFQLEVBQWlCLEdBQWpCO01BQ2hCOztJQUR1QixNQUFNOztFQUM3QixPQUFBLDJJQUFzQztFQUV0QyxJQUFPLFdBQVA7SUFDRSxHQUFBLEdBQU0sSUFBSSxLQUFKLENBQVUsT0FBVjtJQUNOLEdBQUcsQ0FBQyxPQUFKLEdBQWMsUUFGaEI7O0VBSUEsR0FBRyxDQUFDLEdBQUosR0FBbUI7RUFDbkIsR0FBRyxDQUFDLElBQUosR0FBbUIsR0FBRyxDQUFDO0VBQ3ZCLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLEdBQUcsQ0FBQztFQUN2QixHQUFHLENBQUMsTUFBSixHQUFtQixHQUFHLENBQUM7RUFDdkIsR0FBRyxDQUFDLElBQUos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
