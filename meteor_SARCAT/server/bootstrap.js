//console.log(Meteor.settings);
//process.env.METEOR_SETTINGS.initSetup=false;
//console.log(process.env.METEOR_;SETTINGS.initSetup);

Meteor.startup(function () {



    if (!Config.find().count() && !Meteor.users.find().count()) {
        //Config.insert(Meteor.settings.production.public);

        var customSettings = {
            'initSetup': true
        };
        Config.insert(customSettings);
        var admin = Accounts.createUser({
            email: 'a@a', //dmin@sarcat',
            password: 'a', //dmin',
            username: 'default'
        });
        Roles.addUsersToRoles(admin, ['admin']);

    }

});
