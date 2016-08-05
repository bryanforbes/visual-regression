var pngjs = require('pngjs');
var getRGBA = require('./util/getRGBA');

function ImageAnalysis(test, options) {
	options = options || { };
	Object.apply(this, options);
	this.test = test;
	this.log = [];
	this.differenceCount = 0;
	this._differenceImage = null;

	if (options.errorColor) {
		this.errorColor = getRGBA(options.errorColor);
	}
}

ImageAnalysis.prototype = {
	constructor: ImageAnalysis,

	verbose: false,

	generateImageDifference: true,

	errorColor: Object.freeze([255, 0, 0]),

	backgroundColor: null,

	error: null,

	log: null,

	minPercentMatching: 1,

	get id() {
		return this.test.id;
	},

	get width() {
		return this.baseline.width;
	},
	
	get height() {
		return this.baseline.height;
	},

	get numberOfPixels() {
		return this.baseline.width * this.baseline.height;
	},

	get matchingPixelRatio() {
		return (this.numberOfPixels - this.differenceCount) / this.numberOfPixels;
	},

	get isDifferent() {
		return this.differenceCount > 0;
	},

	get differenceImage() {
		if (!this._differenceImage) {
			this._differenceImage = this._createImage();
		}

		return this._differenceImage;
	},

	isPassing: function () {
		return this.matchingPixelRatio >= this.minPercentMatching;
	},

	_createImage: function () {
		var options = {
			width: this.width,
			height: this.height
		};
		if (this.backgroundColor) {
			options.colorType = 2;
			options.bgColor = this.backgroundColor;
		}
		var png = this._differenceImage = new pngjs.PNG(options);
		png.on('error', function (err) {
			self.recordError(err.message);
		});
		return png;
	},

	recordBaseline: function (filename, width, height) {
		this.baseline = {
			filename: filename,
			width: width,
			height: height
		};
	},

	recordLog: function (item) {
		this.log.push(item);
	},

	recordError: function (error) {
		this.log.push(error.message);
		this.error = error;
	},

	recordPixelDifference: function (x, y) {
		var png = this.differenceImage;
		var index = (png.width * y + x) << 2;

		this.differenceCount++;

		png.data[index++] = this.errorColor[0];
		png.data[index++] = this.errorColor[1];
		png.data[index++] = this.errorColor[2];
		png.data[index] = 0xFF;
	}
};

module.exports = ImageAnalysis;
