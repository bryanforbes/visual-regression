var pngjs = require('pngjs');

/**
 * Assert that two visual elements are similar
 * @param expected {Blob} a buffer containing the baseline PNG used in the comparison
 * @param actual {Blob} a buffer containing the actual snapshot taken during the testing session
 * @param options {Object} a collection of options used in testing
 */
function assertVisuals(expected, actual, options) {
	if (expected.length != actual.length) {
		throw new Error('PNGs are different sizes');
	}

	for (var i = 0; i < expected.length; i++) {
		if (expected[i] !== actual[i]) {
			throw new Error('Pixel mismatch at ' + i);
		}
	}
}

module.exports = assertVisuals;
