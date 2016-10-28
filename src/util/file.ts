import Test = require('intern/lib/Test');
import Suite = require('intern/lib/Suite');

export function sanatizeFilename(name: string): string {
	// TODO sanatize strings to a valid filename
	return name;
}

/**
 * Given an Intern test, create a unique filename path to store and retrieve a baseline
 * @param test the current test
 * @param includeBrowser if the current browser should be returned
 */
export function getTestDirectory(test: Test, includeBrowser: boolean = false): string {
	var name: string[] = [];

	for (var current: Suite = test.parent; current.parent; current = current.parent) {
		name.unshift(current.name);
	}

	if (includeBrowser) {
		name.unshift((<any> current)._remote.environmentType.browserName);
	}

	return sanatizeFilename(name.join('/'));
}

export function getBaselineFilename(test: Test, suffix: string = '') {
	return sanatizeFilename(`${ test.name }${ suffix }.png`);
}

export function getSnapshotFilename(test: Test, suffix: string = '') {
	return sanatizeFilename(`${ test.name }-snapshot${ suffix }.png`);
}

export function getDifferenceFilename(test: Test, suffix: string = '') {
	return sanatizeFilename(`${ test.name }-diff${ suffix }.png`);
}
