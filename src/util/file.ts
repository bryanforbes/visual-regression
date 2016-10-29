import { writeFileSync, createReadStream, createWriteStream, unlink } from 'fs';
import { sync as mkdirSync } from 'mkdirp';
import { dirname } from 'path';
import Test = require('intern/lib/Test');
import WritableStream = NodeJS.WritableStream;

export function sanatizeFilename(name: string): string {
	// TODO sanatize strings to a valid filename
	return name;
}

export interface Hierarchy {
	_remote?: {
		environmentType: {
			browserName: string
		}
	};
	name: string;
	parent?: Hierarchy;
}

/**
 * Given an Intern test, create a unique filename path to store and retrieve a baseline
 * @param leaf the current test
 * @param includeBrowser if the current browser should be returned
 */
export function getTestDirectory(current: Hierarchy, includeBrowser: boolean = false): string {
	var name: string[] = [];

	for (; current.parent; current = current.parent) {
		name.unshift(current.name);
	}

	if (includeBrowser) {
		name.unshift(current._remote.environmentType.browserName);
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

/**
 * Saves a buffer to disk
 * @param filename the location of the PNG
 * @param buffer a buffer containing the baseline image
 */
export function save(filename: string, buffer: Buffer | string): void {
	mkdirSync(dirname(filename));
	writeFileSync(filename, buffer);
}

export function copy(source: string, target: string): Promise<string> {
	return new Promise(function (resolve, reject) {
		mkdirSync(dirname(target));

		const inStream = createReadStream(source);
		const outStream = createWriteStream(target);

		inStream.on('error', function (error: Error) {
			reject(error);
		});

		outStream.on('error', function (error: Error) {
			reject(error);
		});
		outStream.on('close', function () {
			resolve(target);
		});

		inStream.pipe(outStream);
	});
}

export function load<T extends WritableStream>(source: string, target: WritableStream): Promise<T> {
	return new Promise(function (resolve, reject) {
		const inStream = createReadStream(source);
		inStream.on('error', function (error: Error) {
			reject(error);
		});
		inStream.on('close', function () {
			resolve(target);
		});

		inStream.pipe(target);
	});
}

export function remove(target: string): Promise<any> {
	return new Promise(function (resolve, reject) {
		unlink(target, function (err) {
			if (err && err.code !== 'ENOENT') {
				reject(err);
			}
			resolve();
		});
	});
}
