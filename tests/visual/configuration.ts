import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { visualTest } from 'src/index';

const basicPageUrl = require.toUrl('../support/pages/basic.html');

registerSuite({
	name: 'configuration',

	'create a test': visualTest({
		url: basicPageUrl,
		width: 640,
		height: 480,
		missingBaseline: 'snapshot',
		callback(result) {
			assert.isFalse(result.baselineExists);
			assert.isTrue(result.generatedBaseline);
			assert.isNull(result.report);
		}
	})
});
