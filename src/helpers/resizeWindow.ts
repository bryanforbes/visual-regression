import { CommandHelper } from '../interfaces';

let widthDifference: number = undefined;
let heightDifference: number = undefined;

export function findDifference(width: number, height: number): CommandHelper {
	return function () {
		return this.parent
			.setWindowSize(width, height)
			.setExecuteAsyncTimeout(5000)
			.executeAsync(function (done: (result: [ number, number ]) => void) {
				let lastWidth = window.innerWidth;
				let lastHeight = window.innerHeight;
				let handle = setInterval(function () {
					if (lastWidth === window.innerWidth && lastHeight === window.innerHeight) {
						clearInterval(handle);
						done([lastWidth, lastHeight]);
					}
					lastWidth = window.innerWidth;
					lastHeight = window.innerHeight;
				}, 100);
			})
			.then(function (result: [ number, number ]) {
				widthDifference = width - result[0];
				heightDifference = height - result[1];
				return [ widthDifference, heightDifference ];
			});
	};
}

export default function(width: number, height: number) {
	return function () {
		return this.parent
			.then(function () {
				if (widthDifference == null || heightDifference == null) {
					return this.parent
						.then(findDifference(width, height));
				}
			})
			.then(function () {
				width += widthDifference;
				height += heightDifference;

				return this.parent
					.setWindowSize(width, height);
			});
	};
}
