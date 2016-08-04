var pngjs = require('pngjs');
var getRGBA = require('./util/getRGBA');

function ImageAnalysis(name, options) {
	options = options || { };
	Object.apply(this, options);
	this.name = name;
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

	errorColor: [0, 0, 0],

	get numberOfPixels() {
		return this.baseline.width * this.baseline.height;
	},

	get errorRate() {
		return (this.numberOfPixels - this.differenceCount) / this.numberOfPixels;
	},

	get isDifferent() {
		return this.differenceCount > 0;
	},

	get differenceImage() {
		if (!this._differenceImage) {
			this._differenceImage = new pngjs.PNG({
				width: this.width,
				height: this.height,
				filterType: -1
			});
		}

		return this._differenceImage;
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
		this.hasError = true;
	},

	recordPixelDifference: function (x, y) {
		var png = this.differenceImage;
		var index = (png.width * y + x) << 2;

		this.differenceCount++;

		console.log(png.data, this.errorColor)
		png.data[index++] = this.errorColor[0];
		png.data[index++] = this.errorColor[1];
		png.data[index] = this.errorColor[2];
	}
};

module.exports = ImageAnalysis;
