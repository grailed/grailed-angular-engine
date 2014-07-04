!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.grailedAngularEngine=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],2:[function(_dereq_,module,exports){
if (typeof angular === 'undefined') {
	throw new Error('The Angular depdency has not been loaded!');
}

var emitter = _dereq_('emitter-component');

exports = module.exports = function (_grail) {
	var grail = _grail,
		angularConfig = grail.config('angular') || {},
		modules = Array.isArray(angularConfig.modules) ? angularConfig.modules : [];

	grail.angular = {

		controller: function ($scope, $route, $routeParams, $location) {
			var scope = grail.angular.scope = $scope;

			scope.$location = $location;
			scope.$route = $route;
			scope.$routeParams = $routeParams;

			Object.keys(grail.controllers).forEach(function (_key) {
				Object.defineProperties(grail.controllers[_key], {
					__name: {
						value: _key + 'Controller'
					},
					scope: {
						get: function () {
							return scope;
						}
					}
				});

				scope[_key + 'Controller'] = grail.controllers[_key];
			});

			grail.emit('angular:end');
		},

		routes: function ($routeProvider, $locationProvider) {
			var routes = grail.routes;

			Object.keys(routes).forEach(function (_key) {
				var route = routes[_key];

				if (route.template === undefined) {
					throw new Error('The grailed angular engine was given a route with an invalid template');
				}

				$routeProvider.when(_key, {
					templateUrl: route.template,
					controller: grail.angular.routeController(route)
				});

			});

			$locationProvider.html5Mode(true);
		},

		routeController: function (_route) {
			if (_route === undefined || !_route.controller) {
				throw new Error('The grailed angular engine was given an invalid route');
			}
			return function () {
				grail.angular.scope.self = _route.controller;
				grail.emit('route', grail.angular.scope.self);
			};
		}

	};

	grail.on('route', function (_class) {
		var method = _class['all'] || _class['get'];
		if (typeof method === 'function') {
			method.apply(_class);
		}
	});

	modules.unshift('ngRoute');

	grail.angular.controller.$inject = ['$scope', '$route', '$routeParams', '$location'];
	grail.angular.routes.$inject = ['$routeProvider', '$locationProvider'];
	grail.angular.module = angular.module('app', modules).config(grail.angular.routes);

	grail.emit('angular:end');
};

emitter(exports);
},{"emitter-component":1}]},{},[2])
(2)
});