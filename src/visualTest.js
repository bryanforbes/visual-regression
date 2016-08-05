var assertVisuals = require('./assertVisuals');
var resizeWindow = require('./helpers/resizeWindow');

/**
 * Create an Intern test from a series of options
 * @param options options for the test
 * @param options.url the destination url for the visual regression test
 * @return {Function} a visual regression test
 */
function visualTest(options) {
	return function () {
		return this.remote
			.get(options.url)
			.then(function () {
				if(options.width && options.height) {
					return resizeWindow(options.width, options.height).apply(this);
				}
			})
			.takeScreenshot()
			.then(assertVisuals(this, options))
	};
}

module.exports = visualTest;
