import Test = require('intern/lib/Test');

export interface Options {
	extension?: string;
	includeBrowser?: boolean;
	suffix?: string;
}

function sanatizeFilename(name: string): string {
	// TODO sanatize strings to a valid filename
	return name;
}

/**
 * Given an Intern test, create a unique filename path to store and retrieve a baseline
 * @param test the current test
 * @param options {Object} a collection of options
 * @param options.includeBrowser {Boolean} include the browser name as part of the folder
 */
export default function getBaselineName(test: Test, options: Options = {}): string {
	var name: string[] = [];
	var suffix = options.suffix || '';
	var extension = options.extension || '.png';

	for (var current: any = test.parent; current.parent; current = current.parent) {
		name.unshift(current.name);
	}

	if (options.includeBrowser) {
		name.unshift(current._remote.environmentType.browserName);
	}

	return sanatizeFilename(name.join('/') + suffix + extension);
}
