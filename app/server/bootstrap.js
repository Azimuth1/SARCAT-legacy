//console.log(Meteor.settings);
//process.env.METEOR_SETTINGS.initSetup=false;
//console.log(process.env.METEOR_;SETTINGS.initSetup);

Meteor.startup(function () {

    //console.log(__meteor_bootstrap__.serverDir);return

    //data = Assets.getBinary('uploads/main_logo');
    //console.log(data);
    //return
    UploadServer.init({
        tmpDir: process.env.PWD + '/public/uploads/tmp',
        uploadDir: process.env.PWD + '/public/uploads/',
        getDirectory: function (fileInfo, formData) {
            if (formData._id) {
                return '/records/' + formData._id;
            }
            if (formData.type === 'logo') {
                //fileInfo.name = 'main_logo'
                return '/logo';
            }

            //return formData.contentType;
            //return formData.userName;
        },
        checkCreateDirectories: true //create the directories for you
    })
    if (!Config.find()
        .count() && !Meteor.users.find()
        .count()) {
        //Config.insert(Meteor.settings.production.public);

        var customSettings = {
            'initSetup': true,
        };
        Config.insert(customSettings);
        var admin = Accounts.createUser({
            email: 'admin@sarcat',
            password: 'admin',
            username: 'default'
        });
        Roles.addUsersToRoles(admin, ['admin']);

    }
    
});

