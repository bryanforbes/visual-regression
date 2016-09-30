import { default as assertVisuals } from './assertVisuals';
import { default as config } from './config';
import { default as visualTest } from './visualTest';
import getBaselineName from './util/getBaselineName';
import getRGBA from './util/getRGBA';
import saveFile from './util/saveFile';

const util = {
	getBaselineName,
	getRGBA,
	saveFile
};

export {
	assertVisuals,
	config,
	util,
	visualTest,
};
