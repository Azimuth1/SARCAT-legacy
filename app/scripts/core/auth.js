sarcat.auth = function(name,pw, callback) {
	console.log(name,pw)
	d3.json('../../data/login.json', function(d) {
		callback(d.login);
	});
};