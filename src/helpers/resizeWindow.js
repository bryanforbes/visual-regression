function resizeWindow(width, height) {
	return function () {
		return this.parent
			.setWindowSize(width, height)
			.setExecuteAsyncTimeout(5000)
			.executeAsync(function (width, height, callback) {
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
	}
}

module.exports = resizeWindow;
