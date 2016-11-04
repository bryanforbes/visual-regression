import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import resizeWindow from 'src/helpers/resizeWindow';

const basicPageUrl = require.toUrl('../support/pages/basic.html');

const suite: Object = {
	name: 'resizeWindow'
};

[
	// [ 3440, 1440 ],
	// [ 1024, 768 ],
	[ 640, 480 ]
].map(function ([ width, height ]) {
	(<any> suite)[`${width}x${height}`] = function (): void {
		let maximizedWidth: number;
		let maximizedHeight: number;

		return this.remote
			.get(basicPageUrl)
			.maximizeWindow()
			.execute(function () {
				return [ window.innerWidth, window.innerHeight ];
			})
			.then(function ([ width, height ]: [ number, number ]) {
				maximizedWidth = width;
				maximizedHeight = height;
			})
			.then(resizeWindow(width, height))
			.execute(function () {
				return [ window.innerWidth, window.innerHeight ];
			})
			.then(function ([ actualWidth, actualHeight ]: [ number, number ]) {
				assert.isTrue(actualWidth === width || actualWidth === maximizedWidth,
					`expected width ${ actualWidth } to equal ${ width } or ${ maximizedWidth }`);
				assert.isTrue(actualHeight === height || actualHeight === maximizedHeight,
					`expected height ${ actualHeight } to equal ${ height } or ${ maximizedHeight }`);
			});
	};
});

registerSuite(suite);
