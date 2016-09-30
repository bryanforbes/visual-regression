import { writeFileSync } from 'fs';
import { sync as mkdirSync } from 'mkdirp';
import { dirname } from 'path';

/**
 * Saves a buffer to disk
 * @param filename the location of the PNG
 * @param buffer a buffer containing the baseline image
 */
export default function (filename: string, buffer: Buffer | string) {
	mkdirSync(dirname(filename));
	writeFileSync(filename, buffer);
}
