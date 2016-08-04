var defaults = {
	/**
	 * @type {string} the default TLD for visual regression testing files
	 */
	directory: 'visual-test',

	/**
	 * @type {string} the default location for visual regression testing reports
	 */
	reportLocation: 'report',

	/**
	 * @type {string} the default location for baselines
	 */
	baselineLocation: 'baselines',

	/**
	 * @type {number} the default sub-pixel tolerance
	 */
	tolerance: 0.1,

	/**
	 * @type {string} action to take when dealing with a missing baseline: skip, fail, snapshot
	 */
	missingBaseline: 'skip',

	/**
	 * @type {boolean} scale the images if they are a different size before comparing them
	 */
	scaleImages: false,

	comparator: Object.freeze({
		ignoreAntialiasing: false,

		ignoreColors: false,

		errorColor: '#000',

		overlayBaselineOpacity: 0.3,

		scaleImages: false
	})
};

module.exports = defaults;
