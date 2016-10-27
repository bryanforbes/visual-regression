import { PNG, PNGOptions } from 'pngjs';
import { RGBColor, RGBAColorArray, Report, ImageMetadata, ImageAdapter } from '../interfaces';
import { dirname } from 'path';
import { createWriteStream } from 'fs';
import * as mkdirp from 'mkdirp';

export interface Options {
	[ key: string ]: any;
}

function savePng(filename: string, png: PNG): Promise<void> {
	return new Promise<void>(function (resolve, reject) {
		mkdirp(dirname(filename), function (err) {
			if (err) {
				reject(err);
			}
			else {
				var stream = createWriteStream(filename);
				stream.on('finish', function () {
					resolve();
				});
				stream.on('error', function (error: Error) {
					reject(error);
				});
				png.pack().pipe(stream);
			}
		});
	});
}

export default class {
	backgroundColor: RGBColor = null;

	errorColor: RGBAColorArray = [ 0xFF, 0, 0, 0xFF ];

	matchRatio: number = 1;

	readonly actual: ImageMetadata;

	readonly baseline: ImageMetadata;

	readonly log: string[] = [];

	private _differenceCount: number = 0;

	private _difference: PNG;

	private _error: Error;

	private _start: number[];

	private _runningTime: number[];

	constructor(baseline: ImageMetadata, actual: ImageMetadata) {
		this.baseline = baseline;
		this.actual = actual;
	}

	get difference() {
		if (!this._difference) {
			this._difference = this._createImage();
		}

		return this._difference;
	}

	get differenceImageAdapter(): ImageAdapter {
		var self = this;
		const adapter: ImageAdapter = {
			save(filename: string) {
				return savePng(filename, self.difference);
			},

			export() {
				return Promise.resolve(self.difference.data);
			}
		};
		return adapter;
	}

	get error(): Error {
		return this._error;
	}

	get report(): Report {
		const width = this.baseline.width;
		const height = this.baseline.height;
		const numPixels = width * height;
		const matchingPixels = (numPixels - this._differenceCount) / numPixels;

		return {
			actual: this.actual,
			baseline: this.baseline,
			difference: this.differenceImageAdapter,
			hasDifferences: this._differenceCount > 0,
			height: height,
			isPassing: matchingPixels >= this.matchRatio,
			numDifferences: this._differenceCount,
			width: width
		};
	}

	get runningTime(): number {
		return this._runningTime && this._runningTime[0];
	}

	recordLog(item: string): void {
		this.log.push(item);
	}

	recordError(error: Error): void {
		this.recordLog(error.message);
		this._error = error;
	}

	recordPixelDifference(x: number, y: number): void {
		const png = this.difference;
		let index = (png.width * y + x) << 2;

		this._differenceCount++;

		png.data[index] = this.errorColor[0];
		png.data[index + 1] = this.errorColor[1];
		png.data[index + 2] = this.errorColor[2];
		png.data[index + 3] = this.errorColor[3];
	}

	recordStart(): void {
		this._start = process.hrtime();
	}

	recordEnd(): void {
		this._runningTime = process.hrtime(this._start);
	}

	private _createImage() {
		let options: PNGOptions = {
			width: this.baseline.width,
			height: this.baseline.height
		};

		if (this.backgroundColor) {
			options.colorType = 2;
			options.bgColor = this.backgroundColor;
		}

		const png = this._difference = new PNG(options);
		png.on('error', (err) => {
			this.recordError(err);
		});
		return png;
	}
}
