export const capabilities = {
	'browserstack.selenium_version': '2.45.0'
};

export const environments = [
	{ browserName: 'internet explorer', version: '11', platform: 'WIN8' },
	{ browserName: 'internet explorer', version: '10', platform: 'WIN8' },
	{ browserName: 'internet explorer', version: '9', platform: 'WINDOWS' },
	{ browserName: 'firefox', version: '37', platform: [ 'WINDOWS', 'MAC' ] },
	{ browserName: 'chrome', version: '39', platform: [ 'WINDOWS', 'MAC' ] },
	{ browserName: 'safari', version: '8', platform: 'MAC' }
];

export const maxConcurrency = 2;

export const tunnel = 'SauceLabsTunnel';

export * from './intern';
