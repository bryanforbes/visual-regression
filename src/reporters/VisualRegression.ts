import { join as joinPath } from 'path';
import globalConfig from '../config';
import Suite = require('intern/lib/Suite');
import { RGBAColorArray, BufferImageMetadata} from '../interfaces';
import {
	getTestDirectory, getBaselineFilename, getSnapshotFilename, getDifferenceFilename,
	save, copy
} from '../util/file';
import { ReportConfig } from './interfaces';
import { getErrorMessage } from 'intern/lib/util';
import saveDifferenceImage from './saveDifferenceImage';
import getRGBA from '../util/getRGBA';
import {VisualRegressionTest, AssertionResult} from '../assert';

interface Note {
	level: 'info' | 'warn' | 'error' | 'fatal';
	message: string;
	type: string;
}

interface TestReportMetadata {
	baselineImage: string;
	isPassing: boolean;
	differenceImage: string;
	screenshotImage: string;
	testDirectory: string;
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

	private _currentSuite: {
		suite: Suite;
		results: TestReportMetadata[];
	} = null;

	private _hasVisualTest: boolean = false;

	// private _numVisualRegressionTests: number = 0;

	// private _failingVisualRegressionTests: string[] = [];

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
		this._currentSuite = {
			suite,
			results: []
		};
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
		console.log('suite end', this._currentSuite.results.length);
		this.writeSuiteReport(suite, this._currentSuite.results);
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
	testFail(test: VisualRegressionTest): Promise<void> {
		return this.writeTestReport(test)
			.then((metadata) => {
				console.log('adding failed' + metadata.length);
				this._currentSuite.results.splice(this._currentSuite.results.length, 0, ... metadata);
			});
	}

	/**
	 * 1. optionally write the diff image
	 * 2. optionally write the screenshot
	 * 3. write report
	 */
	testPass(test: VisualRegressionTest): Promise<void> {
		return this.writeTestReport(test)
			.then((metadata) => {
				this._currentSuite.results.splice(this._currentSuite.results.length, 0, ... metadata);
			});
	}

	/**
	 * 1. write baseline
	 * 2. write report
	 */
	testSkip(test: VisualRegressionTest): Promise<void> {
		return this.writeTestReport(test)
			.then((metadata) => {
				this._currentSuite.results.splice(this._currentSuite.results.length, 0, ... metadata);
			});
	}

	testStart(test: VisualRegressionTest): void {
	}

	private writeSuiteReport(suite: Suite, results: TestReportMetadata[]): void {
		if (!results || !results.length) {
			return;
		}

		const htmlFilename = joinPath(this.reportLocation, getTestDirectory(suite), 'index.html');
		// TODO write report HTML
		// TODO include if test passed, or error message if ended in a failure
		save(htmlFilename, '<html>');
	}

	private writeTestReport(test: VisualRegressionTest): Promise<TestReportMetadata[]> {
		if (!test.visualResults || !test.visualResults.length) {
			return;
		}

		const results: AssertionResult[] = test.visualResults;

		const testDirectory = getTestDirectory(test.parent);
		Promise.all<TestReportMetadata>(results.map((result, i) => {
			if (!result.report) {
				return null;
			}

			const report = result.report;
			const fileSuffix = i > 0 ? String(i) : '';
			const baselineName = getBaselineFilename(test, fileSuffix);
			const differenceName = getDifferenceFilename(test, fileSuffix);
			const snapshotName = getSnapshotFilename(test, fileSuffix);
			const differenceFilename = joinPath(this.reportLocation, testDirectory, differenceName);
			const snapshotFilename = joinPath(this.reportLocation, testDirectory, snapshotName);
			let baselineFilename = joinPath(this.baselineLocation, testDirectory, baselineName);
			const metadata: TestReportMetadata = {
				baselineImage: baselineFilename,
				isPassing: report.isPassing,
				differenceImage: differenceFilename,
				screenshotImage: null,
				testDirectory
			};

			return Promise.resolve()
				.then(() => {
					if (!report.isPassing && this.writeDifferenceImage) {
						return saveDifferenceImage(report, differenceFilename, {
							errorColor: this.errorColor
						});
					}
				})
				.then(() => {
					if (this.writeScreenshot === 'fail' && !report.isPassing || this.writeScreenshot === 'always') {
						if ((<BufferImageMetadata> report.actual).buffer) {
							metadata.screenshotImage = snapshotFilename;
							save(snapshotFilename, (<BufferImageMetadata> report.actual).buffer);
						}
						else {
							this._globalNotes.push({
								level: 'error',
								message: `Failed to write screenshot "${ snapshotFilename }". Missing buffer.`,
								type: 'image write'
							});
						}
					}
				})
				.then(() => {
					if (this.writeBaseline) {
						const reportBaselineFilename = joinPath(this.reportLocation, testDirectory, baselineName);
						metadata.baselineImage = reportBaselineFilename;
						return copy(baselineFilename, reportBaselineFilename);
					}
				})
				.then(function () {
					return metadata;
				});
		}));
	}
}

// ReporterManager looks at the root export as the report, so we need to export using CJS format here :\
export = VisualRegression;
