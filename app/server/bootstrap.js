Meteor.startup(function () {
    var settings = JSON.parse(process.env.METEOR_SETTINGS);
    //console.log(settings)
    var environment = process.env.METEOR_ENV || "development";
    var config = Config.findOne();
    var privateSettings = settings.private;
    var defaultUser = privateSettings.defaultUser || {
        email: 'admin@sarcat',
        password: 'admin',
        username: 'default'
    };
  
 
    if (!Meteor.users.find().count()) {
        console.log('Creating default admin user.');
        var admin = Accounts.createUser({
            email: defaultUser.email,
            password: defaultUser.password,
            username: defaultUser.username
        });
        Roles.addUsersToRoles(admin, ['admin']);
        console.log('saving settings.config to mongodb')
        Config.insert(settings.config);
    }
    Meteor.settings.public.email = defaultUser.email;
    Meteor.settings.public.config = config || settings.config;
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

