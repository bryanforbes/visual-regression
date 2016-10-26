import resizeWindow from './helpers/resizeWindow';
import assertVisuals, { Options as AssertVisualOptions } from './assertVisuals';
import * as Command  from 'leadfoot/Command';

export interface Options extends AssertVisualOptions {
	url: string;
	width?: number;
	height?: number;
}

/**
 * Create an Intern test from a series of options
 * @param options options for the test
 * @param options.url the destination url for the visual regression test
 * @return {Function} a visual regression test
 */
export default function (options: Options): () => Command<any> {
	return function () {
		return this.remote
			.get(options.url)
			.then(function () {
				if (options.width && options.height) {
					return resizeWindow(options.width, options.height).apply(this);
				}
			})
			.takeScreenshot()
			.then(assertVisuals(this, options));
	};
}