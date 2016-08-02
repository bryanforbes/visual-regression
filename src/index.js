var pathUtil = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var defaults = require('./defaults');
var getBaselineName = require('./util/getBaselineName');
var assertVisuals = require('./assertVisuals');

function loadBaseline(filename) {
	return new Promise(function (resolve, reject) {
		fs.readFile(filename, function (error, screenshot) {
			if (error) {
				reject(error);
			}
			else {
				resolve(screenshot);
			}
		});
	});
}

function saveBaseline(filename, screenshot) {
	mkdirp.sync(pathUtil.dirname(filename));
	fs.writeFileSync(filename, screenshot);
}

function visualTest(test, options) {
	options = Object.assign({}, defaults, options || {});
	
	return function (screenshot) {
		var filename = pathUtil.join(options.directory, options.baselineLocation, getBaselineName(test));

		if (fs.existsSync(filename)) {
			return loadBaseline(filename)
				.then(function (baseline) {
					assertVisuals(baseline, screenshot, options);
				})
		}

		switch (options.missingBaseline) {
			case 'skip':
				test.skip('missing baseline');
			case 'snapshot':
				saveBaseline(filename, screenshot);
				test.skip('generated baseline');
			default:
				throw new Error('Missing baseline');
		}
	};
}

module.exports = visualTest;
