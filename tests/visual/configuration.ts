import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { visualTest } from 'src/index';

const basicPageUrl = require.toUrl('../support/pages/basic.html');

registerSuite({
	name: 'configuration',

	'create a test': visualTest({
		url: basicPageUrl,
		width: 1024,
		height: 768,
		missingBaseline: 'snapshot',
		callback(report) {
			assert.isTrue(report.isPassing);
			assert.deepEqual(report.numDifferences, 0);
		}
	})
});
