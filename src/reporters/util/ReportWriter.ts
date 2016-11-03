import { join as joinPath, extname, basename } from 'path';
import { VisualRegressionTest, AssertionResult } from '../../assert';
import globalConfig from '../../config';
import getRGBA from '../../util/getRGBA';
import { RGBAColorArray, BufferImageMetadata } from '../../interfaces';
import saveDifferenceImage from './saveDifferenceImage';
import { getTestDirectory, save, copy }
	from '../../util/file';
import { ColorDescriptor } from '../../util/getRGBA';
import WritableStream = NodeJS.WritableStream;
import Suite = require('intern/lib/Suite');

export interface Options {
	baselineLocation?: string;
	errorColor?: ColorDescriptor;
	reportLocation?: string;
	directory?: string;
	reportUnusedBaselines?: boolean;
	writeDifferenceImage?: boolean;
	writeReport?: boolean;
	writeScreenshot?: 'never' | 'fail' | 'always';
}

export interface ReportConfig extends Options {
	console: any;
	output: WritableStream;
}

export interface Note {
	level: 'info' | 'warn' | 'error' | 'fatal';
	message: string;
	type: string;
}

interface TestMetadata {
	result: AssertionResult;
	directory: string;
	baseline?: string;
	difference?: string;
	screenshot?: string;
}

export function addSuffix(filename: string, suffix: string): string {
	const extension = extname(filename);
	const base = basename(filename, extension);
	return base + suffix + extension;
}

function constructDirectory(base: string, location: string) {
	if (/^\/|\\/.test(location)) {
		// Absolute location
		return location;
	}

	return joinPath(base, location);
}

// function createHtml(title: string, body: string): string {
// 	const fragment = `
// 	<!doctype html>
// 	<html lang="en">
// 	<head>
// 		<title>${ title }</title>
// 	</head>
// 	<body>
// 		${ body }
// 	</body>
// 	</html>`;
// 	return fragment;
// }
//
// function createHeader() {
// 	const fragment = `
// 	<header>
// 		<img class="headerLogo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACACAMAAADwFUHEAAADAFBMVEUAAAAAAAAAAABVVVVAQEBmZmZVVVVtbW1gYGBVVVVmZmZdXV1qampiYmJtbW1mZmZwcHBpaWljY2Nra2tmZmZtbW1oaGhvb29qampwcHBsbGxoaGhtbW1qampvb29ra2twcHBsbGxxcXFtbW1qampubm5ra2tvb29sbGxwcHBtbW1xcXFubm5sbGxvb29tbW1wcHBtbW1wcHBubm5xcXFvb29tbW1vb29tbW1wcHBubm5wcHBvb29xcXFvb29tbW1wcHBubm5wcHBubm5xcXFvb29xcXFvb29ubm5wcHBubm5wcHBvb29xcXFvb29xcXFwcHBubm5wcHBwcHBvb29xcXFvb29ubm5xcXFwcHBvb29wcHBwcHBvb29xcXFwcHBubm5wcHBvb29wcHBvb29xcXFvb29xcXFwcHBvb29wcHBvb29wcHBvb29xcXFwcHBxcXFwcHBvb29wcHBvb29wcHBvb29xcXFwcHBxcXFwcHBvb29wcHBubm5wcHBwcHBwcHBxcXFwcHBvb29wcHBvb29xcXFwcHBwcHBvb29xcXFwcHBvb29wcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBvb29wcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBwcHBwcHBxcXFwcHBwcHBxcXFwcHBwcHBwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFxcXFwcHBwcHBxcXFwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBxcXFwcHBwcHBxcXFwcHBxcXFwcHBxcXFwcHBxcXFxcXFwcHBxcXFwcHBxcXFwcHBxcXFxcXFwcHBxcXFxcXFwcHBwcHBxcXFwcHBxcXFxcXFwcHBxcXFxcXFwcHBxcXF+cGExAAAA/3RSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1O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">
// 		<span class="headerTitle">Intern Visual Regression Report</span>
// 	</header>`;
// 	return fragment;
// }

// function createTestCompareNode(baseline: string, difference: string): string {
// 	const fragment = `
// 		<img src="${ baseline }">
// 		<img src="${ difference }">
// 	`;
// 	return fragment;
// }
//
// function createNoteFragment(notes: Note[]): string {
// 	let fragment = '<ul>';
// 	notes.forEach(function (note: Note) {
// 		fragment += `<li>${ note.message }</li>`;
// 	});
// 	fragment += '</ul>';
// 	return fragment;
// }
//
// function createSuiteReport(suite: Suite, fragments: string[]): string {
// 	const title = suite.name;
// 	const results = fragments.reduce(function (html: string, fragment: string) {
// 		html += `
// 			<div>
// 				${ fragment }
// 			</div>
// 			`;
// 		return html;
// 	}, '');
//
// 	return createHtml(title, createHeader() + results);
// }

export default class {
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

	private _testMetadata: { [ key: string ]: TestMetadata[] } = {};

	constructor(config: ReportConfig) {
		const baseDirectory = 'directory' in config ? config.directory : globalConfig.directory;
		const reportLocation  = 'reportLocation' in config ?
			config.reportLocation : globalConfig.report.reportLocation;

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

	private appendMetadata(id: string, metadata: TestMetadata): void {
		const metadatas = this._testMetadata[id] = this._testMetadata[id] || [];
		metadatas.push(metadata);
	}

	writeTest(test: VisualRegressionTest): Promise<any> {
		const results: AssertionResult[] = test.visualResults;
		const directory = joinPath(this.reportLocation, getTestDirectory(test.parent));

		if (!results) {
			return Promise.resolve();
		}

		return Promise.all(results.map((result) => {
			if (!result.report) {
				return null;
			}

			const report = result.report;
			const metadata: TestMetadata = {
				result: result,
				directory,
				baseline: null,
				difference: null,
				screenshot: null
			};

			this.appendMetadata(test.id, metadata);

			return Promise.resolve()
				.then(() => { // Write difference image
					if (!report.isPassing && this.writeDifferenceImage) {
						const difference = metadata.difference = addSuffix(result.baseline, '-diff');

						return saveDifferenceImage(report, joinPath(directory, difference), {
							errorColor: this.errorColor
						});
					}
				})
				.then(() => { // Write screenshot
					if (this.writeScreenshot === 'fail' && !report.isPassing || this.writeScreenshot === 'always') {
						const screenshot: Buffer = (<BufferImageMetadata> report.actual).buffer;

						if (screenshot) {
							const screenshot = metadata.screenshot = addSuffix(result.baseline, '-actual');
							return save(joinPath(directory, screenshot), (<BufferImageMetadata> report.actual).buffer);
						}
						else {
							this.addNote({
								level: 'error',
								message: `Failed to write screenshot. Missing buffer.`,
								type: 'image write'
							});
						}
					}
				})
				.then(() => { // write baseline image
					const source = joinPath(result.directory, result.baseline);
					const target = joinPath(this.reportLocation, result.baseline);
					metadata.baseline = result.baseline;
					return copy(source, target);
				});
		}));
	}

	writeSuite(suite: Suite): Promise<any> {
		return Promise.resolve();
	}

	end(): Promise<any> {
		return Promise.resolve();
	}
}
