define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../../src/index'
], function (registerSuite, assert, visualTest) {

	registerSuite({
		name: 'visual',

		basic: function () {
			self = this;

			return this.remote
				.get('http://localhost:9000/tests/support/pages/basic.html')
				.setWindowSize(1024, 768)  // set the window size
				.takeScreenshot()
				.then(visualTest(this, {
					missingBaseline: 'snapshot'
				}));
		}
	});
});
