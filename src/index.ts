/* tslint:disable:no-unused-variable */

import { default as assertVisuals } from './assert';
import { default as config } from './config';
import { default as visualTest } from './test';
import getBaselineName, { Options as getBaselineNameOptions } from './util/getBaselineName';
import getRGBA, { ColorDescriptor } from './util/getRGBA';
import saveFile from './util/saveFile';
import Test = require('intern/lib/Test');

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
