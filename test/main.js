// Fool the 'engine' for now
angular = {};

var grailedAngularEngine = require('../src'),
	should = require('should');

describe('grailedAngularEngine', function () {

	it('angular should exist', function () {
		should.exist(angular);
	});

	it('should exist', function () {
		should.exist(grailedAngularEngine);
	});

});