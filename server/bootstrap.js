Meteor.startup(function () {
    /*smtp = {
        username: 'your_username', // eg: server@gentlenode.com
        password: 'your_password', // eg: 3eeP1gtizk5eziohfervU
        server: 'smtp.gmail.com', // eg: mail.gandi.net
        port: 25
    }
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
    */
    var settings = JSON.parse(process.env.METEOR_SETTINGS);
    //console.log(settings)
    var environment = process.env.METEOR_ENV || "development";
    var config = Config.findOne();
    if (config) {
        console.log('config')
    } else {
        console.log('noconfig')
    }
    if (Meteor.users.find().count()) {
        console.log('users')
    } else {
        console.log('nousers')
    }
    var privateSettings = settings.private;
    var defaultUser = privateSettings.defaultUser || {
        email: 'admin@sarcat',
        password: 'admin',
        username: 'default'
    };
    Accounts.config({
        loginExpirationInDays: null
    })
    if (!config) {
        function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 23; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
            }
            //encryptionKey = "adsffe534tryertrrtweGe";
        encryptionKey = makeid();
        // if (!Meteor.users.find().count()) {
        console.log('Creating default admin user.');
        var admin = Accounts.createUser({
            email: defaultUser.email,
            password: defaultUser.password,
            username: defaultUser.username
        });
        Roles.addUsersToRoles(admin, ['admin']);
        console.log('saving settings.config to mongodb');
        settings.config.encryptionKey = encryptionKey;
        Config.insert(settings.config);
    }
    Meteor.settings.public.email = defaultUser.email;

    Meteor.settings.public.config = config || settings.config;
    Meteor.settings.private.encryptionKey = Meteor.settings.public.config.encryptionKey;
    UploadServer.init({
        tmpDir: process.env.PWD + '/public/uploads/tmp',
        uploadDir: process.env.PWD + '/public/uploads/',
        getDirectory: function (fileInfo, formData) {
            if (formData._id) {
                return '/records/' + formData._id;
            }
            if (formData.type === 'logo') {
                console.log('!!!')
                return '/logo';
            }
        },
        /*finished: function (fileInfo, formFields) {
            if (formData._id) {
                return '/records/' + formData._id;
            }
            if (formData.type === 'logo') {
                return '/logo';
            }
        },*/
        cacheTime: 100,
    });
});
