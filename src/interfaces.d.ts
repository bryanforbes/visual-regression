import Command = require('leadfoot/Command');
import Test = require('intern/lib/Test');

declare type CommandHelper = () => Command<any>;

export interface RGBColor {
	red: number;
	green: number;
	blue: number;
}

export interface RGBAColor {
	alpha: number;
	red: number;
	green: number;
	blue: number;
}

export type ColorObject = RGBColor | RGBAColor;

export type RGBColorArray = [ number, number, number ];
export type RGBAColorArray = [ number, number, number, number ];
export type ColorArray = RGBAColorArray | RGBColor;

export interface ImageMetadata {
	filename?: string;
	height: number;
	width: number;
}

export interface Report {
	baseline: ImageMetadata;
	actual: ImageMetadata;
	differences: number[];
	hasDifferences: boolean;
	height: number;
	isPassing: boolean;
	numDifferences: number;
	width: number;
}

export interface VisualRegressionTest extends Test {
	visualReports?: Report[];
}

export interface ImageAdapter {
	save(filename: string): Promise<void>;
	export(): Promise<Buffer>;
}

export type ImageReference = Buffer | string;

export interface ImageComparator {
	compare(baseline: ImageReference, actual: ImageReference): Promise<Report>;
}
