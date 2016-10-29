import { join as joinPath } from 'path';
import globalConfig from '../config';
import Suite = require('intern/lib/Suite');
import { VisualRegressionTest, Report, RGBAColorArray } from '../interfaces';
import { getTestDirectory, getBaselineFilename, getSnapshotFilename, getDifferenceFilename } from '../util/file';
import { ReportConfig } from './interfaces';
import { getErrorMessage } from 'intern/lib/util';
import saveDifferenceImage from './saveDifferenceImage';
import getRGBA from '../util/getRGBA';

interface Note {
	level: 'info' | 'warn' | 'error' | 'fatal';
	message: string;
	type: string;
}

function constructDirectory(base: string, location: string) {
	if (/^\/|\\/.test(location)) {
		// Absolute location
		return location;
	}

	return joinPath(base, location);
}

/**
 * A Visual Regression Test HTML reporter
 */
class VisualRegression {
	protected config: ReportConfig;

	/**
	 * Root directory to write baseline images
	 */
	protected baselineLocation: string;

	/**
	 * The color used for errors in the difference image
	 */
	protected errorColor: RGBAColorArray;

	/**
	 * Root directory to write the report
	 */
	protected reportLocation: string;

	/**
	 * If the reporter should scan for and report unused baseline images
	 */
	protected reportUnusedBaselines: boolean = false;

	/**
	 * If the reporter should copy the baselines to the report
	 */
	protected writeBaseline: boolean;

	/**
	 * If the reporter should output the difference image of a failed test
	 */
	protected writeDifferenceImage: boolean;

	/**
	 * If the reporter should output the screenshot of a failed test
	 */
	protected writeScreenshot: string;

	/**
	 * Notes exported to index.html
	 * @private
	 */
	private _globalNotes: Note[] = [];

	private _currentSuite: Suite = null;

	private _hasVisualTest: boolean = false;

	private _numVisualRegressionTests: number = 0;

	private _failingVisualRegressionTests: string[] = [];

	constructor(config: ReportConfig) {
		this.config = config;

		const baseDirectory = 'directory' in config ? config.directory : globalConfig.directory;
		const baselineLocation  = 'baselineLocation' in config ?
			config.baselineLocation : globalConfig.baselineLocation;
		const reportLocation  = 'reportLocation' in config ?
			config.reportLocation : globalConfig.report.reportLocation;

		this.baselineLocation = constructDirectory(baseDirectory, baselineLocation);
		this.reportLocation = constructDirectory(baseDirectory, reportLocation);
		this.reportUnusedBaselines = 'reportUnusedBaselines' in config ?
			config.reportUnusedBaselines : globalConfig.report.reportUnusedBaselines;
		this.writeDifferenceImage = 'writeDifferenceImage' in config ?
			config.writeDifferenceImage : globalConfig.report.writeDifferenceImage;
		this.writeScreenshot = 'writeScreenshot' in config ?
			config.writeScreenshot : globalConfig.report.writeScreenshot;

		this.errorColor = getRGBA(config.errorColor || '#F00');
	}

	deprecated(name: string, replacement?: string, extra?: string) {
		this._globalNotes.push({
			level: 'warn',
			type: 'deprecated',
			message: `${ name } is deprecated.${ replacement ?
				` Use ${ replacement } instead.` :
				` Please open a ticket if you require access to this feature.`
			}${ extra ? ` ${ extra }` : ''}`
		});
	}

	/**
	 * This method is called when an error occurs within the test system that is non-recoverable
	 * (for example, a bug within Intern).
	 * @param error
	 */
	fatalError(error: Error): void {
		this._globalNotes.push({
			level: 'fatal',
			type: 'fatal error',
			message: getErrorMessage(error)
		});
	}

	/**
	 * This method is called when a new test suite is created.
	 * @param suite
	 */
	newSuite(suite: Suite): void {
		// track the current suite. If there are visual regression tests we'll add it to the report.
		this._currentSuite = suite;
		this._hasVisualTest = false;
	}

	/**
	 * This method is called when a new test is created.
	 * @param test
	 */
	newTest(test: VisualRegressionTest): void {
	}

