if (typeof angular === 'undefined') {
	throw new Error('The Angular depdency has not been loaded!');
}

var emitter = require('emitter-component');

exports = module.exports = function (_grail) {
	var grail = _grail,
		angularConfig = grail.config('angular') || {},
		modules = Array.isArray(angularConfig.modules) ? angularConfig.modules : [];

	grail.angular = {

		controller: function ($scope, $route, $routeParams, $location, $http) {
			var scope = grail.angular.scope = $scope;

			scope.$location = $location;
			scope.$route = $route;
			scope.$routeParams = $routeParams;
			scope.$http = $http;

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

	grail.angular.controller.$inject = ['$scope', '$route', '$routeParams', '$location', '$http'];
	grail.angular.routes.$inject = ['$routeProvider', '$locationProvider'];
	grail.angular.module = angular.module('app', modules).config(grail.angular.routes);

	grail.emit('angular:start');
};

emitter(exports);