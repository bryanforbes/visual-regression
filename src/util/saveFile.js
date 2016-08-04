var fs = require('fs');
var mkdirp = require('mkdirp');
var pathUtil = require('path');

/**
 * Saves a baseline PNG to disk
 * @param filename the location of the PNG
 * @param screenshot a buffer containing the baseline image
 */
function saveFile(filename, screenshot) {
	mkdirp.sync(pathUtil.dirname(filename));
	fs.writeFileSync(filename, screenshot);
}

module.exports = saveFile;
