import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import getBaselineName from 'src/util/getBaselineName';
import Test = require('intern/lib/Test');

const test: Test = <any> {
	parent: {
		name: 'one',
		parent: {
			name: 'two',
			parent: {
				name: 'three',
				_remote: {
					environmentType: {
						browserName: 'Netscape Navigator'
					}
				}
			}
		}
	}
};

registerSuite({
	name: 'getBaselineName',

	'no extra options'() {
		const actual = getBaselineName(test);
		const expected = 'two/one.png';
		assert.equal(actual, expected);
	},

	'options: suffix'() {
		const actual = getBaselineName(test, {
			suffix: '-suffix'
		});
		const expected = 'two/one-suffix.png';
		assert.equal(actual, expected);
	},

	'options: extension'() {
		const actual = getBaselineName(test, {
			extension: '.baseline.png'
		});
		const expected = 'two/one.baseline.png';
		assert.equal(actual, expected);
	},

	'options: includeBrowser'() {
		const actual = getBaselineName(test, {
			includeBrowser: true
		});
		const expected = 'Netscape Navigator/two/one.png';
		assert.equal(actual, expected);
	}
});
