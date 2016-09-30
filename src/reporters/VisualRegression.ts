import { join as joinPath } from 'path';
import globalConfig from '../config';

import Suite = require('intern/lib/Suite');
import WritableStream = NodeJS.WritableStream;
import {VisualRegressionTest} from '../interfaces';

interface ReportConfig {
	console: any;
	output: WritableStream;
	directory: string;
	htmlReport: boolean;
	reportUnusedBaselines: boolean;
	[ key: string ]: any;
}

/**
 * A Visual Regression Test HTML reporter
 */
export default class {
	protected config: ReportConfig;

	protected htmlReport: boolean = true;

	protected reportUnusedBaselines: boolean = false;

	protected directory: string = globalConfig.directory;

	protected baselineLocation: string = globalConfig.baselineLocation;

	protected reportLocation: string;

	constructor(config: ReportConfig) {
		this.config = config;

		[ 'htmlReport', 'reportUnusedBaselines', 'directory' ].forEach((key) => {
			if (key in config) {
				(<any> this)[key] = (<any> config)[key];
			}
		});

		this.reportLocation = joinPath(this.directory, this.baselineLocation);
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
