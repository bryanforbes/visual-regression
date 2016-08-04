function Collector() {
	this.reports = {};
}

Collector.prototype = {
	constructor: Collector,

	add: function (report) {
		var id = report.id;
		var list = this.reports[id] || [ ];
		list.push(report);
		this.reports[id] = list;
	}
};

module.exports = new Collector();
