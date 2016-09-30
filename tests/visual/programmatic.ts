import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { assertVisuals, config, util } from 'intern/dojo/node!src';
import { join as joinPath } from 'intern/dojo/node!path';
import * as Test from 'intern/lib/Test';

function createBaseline(test: Test): (screenshot: Buffer) => void {
	return function (screenshot: Buffer): void {
		var filename = joinPath(config.directory, config.baselineLocation, getBaselineName(test));
		saveFile(filename, screenshot);
	};
}

registerSuite({
	name: 'programmatic',

	'create a test': visualTest({
		url: 'http://localhost:9000/tests/support/pages/basic.html',
		width: 1024,
		height: 768,
		missingBaseline: 'snapshot'
	}),

	basic() {
		return this.remote
			.get('http://localhost:9000/tests/support/pages/basic.html')
			.setWindowSize(1024, 768)  // set the window size
			.takeScreenshot()
			.then(assertVisuals(this, {
				missingBaseline: 'snapshot'
			}));
	},

	difference() {
		return this.remote
			.get('http://localhost:9000/tests/support/pages/basic.html')
			.setWindowSize(1024, 768)  // set the window size
			.takeScreenshot()
			.then(createBaseline(this))
			.execute(function () {
				var p = document.querySelector('#container > p');
				p.textContent = 'hello';
			})
			.takeScreenshot()
			.then((screenshot: Buffer): Buffer => {
				var filename = joinPath(config.directory, config.baselineLocation, getBaselineName(this));
				saveFile(filename + '.actual.png', screenshot);
				return screenshot;
			})
			.then(assertVisuals(this, {
				missingBaseline: 'fail'
			}))
			.then(function () {
				throw('Expected mismatch');
			}, function (error: Error) {
				assert.property(error, 'metadata', 'metadata is missing');
			});
	}
})
