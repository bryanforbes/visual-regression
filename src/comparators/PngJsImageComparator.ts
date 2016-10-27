import { PNG } from 'pngjs';
import {ImageComparator, ImageReference, Report, ImageMetadata, RGBColor} from '../interfaces';
import ImageComparison from './ImageComparison';
import { createReadStream } from 'fs';
import config from '../config';

export interface Options {
	[ key: string ]: any;
}

export default class PngJsImageComparator implements ImageComparator {
	pixelTolerance: RGBColor = {
		red: 8,
		green: 8,
		blue: 8
	};

	pixelSkip: number = 8;

	constructor(options: Options = {}) {
		Object.apply(this, options);
	}

	compare(baseline: ImageReference, actual: ImageReference): Promise<Report> {
		if (baseline == null || actual == null) {
			return Promise.reject<Report>(new Error('null image'));
		}

		return Promise.all([
			this._loadImage(baseline),
			this._loadImage(actual)
		]).then(([
			{ png: baselinePng, metadata: baselineMetadata },
			{ png: actualPng, metadata: actualMetadata }
		]) => {
			if (baselinePng.width !== actualPng.width || baselinePng.height !== actualPng.height) {
				throw new Error('PNGs are different sizes. Expected (' + baselinePng.width + 'x' +
					baselinePng.height + '); ' + 'Actual (' + actualPng.width + 'x' + actualPng.height + ').');
			}

			const height = baselinePng.height;
			const width = baselinePng.width;
			const numSubPixels = (width * height) << 2;
			const redTol = this.pixelTolerance.red;
			const greenTol = this.pixelTolerance.green;
			const blueTol = this.pixelTolerance.blue;
			const increment = 4 * this.pixelSkip;

			const comparison = new ImageComparison(baselineMetadata, actualMetadata);

			const left = baselinePng.data;
			const right = actualPng.data;
			comparison.recordStart();
			for (let i = 0; i < numSubPixels; i += increment) {
				if (
					Math.abs(left[i] - right[i]) > redTol ||
					Math.abs(left[i + 1] - right[i + 1]) > greenTol ||
					Math.abs(left[i + 2] - right[i + 2]) > blueTol
				) {
					// translate 1D offset to 2D x, y coordinates
					const p = i >> 2;
					const x = p % width;
					const y = (p - x) / width;
					comparison.recordPixelDifference(x, y);
				}
			}
			comparison.recordEnd();

			return comparison.report;
		});
	}

	private _loadImage(image: ImageReference): Promise<{
		png: PNG,
		metadata: ImageMetadata
	}> {
		const loadPromise = (typeof image === 'string') ?
			this._loadPng(image) : Promise.resolve(PNG.sync.read(image));

		return loadPromise
			.then(function (png: PNG) {
				const metadata: ImageMetadata = {
					height: png.height,
					width: png.width
				};
				if (typeof image === 'string') {
					metadata.filename = image;
				}
				return {
					png,
					metadata
				};
			});
	}

	private _loadPng(filename: string): Promise<PNG> {
		return new Promise(function (resolve, reject) {
			const png = new PNG();

			createReadStream(filename)
				.pipe(png)
				.on('parsed', function () {
					resolve(png);
				})
				.on('error', function (error: Error) {
					reject(error);
				});
		});
	}
}
