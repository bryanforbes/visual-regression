import { Report, ImageMetadata } from '../interfaces';
import config from '../config';

export interface Options {
	matchRatio?: number;
}

export default class {
	matchRatio: number;

	readonly actual: ImageMetadata;

	readonly baseline: ImageMetadata;

	readonly log: string[] = [];

	private _mismatchedCoordinates: number[] = [];

	private _error: Error;

	private _start: number[];

	private _runningTime: number[];

	constructor(baseline: ImageMetadata, actual: ImageMetadata, options: Options = {}) {
		this.baseline = baseline;
		this.actual = actual;
		this.matchRatio = options.matchRatio || config.comparator.matchRatio;
	}

	get error(): Error {
		return this._error;
	}

	get report(): Report {
		const width = this.baseline.width;
		const height = this.baseline.height;
		const numPixels = width * height;
		const numDifferences = this._mismatchedCoordinates.length / 2;
		const percentMatching = (numPixels - numDifferences) / numPixels;

		return {
			actual: this.actual,
			baseline: this.baseline,
			differences: this._mismatchedCoordinates,
			hasDifferences: numDifferences > 0,
			height: height,
			isPassing: percentMatching >= this.matchRatio,
			numDifferences,
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
		this._mismatchedCoordinates.push(x);
		this._mismatchedCoordinates.push(y);
	}

	recordStart(): void {
		this._start = process.hrtime();
	}

	recordEnd(): void {
		this._runningTime = process.hrtime(this._start);
	}
}
