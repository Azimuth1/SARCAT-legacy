//var db = require('./config/sql')('sarcat');

//db.newTable();
//db.insert('a', 'b');
//db.query();




/*
var sqlite3 = require('sqlite3')
    .verbose();
var db = new sqlite3.Database('sarcat.db');
db.serialize(function () {
    //db.run("CREATE TABLE User (username text, password text)");
    //db.run("INSERT INTO User VALUES ('kyle', 'pw')");
    db.each('SELECT username FROM User', function (err, row) {
        console.log(row);
    });
db.close();
});
*/





var Sequelize = require('sequelize');


var sequelize = new Sequelize('sarcat.db', 'user', 'password', {
    dialect: 'sqlite'
});


User
  .find({ where: { username: 'john-doe' } })
  .complete(function(err, johnDoe) {
    if (!!err) {
      console.log('An error occurred while searching for John:', err);
    } else if (!johnDoe) {
      console.log('No user with the username "john-doe" has been found.');
    } else {
      console.log('Hello ' + johnDoe.username + '!');
      console.log('All attributes of john:', johnDoe.values);
    }
  });



return;

var Sequelize = require('sequelize');
var sequelize = new Sequelize('database_name', 'username', 'password', {
    dialect: 'sqlite',
    storage: "./sarcat.db"
});
var User = sequelize.define('User', {
    username: Sequelize.STRING,
    password: Sequelize.STRING
});

sequelize.sync({
        force: true
    })
    .complete(function (err) {
        User.create({
                username: 'john',
                password: '1111'
            })
            .complete(function (err, user1) {
                User.find({
                        username: 'john'
                    })
                    .complete(function (err, user2) {
                        console.log(user1.values, user2.values)
                    })
            })
    })

return;

var passport = require('passport');
var LocalStrategy = require('passport-local')
    .Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));

passport.authenticate('local', function (d) {
    console.log('!')
})

//generate a new sarcat table
//db.newTable();
//db.insert('testUser','password');
//db.query();
