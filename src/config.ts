// TODO import Intern's configuration and use that to override the defaults

export interface ComparatorConfig {
	errorColor?: string;
	overlayBaselineOpacity?: number;
}

export interface Config {
	baselineLocation?: string;
	comparator: ComparatorConfig;
	directory?: string;
	minPercentMatching: number;
	missingBaseline?: 'skip';
	reportLocation?: string;
	tolerance?: number;
}

const config: Config = {
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

export default config;
