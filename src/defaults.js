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
	missingBaseline: 'skip'
};

module.exports = defaults;
