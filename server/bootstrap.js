aa = 'kyle'
Meteor.startup(function () {
    /*
        var environment = process.env.METEOR_ENV || "development";
        var settings = JSON.parse(process.env.METEOR_SETTINGS);

        if (environment === "production") {
            Meteor.settings = settings.production;
        } else if (environment === "staging") {
            Meteor.settings = settings.staging;
        } else {
            Meteor.settings = settings.development;
        }
        console.log("Using [ " + environment + " ] Meteor.settings");
    */

    var METEOR_SETTINGS = JSON.parse(process.env.METEOR_SETTINGS);
    //console.log(Object.keys(METEOR_SETTINGS));
    //var environment = process.env.NODE_ENV; // || "development";
    //console.log('NODE_ENV: ' + environment);
    //var settings = METEOR_SETTINGS[environment];
    //Meteor.settings = settings;
    //console.log(Object.keys(settings));
    //return
    config = Config.findOne();

    if (!config) {
        console.log('config:false')
        var makeEncryptionID = function () {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 23; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
            }
            //encryptionKey = "adsffe534tryertrrtweGe";
        encryptionKey = makeEncryptionID();
        // if (!Meteor.users.find().count()) {
        console.log('Creating default admin user.');
        var admin = Accounts.createUser(Meteor.settings.private.defaultUser);
        Roles.addUsersToRoles(admin, ['admin']);
        console.log('saving settings.config to mongodb');
        Meteor.settings.config.encryptionKey = encryptionKey;
        Config.insert(Meteor.settings.config);
        config = Meteor.settings.config
    }

    Meteor.settings.public.encryptionKey = config.encryptionKey;
    Meteor.settings.private.encryptionKey = config.encryptionKey;

    Accounts.config({
        loginExpirationInDays: null
    });
    UploadServer.init({
        tmpDir: process.env.PWD + '/public/uploads/tmp',
        uploadDir: process.env.PWD + '/public/uploads/',
        getDirectory: function (fileInfo, formData) {
            if (formData._id) {
                return '/records/' + formData._id;
            }
            if (formData.type === 'logo') {

                return '/logo';
            }
        },
        cacheTime: 100,
    });

});

