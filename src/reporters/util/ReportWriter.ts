import { join as joinPath } from 'path';
import { VisualRegressionTest, AssertionResult } from '../../assert';
import globalConfig from '../../config';
import getRGBA from '../../util/getRGBA';
import { RGBAColorArray, BufferImageMetadata } from '../../interfaces';
import saveDifferenceImage from './saveDifferenceImage';
import {
	getTestDirectory, getBaselineFilename, getSnapshotFilename, getDifferenceFilename,
	save, copy
} from '../../util/file';
import Suite = require('intern/lib/Suite');
import { ColorDescriptor } from '../../util/getRGBA';
import WritableStream = NodeJS.WritableStream;

export interface Options {
	baselineLocation?: string;
	errorColor?: ColorDescriptor;
	reportLocation?: string;
	directory?: string;
	reportUnusedBaselines?: boolean;
	writeDifferenceImage?: boolean;
	writeBaselines?: boolean;
	writeReport?: boolean;
	writeScreenshot?: 'never' | 'fail' | 'always';
}

export interface ReportConfig extends Options {
	console: any;
	output: WritableStream;
}

export interface TestReportMetadata {
	id: string;
	baselineImage: string;
	isPassing: boolean;
	differenceImage: string;
	screenshotImage: string;
	testDirectory: string;
}

export interface Note {
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

function createTestCompareNode(metadata: TestReportMetadata): string {
	return `
<img src="${ metadata.baselineImage }">
`;
}

function createSuiteReport(suite: Suite, fragments: string[]): string {
	const title = suite.name;
	const results = fragments.reduce(function (html: string, fragment: string) {
		html += `
<div>
	${ fragment }
</div>
`;
		return html;
	}, '');

	return `
<!doctype html>
<html lang="en">
<head>
	<title>${ title }</title>
</head>
<body>
	${ results }
</body>
</html>
`;
}

export default class {
	/**
	 * Root directory to write baseline images
	 */
	private baselineLocation: string;

	/**
	 * The color used for errors in the difference image
	 */
	private errorColor: RGBAColorArray;

	/**
	 * Root directory to write the report
	 */
	private reportLocation: string;

	/**
	 * If the reporter should scan for and report unused baseline images
	 */
	private reportUnusedBaselines: boolean = false;

	/**
	 * If the reporter should copy the baselines to the report
	 */
	private writeBaseline: boolean;

	/**
	 * If the reporter should output the difference image of a failed test
	 */
	private writeDifferenceImage: boolean;

	/**
	 * If the reporter should output the screenshot of a failed test
	 */
	private writeScreenshot: string;

	/**
	 * Notes exported to index.html
	 * @private
	 */
	private _globalNotes: Note[] = [];

	private _testMetadata: { [ key: string ]: TestReportMetadata } = {};

	constructor(config: ReportConfig) {
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

	addNote(note: Note): void {
		this._globalNotes.push(note);
	}

	writeTest(test: VisualRegressionTest): Promise<TestReportMetadata[]> {
		const results: AssertionResult[] = test.visualResults || [];
		const testDirectory = getTestDirectory(test.parent);

		return Promise.all<TestReportMetadata>(results.map((result, i) => {
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
				id: test.id,
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
							this.addNote({
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
				.then(() => {
					this._testMetadata[test.id] = metadata;
					return metadata;
				});
		}));

	}

	writeSuite(suite: Suite): void {
		let hasVisualTests = false;
		const fragments: string[] = [];

		suite.tests.forEach((item) => {
			if ((<Suite> item).tests) {
				// TODO handle suite?
			}
			else {
				const test: VisualRegressionTest = <any> item;
				const metadata = this._testMetadata[test.id];

				if (!metadata) {
					return;
				}

				hasVisualTests = true;
				const fragment = createTestCompareNode(metadata);
				fragments.push(fragment);
			}
		});

		const document = createSuiteReport(suite, fragments);
		const htmlFilename = joinPath(this.reportLocation, getTestDirectory(suite), 'index.html');
		save(htmlFilename, document);

	}

	writeRoot(): void {
		// TODO write a top-level index.html
		// TODO optionally report on baselines not used in this test run
	}
}
