var fs = require('fs');
var pngjs = require('pngjs');

/**
 * Load a baseline PNG from disk
 * @param filename the location of the PNG
 * @return {Promise} resolves to a file buffer containing the baseline image
 */
function loadPng(filename) {
	return new Promise(function (resolve, reject) {
		var png = new pngjs.PNG();
		fs.createReadStream(filename)
			.pipe(png)
			.on('parsed', function () {
				resolve(png);
			})
			.on('error', function (error) {
				reject(error);
			});
	});
}

module.exports = loadPng;
