import WritableStream = NodeJS.WritableStream;

export interface Options {
	baselineLocation?: string;
	reportLocation?: string;
	directory?: string;
	reportUnusedBaselines?: boolean;
	writeDifferenceImage?: boolean;
	writeReport?: boolean;
	writeScreenshot?: 'never' | 'fail' | 'always';
}

export interface ReportConfig extends Options {
	console: any;
	output: WritableStream;
}
