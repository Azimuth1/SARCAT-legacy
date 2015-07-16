(function () {
    Meteor.startup(function () {
        console.log('starting sarcat');
        //console.log(process.env.METEOR_SETTINGS);
        //var METEOR_SETTINGS = JSON.parse(process.env.METEOR_SETTINGS);
        config = Config.findOne();
        if (!config) {
            console.log('config:false');
            var makeEncryptionID = function () {
                var text = '';
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (var i = 0; i < 23; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
            };
            console.log('saving settings.config to mongodb');
            //Meteor.settings.config.encryptionKey = encryptionKey;
            encryptionKey = makeEncryptionID();
            Config.insert({
                encryptionKey: encryptionKey
            });
            config = Config.findOne();
        }
        if (!Meteor.users.find()
            .count()) {
            console.log('Creating default admin user.');
            var admin = Accounts.createUser({
                'email': 'admin@sarcat',
                'password': 'admin',
                'username': 'Default Admin'
            });
            Roles.addUsersToRoles(admin, ['admin']);
            Config.update(config._id, {
                $set: {
                    initSetup: true
                }
            });
        }
        var publicSettings = (Meteor.settings && Meteor.settings.public) ? Meteor.settings.public : config;
        _.each(publicSettings, function (d, e) {
            if (!_.isEqual(config[e], publicSettings[e])) {
                console.log('Updating config: ' + e);
                console.log(config[e] + ' --->   ' + publicSettings[e]);
                var obj = {};
                obj[e] = publicSettings[e];
                Config.update(config._id, {
                    $set: obj
                });
            }
        });
        /*if (!_.isEqual(config.layers, publicSettings.layers)) {
            console.log('Adding new Map Layers');
            Config.update(config
                ._id, {
                    $set: {
                        layers: publicSettings.layers
                    }
                }
            );
        }
        if (!_.isEqual(config.sarcatServer, publicSettings.sarcatServer)) {
            console.log('New sarcatServer');
            Config.update(config
                ._id, {
                    $set: {
                        sarcatServer: publicSettings.sarcatServer
                    }
                }
            );
        }*/
        //Meteor.settings.public.layers = config.layers;
        Accounts.config({
            loginExpirationInDays: null
        });
        //var dir = process.env.sarcatStorage || process.env.PWD;
        var fs = Npm.require('fs');
        var path = Npm.require('path');
        var dir = process.env.sarcatStorage ? process.env.sarcatStorage : process.env.PWD;
        var sarcatUploads = path.join(dir, 'public', 'uploads');
        /*if (process.env.sarcatStorage) {
            dir = process.env.sarcatDir;
            sarcatDir = path.join(dir, 'app', 'programs', 'web.browser', 'app', 'uploads')
        }*/
        UploadServer.init({
            tmpDir: path.join(sarcatUploads, 'tmp'),
            uploadDir: path.join(sarcatUploads, '/'),
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
        WebApp.connectHandlers.use(function (req, res, next) {
            var re = /^\/uploads\/(.*)$/.exec(req.url);
            if (re !== null) {
                var filePath = path.join(sarcatUploads, re[1]);
                //var filePath = dir + '/app/programs/web.browser/app/uploads/' + re[1];
                var data = fs.readFileSync(filePath, data);
                /*res.writeHead(200, {
                    'Content-Type': 'image'
                });*/
                res.write(data);
                res.end();
            } else {
                next();
            }
        });
        console.log(dir);
        console.log('sarcat running at: ' + process.env.ROOT_URL + ':' + process.env.PORT)
    });
})();

