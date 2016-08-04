var pngjs = require('pngjs');
var pathUtil = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var defaults = require('./defaults');
var getBaselineName = require('./util/getBaselineName');
var ImageAnalysis = require('./ImageAnalysis');
var ImageComparator = require('./ImageComparator');
var loadPng = require('./util/loadPng');
var saveFile = require('./util/saveFile');

function assertVisuals(test, options) {
	options = Object.assign({}, defaults, options || {});

	return function (screenshot) {
		var filename = pathUtil.join(options.directory, options.baselineLocation, getBaselineName(test));
		var report = new ImageAnalysis(test.id);

		if (fs.existsSync(filename)) {
			return loadPng(filename)
				.then(function (baseline) {
					report.recordBaseline(filename, baseline.width, baseline.height);
					var comparator = new ImageComparator(options);
					var actual = pngjs.PNG.sync.read(screenshot);

					// TODO optionally scale images

					// TODO should I catch errors?
					return comparator.compare(baseline, actual, report);

					console.log('difference count', report.differenceCount);
					console.log('error rate', report.errorRate);

					// TODO add report to reporters/collector
				})
		}

		switch (options.missingBaseline) {
			case 'skip':
				return test.skip('missing baseline');
			case 'snapshot':
				saveFile(filename, screenshot);
				return test.skip('generated baseline');
			default:
				throw new Error('Missing baseline');
		}
	};
}

module.exports = assertVisuals;
