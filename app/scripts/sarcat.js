var sarcat = function(options) {
	var context = d3.select('body');
	var sar = {};
	var config = sar.config = {};
	sar.auth = function(a,b) {
		sarcat.auth(a,b, function(e) {
			console.log('user authenticated');
			config.user = e;
			sar.dashboardPage(e);
		});
	};
	sar.formPage = function() {
		context.selectAll('div')
			.remove();
		return sarcat.formPage(context, options.layout);
	};
	sar.dashboardPage = function() {
		//if(!user){return;}
		context.selectAll('div')
			.remove();
		return sarcat.dashboardPage(context, sar);
	};
	sar.loginPage = function() {
		context.selectAll('div')
			.remove();
		return sarcat.loginPage(context, sar);
	};
	//sar.loginPage();
	sar.formPage();
	return sar;
};