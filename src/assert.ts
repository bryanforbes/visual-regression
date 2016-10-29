import { existsSync } from 'fs';
import { join as pathJoin } from 'path';
import { getTestDirectory, getBaselineFilename, save } from './util/file';
import Test = require('intern/lib/Test');
import ImageComparator from './comparators/PngJsImageComparator';
import LeadfootCommand = require('leadfoot/Command');
import { VisualRegressionTest, Report } from './interfaces';
import config from './config';
import VisualRegressionError from './VisualRegressionError';

export interface Options {
	baselineLocation?: string;
	directory?: string;
	missingBaseline?: 'skip' | 'snapshot' | 'fail';
}

/**
 * A LeadFoot Helper for asserting visual regression against a baseline. This helper is responsible for
 * determining if the test should pass, fail, or be skipped and provide enough metadata to the reporter
 * so it may generate any of the necessary data (including baselines).
 *
 * @param test the Intern test where this helper is running
 * @param options execution options overriding defaults
 * @return {(screenshot:Buffer)=>Promise<TResult>}
 */
export default function assertVisuals(test: Test, options: Options = config) {
	return function (this: LeadfootCommand<any>, screenshot: Buffer): Promise<Report> | never {
		const directory: string = options.directory || config.directory;
		const baselineLocation: string = options.baselineLocation || config.baselineLocation;
		const testDirectory: string = getTestDirectory(test.parent);
		const baselineName: string = getBaselineFilename(test);
		const baselineFilename: string = pathJoin(directory, baselineLocation, testDirectory, baselineName);

		if (existsSync(baselineFilename)) {
			const comparator = new ImageComparator();

			return comparator.compare(baselineFilename, screenshot)
				.then(function (report) {
					// Add the report to the current test for later processing by the Reporter
					const reports = (<VisualRegressionTest> test).visualReports =
						(<VisualRegressionTest> test).visualReports || [];
					reports.push(report);

					if (!report.isPassing) {
						throw new VisualRegressionError('failed visual regression', report);
					}

					return report;
				});
		}
		else {
			switch (options.missingBaseline || config.missingBaseline) {
				case 'skip':
					throw test.skip('missing baseline');
				case 'snapshot':
					save(baselineFilename, screenshot);
					throw test.skip('generated baseline');
				default:
					throw new Error('missing baseline');
			}
		}
	};
}
