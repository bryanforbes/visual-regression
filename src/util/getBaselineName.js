function sanatizeFilename(name) {
	// TODO sanatize strings to a valid filename
	return name;
}

/**
 * Given an Intern test, create a unique filename path to store and retrieve a baseline
 * @param test the current test
 * @param options {Object} a collection of options
 * @param options.includeBrowser {Boolean} include the browser name as part of the folder
 */
function getBaselineName(test, options) {
	var name = [];
	options = options || {};
	var suffix = options.suffix || '';
	var extension = options.extension || '.png';

	for (; test.parent; test = test.parent) {
		name.unshift(test.name);
	}

	if (options.includeBrowser) {
		name.unshift(test._remote.environmentType.browserName);
	}

	return sanatizeFilename(name.join('/') + suffix + extension);
}

module.exports = getBaselineName;
