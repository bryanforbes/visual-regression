var fs = require('fs');
var mkdirp = require('mkdirp');
var pathUtil = require('path');

/**
 * Saves a PNG to disk
 * @param filename the location of the PNG
 * @param png a buffer containing the baseline image
 */
function saveFile(filename, png) {
	return new Promise(function (resolve, reject) {
		mkdirp(pathUtil.dirname(filename), function (err) {
			if (err) {
				reject(err);
			}
			else {
				var stream = fs.createWriteStream(filename);
				stream.on('finish', function () {
					resolve();
				});
				stream.on('error', function (error) {
					reject(error);
				});
				png.pack().pipe(stream);
			}
		})
	});
}

module.exports = saveFile;
