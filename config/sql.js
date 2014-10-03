module.exports = function(context) {
  var sqlite3 = require('sqlite3').verbose();
  var fs = require("fs");

  var filename = context + ".db";

  var db = new sqlite3.Database(filename);
  var login = {};

  var exists = fs.existsSync(filename);;

  login.newTable = function() {
    if(exists){return;}
    db.run("CREATE TABLE login (username test, password text)");
    db.close();
  };
  login.insert = function(a, b) {
    db.run("INSERT INTO login VALUES ('"+a+"', '"+b+"')");
    db.close();
  };
  login.query = function() {
    db.each("SELECT username FROM login", function(err, row) {
      console.log(row);
    })
    db.close();
  };
  return login;

}