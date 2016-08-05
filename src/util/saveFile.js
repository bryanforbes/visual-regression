var fs = require('fs');
var mkdirp = require('mkdirp');
var pathUtil = require('path');

/**
 * Saves a buffer to disk
 * @param filename the location of the PNG
 * @param buffer a buffer containing the baseline image
 */
function saveFile(filename, buffer) {
	mkdirp.sync(pathUtil.dirname(filename));
	fs.writeFileSync(filename, buffer);
}

module.exports = saveFile;
