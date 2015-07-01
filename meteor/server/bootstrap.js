Meteor.startup(function() {
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
    console.log('starting sarcat');
    var METEOR_SETTINGS = JSON.parse(process.env.METEOR_SETTINGS);

    config = Config.findOne();
    if (!config) {
        console.log('config:false')
        var makeEncryptionID = function() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 23; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }

        encryptionKey = makeEncryptionID();



        console.log('Creating default admin user.');
        var admin = Accounts.createUser(Meteor.settings.private.defaultUser);
        Roles.addUsersToRoles(admin, ['admin']);
        console.log('saving settings.config to mongodb');
        Meteor.settings.config.encryptionKey = encryptionKey;



        Config.insert(Meteor.settings.config);
        config = Meteor.settings.config;
    }

    Meteor.settings.public.encryptionKey = config.encryptionKey;
    Meteor.settings.private.encryptionKey = config.encryptionKey;
    Accounts.config({
        loginExpirationInDays: null
    });

        var dir = process.env.sarcatDir || process.env.PWD;

var fs = Npm.require('fs');
var path = Npm.require('path');

var dir = process.env.PWD;
var sarcatDir = path.join(dir,'public/uploads');
if(process.env.sarcatDir){
    dir = process.env.sarcatDir;
    sarcatDir = path.join(dir,'app','programs','web.browser','app','uploads')

}


        UploadServer.init({
            tmpDir: path.join(sarcatDir,'tmp'),
            uploadDir: path.join(sarcatDir,'/'),
            //tmpDir: dir + '/app/programs/web.browser/app/uploads/tmp',
            //uploadDir: dir + '/app/programs/web.browser/app/uploads/',
            getDirectory: function(fileInfo, formData) {
                if (formData._id) {
                    return '/records/' + formData._id;
                }
                if (formData.type === 'logo') {
                    return '/logo';
                }
            },
            cacheTime: 100,
        });




        
        WebApp.connectHandlers.use(function(req, res, next) {
            var re = /^\/uploads\/(.*)$/.exec(req.url);
            if (re !== null) {
                var filePath = path.join(sarcatDir,re[1]);
                //var filePath = dir + '/app/programs/web.browser/app/uploads/' + re[1];
                var data = fs.readFileSync(filePath, data);
                res.writeHead(200, {
                    'Content-Type': 'image'
                });
                res.write(data);
                res.end();
            } else {
                next();
            }
        });



    console.log(dir);
    console.log('sarcat running at: ' + process.env.ROOT_URL + ':' + process.env.PORT)
});
