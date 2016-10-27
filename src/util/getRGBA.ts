import {RGBColor, RGBAColorArray, ColorObject, RGBAColor} from '../interfaces';

export type ColorDescriptor = string | RGBColor | number[] | number;

function stringToNumber(radix: number = 10) {
	return function (str: string) {
		return parseInt(str, radix);
	};
}

function normalize(color: number[]): RGBAColorArray {
	while (color.length < 4) {
		color.push(0);
	}
	return <RGBAColorArray> color;
}

function fromHex(color: string): number[] {
	var rgb: string[] = [];
	color = color.replace(/[^0-9]/, '');

	var digits = color.length >= 6 ? 2 : 1;
	for (var i = 0; i < color.length; i += digits) {
		rgb.push(color.substring(i, i + digits));
	}
	return rgb.map(stringToNumber(16));
}

function fromString(color: string): number[] {
	if (color.charAt(0) === '#') {
		return fromHex(color);
	}
	return color.match(/\d+/g).map(stringToNumber());
}

function fromObject(color: ColorObject): RGBAColorArray {
	var rgba: number[] = [];

	rgba.push(color.red || 0);
	rgba.push(color.green || 0);
	rgba.push(color.blue || 0);
	rgba.push((<RGBAColor> color).alpha || 0xFF);

	return <RGBAColorArray> rgba;
}

export default function getRGBA(color: ColorDescriptor): RGBAColorArray {
	if (typeof color === 'number') {
		return [color, color, color, 0xFF];
	}
	if (typeof color === 'string') {
		return normalize(fromString(color));
	}
	if (Array.isArray(color)) {
		return normalize(<number[]> color);
	}
	if (typeof color === 'object') {
		return fromObject(<RGBColor> color);
	}
}
