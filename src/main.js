define([
	'require'
], function (require) {
	var plugin = {
		/**
		 * Default our AMD plugin to use intern's dojo node AMD plugin
		 */
		nodeModule: 'intern/dojo/node!',

		/**
		 * AMD plugin API to serve top level visual regression test methods
		 */
		load: function (id, parentRequire, callback) {
			require([ id ], callback);
		},

		/**
		 * AMD plugin API to normalize keywords to valid modules
		 */
		normalize: function (id) {
			if (id === 'test') {
				id = './visualTest';
			}
			if (id === 'assert') {
				id = './assertVisuals';
			}
			if (id === 'config') {
				id = './defaults';
			}

			return plugin.nodeModule + id;
		}
	};

	return plugin;
});
