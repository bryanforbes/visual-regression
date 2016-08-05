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
var collector = require('./reporters/collector');

function assertVisuals(test, options) {
	options = Object.assign({}, defaults, options || {});

	return function (screenshot) {
		var filename = pathUtil.join(options.directory, options.baselineLocation, getBaselineName(test));
		var report = new ImageAnalysis(test);

		if (fs.existsSync(filename)) {
			return loadPng(filename)
				.then(function (baseline) {
					report.recordBaseline(filename, baseline.width, baseline.height);
					var comparator = new ImageComparator(options);
					var actual = pngjs.PNG.sync.read(screenshot);

					// TODO optionally scale images

					try {
						comparator.compare(baseline, actual, report);
					}
					catch (error) {
						report.recordError(error);
					}

					collector.startup(options);
					return collector.add(report)
						.then(function (metadata) {
							if (report.error) {
								throw report.error;
							}
							else if (!report.isPassing()) {
								var error = new Error('Image does not match the baseline. Variation: ' + report.matchingPixelRatio);
								error.metadata = metadata;
								throw error;
							}

							return metadata;
						});
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
