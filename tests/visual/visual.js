define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../../src/assertVisuals',
	'intern/dojo/node!mkdirp',
	'intern/dojo/node!fs',
	'intern/dojo/node!path'
], function (registerSuite, assert, assertVisuals, mkdirp, fs, pathUtil) {
	registerSuite({
		name: 'visual',

		basic: function () {
			self = this;
			return this.remote
				.get('http://localhost:9000/tests/support/pages/basic.html')
				.setWindowSize(1024, 768)  // set the window size
				.takeScreenshot()
				.then(function (screenshot) {
					var baselineFilename = './visual-test/basic.png';
					if (fs.existsSync(baselineFilename)) {
						console.log('baseline exists');
					}
					else {
						mkdirp(pathUtil.dirname(baselineFilename));
						fs.writeFileSync(baselineFilename, screenshot);
						self.skip('generated baseline')
					}
				})
		}
	});
})
