/// <reference path="../modules.d.ts" />

import { existsSync } from 'fs';
import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { config, assertVisuals, util } from 'src/index';
import { join as joinPath } from 'intern/dojo/node!path';
import * as Test from 'intern/lib/Test';
import { Report } from '../../src/interfaces';
import { getBaselineFilename, getTestDirectory, remove as removeFile } from '../../src/util/file';

const basicPageUrl = require.toUrl('../support/pages/basic.html');

function getBaselinePath(test: Test, suffix?: string) {
	const testDirectory = getTestDirectory(test.parent);
	const baselineName = getBaselineFilename(test, suffix);
	return joinPath(config.directory, config.baselineLocation, testDirectory, baselineName);
}

function initializePage(url: string = basicPageUrl) {
	return function () {
		return this.parent
			.get(url)
			.setWindowSize(1024, 768);  // set the window size
	};
}

function generateBaseline(test: Test, suffix?: string): () => Promise<Buffer> {
	return function () {
		return this.parent
			.takeScreenshot()
			.then(function (screenshot: Buffer) {
				const filename = getBaselinePath(test, suffix);
				util.file.save(filename, screenshot);
				return screenshot;
			});
	};
}

function doesBaselineExist(test: Test, expected?: boolean) {
	return function () {
		return new Promise(function (resolve) {
			const filename = getBaselinePath(test);
			const exists = existsSync(filename);
			if (typeof expected === 'boolean') {
				assert.equal(exists, expected);
			}
			resolve(exists);
		});
	};
}

function removeBaseline(test: Test) {
	return function () {
		const filename = getBaselinePath(test);
		return removeFile(filename);
	};
}

registerSuite({
	name: 'programmatic',

	'no baselines generated': {
		'defaults missingBaseline = skip; test is skipped'() {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					const action = assertVisuals(test);
					let exception: Error = null;
					try {
						action.call(this, snapshot);
					}
					catch (e) {
						exception = e;
					}

					assert.equal(exception, (<any> Test).SKIP);
				})
				.then(doesBaselineExist(test, false));
		},

		'missingBaseline = skip; test is skipped'() {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					const action = assertVisuals(test, {
						missingBaseline: 'skip'
					});
					let exception: Error = null;
					try {
						action.call(this, snapshot);
					}
					catch (e) {
						exception = e;
					}

					assert.equal(exception, (<any> Test).SKIP);
				})
				.then(doesBaselineExist(test, false));
		},

		'missingBaseline = snapshop; test passes, a snapshot is generated'() {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					const action = assertVisuals(test, {
						missingBaseline: 'snapshot'
					});
					let exception: Error = null;
					try {
						action.call(this, snapshot);
					}
					catch (e) {
						exception = e;
					}

					assert.equal(exception, (<any> Test).SKIP);
				})
				.then(doesBaselineExist(test, true));
		},

		'missingBaseline = fail; tests fails'() {
			const test = this;

			return this.remote
				.then(removeBaseline(test))
				.then(initializePage())
				.takeScreenshot()
				.then(function (snapshot: Buffer) {
					assert.throws(function () {
						const action = assertVisuals(test, {
							missingBaseline: 'fail'
						});
						action.call(this, snapshot);
					}, 'missing baseline');
				})
				.then(doesBaselineExist(test, false));
		}
	},

	'preexisting baselines': {
		'snapshot matches baseline; test passes'() {
			const test = this;

			return this.remote
				.then(initializePage())
				.then(generateBaseline(test))
				.takeScreenshot()
				.then(assertVisuals(test, {
					missingBaseline: 'fail'
				}))
				.then(function (report: Report) {
					assert.property(test, 'visualResults');
					assert.lengthOf(test.visualResults, 1);
					assert.isTrue(report.isPassing);
					assert.deepEqual(report.numDifferences, 0);
				});
		},

		'snapshot does not match baseline; test fails'() {
			const test = this;

			return this.remote
				.then(initializePage())
				.then(generateBaseline(test))
				.execute(function () {
					var p = document.querySelector('#container > p');
					p.textContent = 'hello';
				})
				.then(generateBaseline(test, '.actual'))
				.then(assertVisuals(this, {
					missingBaseline: 'fail'
				}))
				.then(function () {
					throw('Expected mismatch');
				}, function (error: Error) {
					assert.property(error, 'report', `report is missing. ${ error.message }`);
				});
		}
	}
});
