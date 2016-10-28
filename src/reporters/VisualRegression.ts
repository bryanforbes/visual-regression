import { join as joinPath } from 'path';
import globalConfig from '../config';
import Suite = require('intern/lib/Suite');
import { VisualRegressionTest } from '../interfaces';
import getBaselineName from '../util/getBaselineName';
import { ReportConfig } from './interfaces';

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
	 * Root directory to write the report
	 */
	protected reportLocation: string;

	/**
	 * If the reporter should scan for and report unused baseline images
	 */
	protected reportUnusedBaselines: boolean = false;

	/**
	 * If the reporter should output the difference image of a failed test
	 */
	protected writeDifferenceImage: boolean;

	/**
	 * If the reporter should output the screenshot of a failed test
	 */
	protected writeScreenshot: string;

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
	}

	deprecated(name: string, replacement?: string, extra?: string) {
		// TODO store this for general test notes
	}

	/**
	 * This method is called when an error occurs within the test system that is non-recoverable
	 * (for example, a bug within Intern).
	 * @param error
	 */
	fatalError(error: Error): void {
		// TODO output a fatal error HTML page
	}

	/**
	 * This method is called when a new test suite is created.
	 * @param suite
	 */
	newSuite(suite: Suite): void {
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
		// TODO is there much we can do here?
	}

	/**
	 * This method is called after all test suites have finished running and the test system is preparing
	 * to shut down.
	 * @param executor
	 */
	runEnd(): void {
		// TODO optionally report on baselines not used in this test run
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
		// TODO write test failure information to disk
	}

	/**
	 * 1. optionally write the diff image
	 * 2. optionally write the screenshot
	 * 3. write report
	 */
	testPass(test: VisualRegressionTest): void {
		const name = getBaselineName(test);
		console.log(this.reportLocation, name);
		// TODO write test metadata information to disk
	}

	/**
	 * 1. write baseline
	 * 2. write report
	 */
	testSkip(test: VisualRegressionTest): void {
		// TODO write that the test was skipped to disk
	}

	testStart(test: VisualRegressionTest): void {
	}
}

// ReporterManager looks at the root export as the report, so we need to export using CJS format here :\
export = VisualRegression;
