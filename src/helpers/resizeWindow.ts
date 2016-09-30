import { CommandHelper } from '../interfaces';

export default function (width: number, height: number): CommandHelper {
	return function () {
		return this.parent
			.setWindowSize(width, height)
			.setExecuteAsyncTimeout(5000)
			.executeAsync(function (width: number, height: number, callback: (result: any) => void) {
				function isResized() {
					return window.innerHeight <= height && window.innerWidth <= width;
				}

				var handle = setInterval(function () {
					if (isResized()) {
						clearInterval(handle);
						callback([ window.innerHeight, window.innerWidth ]);
					}
				}, 250);
			}, [ width, height ]);
	};
}
