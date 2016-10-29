import WritableStream = NodeJS.WritableStream;
import { ColorDescriptor } from '../util/getRGBA';

export interface Options {
	baselineLocation?: string;
	errorColor?: ColorDescriptor;
	reportLocation?: string;
	directory?: string;
	reportUnusedBaselines?: boolean;
	writeDifferenceImage?: boolean;
	writeBaselines?: boolean;
	writeReport?: boolean;
	writeScreenshot?: 'never' | 'fail' | 'always';
}

export interface ReportConfig extends Options {
	console: any;
	output: WritableStream;
}
