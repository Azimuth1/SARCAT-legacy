sarcat.auth = function(name,pw, callback) {
	d3.json('data/login.json', function(d) {
		callback(d.login);
	});
};