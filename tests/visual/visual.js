define([
	'intern!object',
	'intern/chai!assert',
	'visual!assert',
	'visual!test',
	'visual!config',
	'intern/dojo/node!path',
	'intern/dojo/node!../../src/util/getBaselineName',
	'intern/dojo/node!../../src/util/saveFile'
], function (registerSuite, assert, assertVisuals, visualTest, config, pathUtil, getBaselineName, saveFile) {

	function createBaseline(test) {
		return function (screenshot) {
			var filename = pathUtil.join(config.directory, config.baselineLocation, getBaselineName(test));
			saveFile(filename, screenshot);
		}
	}

	registerSuite({
		name: 'visual',

		'create a test': visualTest({
			url: 'http://localhost:9000/tests/support/pages/basic.html',
			width: 1024,
			height: 768,
			missingBaseline: 'snapshot'
		}),

		basic: function () {
			return this.remote
				.get('http://localhost:9000/tests/support/pages/basic.html')
				.setWindowSize(1024, 768)  // set the window size
				.takeScreenshot()
				.then(assertVisuals(this, {
					missingBaseline: 'snapshot'
				}));
		},

		difference: function () {
			var test = this;

			return this.remote
				.get('http://localhost:9000/tests/support/pages/basic.html')
				.setWindowSize(1024, 768)  // set the window size
				.takeScreenshot()
				.then(createBaseline(this))
				.execute(function () {
					var p = document.querySelector('#container > p');
					p.textContent = 'hello';
				})
				.takeScreenshot()
				.then(function (screenshot) {
					var filename = pathUtil.join(config.directory, config.baselineLocation, getBaselineName(test));
					saveFile(filename + '.actual.png', screenshot);
					return screenshot;
				})
				.then(assertVisuals(this, {
					missingBaseline: 'fail'
				}))
				.then(function () {
					throw('Expected mismatch');
				}, function (error) {
					assert.property(error, 'metadata', 'metadata is missing');
				});
		}
	});
});
