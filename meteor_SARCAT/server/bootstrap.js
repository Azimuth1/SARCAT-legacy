//console.log(Meteor.settings);
//process.env.METEOR_SETTINGS.initSetup=false;
//console.log(process.env.METEOR_;SETTINGS.initSetup);

Meteor.startup(function () {


function b(){

            var apiKey = '<PRIVATE>';
            var url = 'https://api.forecast.io/forecast/';
            var lati = 0;
            var longi = 0;
            var data;

           
        }




    if (!Config.find().count() && !Meteor.users.find().count()) {
        //Config.insert(Meteor.settings.production.public);

        var customSettings = {
            'initSetup': false
        };
        Config.insert(customSettings);
        var admin = Accounts.createUser({
            email: 'a@a',//dmin@sarcat',
            password: 'a',//dmin',
            username: 'default'
        });
        Roles.addUsersToRoles(admin, ['admin']);

    }

});
