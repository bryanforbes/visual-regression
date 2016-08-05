var pathUtil = require('path');
var savePng = require('../util/savePng');
var saveFile = require('../util/saveFile');
var getBaselineLine = require('../util/getBaselineName');

function Collector() {
	this.reports = {};
}

Collector.prototype = {
	constructor: Collector,
	
	reportLocation: '.',
	
	_startup: false,
	
	startup: function (options) {
		this._startup = true;
		this.reportLocation = pathUtil.join(options.directory, options.reportLocation);
	},

	add: function (report) {
		return (report.isPassing() ? Promise.resolve() : this._writeDiffImage(report))
			.then(function (diffImageFilename) {
				var filename = pathUtil.join(this.reportLocation, getBaselineLine(report.test, {
					extension: '.json'
				}));
				var metadata = {
					id: report.id,
					report: filename,
					baseline: report.baseline.filename,
					diff: diffImageFilename,
					width: report.width,
					height: report.height,
					matchingPixelRatio: report.matchingPixelRatio,
					isPassing: report.isPassing(),
					numDifferentPixels: report.differenceCount,
					log: report.log
				};

				var id = metadata.id;
				var list = this.reports[id] || [ ];
				list.push(metadata);
				this.reports[id] = list;

				saveFile(filename, JSON.stringify(metadata));

				return metadata;
			}.bind(this));
	},

	end: function () {
		this._writeIndex()
			.then(function () {
				this.reports = {};
			}.bind(this));
	},

	_writeDiffImage: function (report) {
		var list = this.reports[report.id];
		var num = list && list.length || 1;
		var suffix = '.diff' + (num === 1 ? '' : String(num));
		var filename = pathUtil.join(this.reportLocation, getBaselineLine(report.test, {
			suffix: suffix
		}));

		return savePng(filename, report.differenceImage)
			.then(function () {
				console.log(filename);
				return filename;
			});
	},

	_writeIndex: function () {
		// TODO write an index
		return Promise.resolve();
	}
};

module.exports = new Collector();