	/**
	 * This method is called when a reporter throws an error during execution of a command.
	 * @param error
	 */
	reporterError(reporter: any, error: Error): void {
		this._globalNotes.push({
			level: 'error',
			type: 'reporter error',
			message: getErrorMessage(error)
		});
	}

	/**
	 * This method is called after all test suites have finished running and the test system is preparing
	 * to shut down.
	 * @param executor
	 */
	runEnd(): void {
		// TODO optionally report on baselines not used in this test run
		// TODO output the main index.html
	}

	/**
	 * This method is called after all tests have been registered and the test system is about to begin running
	 * tests.
	 * @param executor
	 */
	runStart(): void {

	}

	/**
	 * This method is called when a test suite has finished running.
	 * @param suite
	 */
	suiteEnd(suite: Suite): void {
		this._currentSuite = null;
		this._hasVisualTest = false;
	}

	/**
	 * This method is called when an error occurs within one of the suite’s lifecycle methods (setup, beforeEach, afterEach, or teardown), or when an error occurs when a suite attempts to run a child test.
	 * @param suite
	 * @param error
	 */
	suiteError(suite: Suite, error: Error): void {
		// TODO write this error to disk for the suite
	}

	suiteStart(suite: Suite): void {

	}

	testEnd(test: VisualRegressionTest): void {
		// TODO make sure all PNGs have been replaced w/ string filenames as they have been written to disk
	}

	/**
	 * 1. write the diff image
	 * 2. optionally write the screenshot
	 * 3. write report
	 */
	testFail(test: VisualRegressionTest): void {
		this.writeTestReport(test);
	}

	/**
	 * 1. optionally write the diff image
	 * 2. optionally write the screenshot
	 * 3. write report
	 */
	testPass(test: VisualRegressionTest): void {
		this.writeTestReport(test);
	}

	/**
	 * 1. write baseline
	 * 2. write report
	 */
	testSkip(test: VisualRegressionTest): void {
		// TODO write baseline (unless skipped by something else?)
		this.writeTestReport(test);
	}

	testStart(test: VisualRegressionTest): void {
	}

	protected writeTestReport(test: VisualRegressionTest): Promise<any> {
		if (!test.visualReports || !test.visualReports.length) {
			return;
		}

		const reports: Report[] = test.visualReports;

		const promises: Promise<void>[] = [];
		const testDirectory = getTestDirectory(test);
		for (let i = 0; i < reports.length; i++) {
			const report: Report = reports[i];
			const fileSuffix = i > 0 ? String(i) : '';
			const baselineName = getBaselineFilename(test, fileSuffix);
			const differenceName = getDifferenceFilename(test, fileSuffix);
			const snapshotName = getSnapshotFilename(test, fileSuffix);
			const differenceFilename = joinPath(this.reportLocation, testDirectory, differenceName);
			const snapshotFilename = joinPath(this.reportLocation, testDirectory, snapshotName);
			let baselineFilename = joinPath(this.baselineLocation, testDirectory, baselineName);

			// TODO maybe turn this into async/await?
			const promise = Promise.resolve()
				.then(() => {
					if (!report.isPassing && this.writeDifferenceImage) {
						return saveDifferenceImage(report, differenceFilename, {
							errorColor: this.errorColor
						});
					}
				})
				.then(() => {
					// TODO add ability to write the screenshot
					switch (this.writeScreenshot) {
						case 'fail':
							if (!report.isPassing) {
								console.log('TODO write screenshot', snapshotFilename);
							}
							break;
						case 'always':
							console.log('TODO write screenshot', snapshotFilename);
							break;
					}
				})
				.then(() => {
					if (this.writeBaseline) {
						const reportBaselineFilename = joinPath(this.reportLocation, testDirectory, baselineName);
						// TODO copy the baseline file over
						baselineFilename = reportBaselineFilename;
					}
				});
			promises.push(promise);
		}

		return Promise.all(promises)
			.then(() => {
				const reportFilename = joinPath(this.reportLocation, testDirectory, 'index.html');
				// TODO write report HTML
				// TODO include if test passed, or error message if ended in a failure
				console.log('writing report', reportFilename);
			});
	}
}

// ReporterManager looks at the root export as the report, so we need to export using CJS format here :\
export = VisualRegression;
