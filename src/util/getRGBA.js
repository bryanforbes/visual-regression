function stringToNumber(radix) {
	radix = radix || 10;
	return function (str) {
		return parseInt(str, radix);
	}
}

function normalize(color) {
	while (color.length < 4) {
		color.push(0);
	}
}

function fromHex(color) {
	var rgb = [];
	color = color.replace(/[^0-9]/, '');

	var digits = color.length >= 6 ? 2 : 1;
	for (var i = 0; i < color.length; i += digits) {
		rgb.push(color.substring(i, i + digits));
	}
	return rgb.map(stringToNumber(16));
}

function fromString(color) {
	if (color.charAt(0) === '#') {
		return fromHex(color);
	}
	return color.match(/\d+/g).map(stringToNumber());
}

function fromObject(color) {
	var rgba = [];

	rgba.push(color.r || color.red || 0);
	rgba.push(color.g || color.green || 0);
	rgba.push(color.b || color.blue || 0);
	rgba.push(color.a || color.alpha || 0);

	return rgba;
}


function getRGBA(color) {
	if (typeof color === 'string') {
		return normalize(fromString(color));
	}
	if (Array.isArray(color)) {
		return normalize(color);
	}
	if (typeof color === 'object') {
		return fromObject(color);
	}
}

module.exports = getRGBA;
