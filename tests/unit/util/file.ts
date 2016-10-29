import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { getTestDirectory, getBaselineFilename, getSnapshotFilename, getDifferenceFilename }
	from 'src/util/file';
import Test = require('intern/lib/Test');
import Suite = require('intern/lib/Suite');

const test: Test = <any> {
	name: 'test', // Test
	parent: {
		name: 'one', // Suite
		parent: {
			name: 'two', // Parent Suite
			parent: {
				name: 'three', // Ancestor Suite
				_remote: {
					environmentType: {
						browserName: 'Netscape Navigator' // Browser
					}
				}
			}
		}
	}
};

const suite: Suite = <any> test.parent;

registerSuite({
	name: 'file',

	'.getTestDirectory': {
		'no extra options'() {
			const actual = getTestDirectory(suite);
			const expected = 'two/one';
			assert.equal(actual, expected);
		},

		'with includeBrowser = true'() {
			const actual = getTestDirectory(suite, true);
			const expected = 'Netscape Navigator/two/one';
			assert.equal(actual, expected);
		}
	},

	'.getBaselineFilename()': {
		'no extra options'() {
			const actual = getBaselineFilename(test);
			const expected = 'test.png';
			assert.equal(actual, expected);
		},

		'with suffix'() {
			const actual = getBaselineFilename(test, 'suffix');
			const expected = 'testsuffix.png';
			assert.equal(actual, expected);
		}
	},

	'.getSnapshotFilename()': {
		'no extra options'() {
			const actual = getSnapshotFilename(test);
			const expected = 'test-snapshot.png';
			assert.equal(actual, expected);
		},

		'with suffix'() {
			const actual = getSnapshotFilename(test, 'suffix');
			const expected = 'test-snapshotsuffix.png';
			assert.equal(actual, expected);
		}
	},

	'.getDifferenceFilename()': {
		'no extra options'() {
			const actual = getDifferenceFilename(test);
			const expected = 'test-diff.png';
			assert.equal(actual, expected);
		},

		'with suffix'() {
			const actual = getDifferenceFilename(test, 'suffix');
			const expected = 'test-diffsuffix.png';
			assert.equal(actual, expected);
		}
	},
});
