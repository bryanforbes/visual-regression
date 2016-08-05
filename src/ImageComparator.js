function ImageComparator(options) {
	Object.apply(this, options);
}

ImageComparator.prototype = {
	constructor: ImageComparator,
	
	ignoreAntialiasing: false,
	
	ignoreColors: false,
	
	errorColor: '#000',
	
	overlayBaselineOpacity: 0.3,
	
	pixelTolerance: Object.freeze({
		red: 8,
		green: 8,
		blue: 8
	}),
	
	createDifferenceImage: true,

	pixelSkip: 1,
	
	compare: function (baseline, actual, reporter) {
		if (baseline == null || actual == null) {
			throw new Error('null image');
		}
		if (baseline.width !== actual.width || baseline.height !== actual.height) {
			throw new Error('PNGs are different sizes. Expected (' + baseline.width + 'x' + baseline.height + '); ' +
				'Actual (' + actual.width + 'x' + actual.height + ').');
		}

		var height = baseline.height;
		var width = baseline.width;
		var numSubPixels = (width * height) << 2;
		var redTol = this.pixelTolerance.red;
		var greenTol = this.pixelTolerance.green;
		var blueTol = this.pixelTolerance.blue;
		var increment = 4 * this.pixelSkip;

		for (var i = 0; i < numSubPixels; i += increment) {
			if (
				!this._isColorClose(baseline.data[i], actual.data[i], redTol) ||
				!this._isColorClose(baseline.data[i + 1], actual.data[i + 1], greenTol) ||
				!this._isColorClose(baseline.data[i + 2], actual.data[i + 2], blueTol)
			) {
				var p = i >> 2;
				var x = p % width;
				var y = (p - x) / width;
				reporter.recordPixelDifference(x, y);
			}
		}

		return reporter;
	},

	_isColorClose: function (expected, actual, tolerance) {
		if (expected == null || actual == null) {
			return false;
		}

		return Math.abs(expected - actual) < tolerance;
	}
};

module.exports = ImageComparator;
