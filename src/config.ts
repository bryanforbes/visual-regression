import * as intern from 'intern';
import { mixin } from 'dojo/lang';

export interface Config {
	baselineLocation?: string;
	comparator?: ComparatorConfig;
	directory?: string;
	minPercentMatching?: number;
	missingBaseline?: 'skip';
	reportLocation?: string;
	tolerance?: number;
}

export interface ComparatorConfig {
	errorColor?: string;
	overlayBaselineOpacity?: number;
}

const internConfig: any = (<any> intern).config || {};
const visualConfig: Config = internConfig.visual || {};
const defaults: Config = {
	directory: 'visual-test',

	reportLocation: 'report',

	baselineLocation: 'baselines',

	tolerance: 0.1,

	missingBaseline: 'skip',

	minPercentMatching: 0.999,

	comparator: {
		errorColor: '#000',

		overlayBaselineOpacity: 0.3
	}
};

const config: Config = mixin<Config>({}, defaults, visualConfig);
export default config;
