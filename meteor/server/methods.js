

Meteor.methods({
    importRecords: function (data) {
        data.forEach(function (d) {
            Records.insert(d);
        });
    },
    removeUser: function (userId) {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            var remove = Meteor.users.remove(userId);
            return remove;
        }
    },
    editUser: function (set, userId) {
        Meteor.users.update(userId, set, function (error, result) {
            if (error) {
                return error;
            }
            return result;
        });
    },
    encryptionKey: function (set, userId) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Config.findOne()
            .encryptionKey
    },
    setPassword: function (userId, password, passwordReset) {
        if (password) {
            var logout = Accounts.setPassword(userId, password, {
                logout: false
            });
        }
        var update = Meteor.users.update(userId, {
            $set: {
                'profile.passwordReset': passwordReset
            }
        });
        return update;
    },
    createAdmin: function (username, email, password, id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var newAdmin = Accounts.createUser({
            email: email,
            password: password,
            username: username
        });
        Meteor.users.update(newAdmin, {
            $set: {
                roles: ['admin']
            }
        }, function (error, result) {
            return (error, result);
        });
        Config.update(Config.findOne()
            ._id, {
                $set: {
                    initSetup: false
                }
            });
    },
    addRole: function (id, role) {
        Roles.addUsersToRoles(id, [role]);
    },
    updateConfig: function (val) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Config.update(Config.findOne()
            ._id, {
                $set: val
            }
        );
        return true;
    },
    addRecord: function (list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.insert(list);
    },
    removeRecord: function (records) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var id = records.map(function (d) {
            return d._id;
        })
        Records.remove({
            _id: {
                $in: id
            }
        });
        records.forEach(function (d) {
            RecordsAudit.insert({
                'type': 'remove',
                'recordId': id,
                'userId': Meteor.userId(),
                'userName': Meteor.user()
                    .username,
                'field': d.recordInfo.name,
                'value': d,
                'date': moment()
                    .format('MM/DD/YYYY HH:mm')
            });
        });
        return true;
    },
    pushArray: function (id, name) {
        var obj = {};
        obj[name] = {};
        var update = Records.update(id, {
            $push: obj
        });
        return update;
    },
    updateRecord: function (id, name, val) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var obj = {};
        obj[name] = val;
        var update = Records.update(id, {
            $set: obj
        });
     
        val = typeof (val) === 'object' ? JSON.stringify(val) : val;
        RecordsAudit.insert({
            'type': 'update',
            'recordId': id,
            'userId': Meteor.userId(),
            'userName': Meteor.user()
                .username,
            'field': name,
            'value': val,
            'date': moment()
                .format('MM/DD/YYYY HH:mm')
        });
        return update;
    },
    defaultAdmin: function () {
        var defaultAdmin = Meteor.users.find({
                emails: {
                    $elemMatch: {
                        address: 'admin@sarcat'
                    }
                }
            })
            .count();
        return defaultAdmin ? true : false;
    },
    deleteUser: function (targetUserId, group) {
        var loggedInUser = Meteor.user();
        if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['manage-users', 'support-staff'], group)) {
            throw new Meteor.Error(403, 'Access denied');
        }
        Roles.setUserRoles(targetUserId, [], group);
    },
    changeRole: function (user, val) {
        //RecordsAudit.remove({})
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.users.update(user, {
                $set: {
                    roles: [val]
                }
            });
        }
    },
    removeSubject: function (recordId, subjectId) {
        var newSubjects = Records.findOne(recordId)
            .subjects.subject.filter(function (d) {
                return d._key !== subjectId;
            });
        Records.update(recordId, {
            $set: {
                'subjects.subject': newSubjects
            }
        })
    },
    removeResource: function (recordId, resourceId) {
        var newResource = Records.findOne(recordId)
            .resourcesUsed.resource.filter(function (d) {
                return d._key !== resourceId;
            });
        Records.update(recordId, {
            $set: {
                'resourcesUsed.resource': newResource
            }
        })
    },
    getFilesInPublicFolder: function (id) {
        var fs = Npm.require('fs');
        var path = Npm.require('path');
        var dir = process.env.PWD;
        var sarcatDir = path.join(dir, 'public/uploads');
        if (process.env.sarcatDir) {
            dir = process.env.sarcatDir;
            sarcatDir = path.join(dir, 'app', 'programs', 'web.browser', 'app', 'uploads')
        }
        var filesDir = path.join(sarcatDir, 'records', id);
        //var dir = '../web.browser/app/uploads/records/' + id;
        if (!fs.existsSync(filesDir)) {
            return [];
        }
        var files = fs.readdirSync(filesDir);
        return files;
    },
    removeLogo: function () {
        var fs = Npm.require('fs');
        var path = Npm.require('path');
        var dir = process.env.PWD;
        var sarcatDir = path.join(dir, 'public', 'uploads');
        if (process.env.sarcatDir) {
            dir = process.env.sarcatDir;
            sarcatDir = path.join(dir, 'app', 'programs', 'web.browser', 'app', 'uploads')
        }
        var dir = process.env.sarcatDir || process.env.PWD;
        var dirPath = path.join(sarcatDir, 'logo');
        try {
            var files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var filePath = path.join(dirPath, files[i]);
                if (fs.statSync(filePath)
                    .isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
        }
        Config.update(Config.findOne()
            ._id, {
                $set: {
                    agencyLogo: ''
                }
            }
        );
    },
    //["Maine", "Massachusetts", "Michigan", "Montana", "Nevada", "New Jersey", "New York", "North Carolina", "Ohio", "Pennsylvania", "Rhode Island", "Tennessee", "Texas", "Utah", "Washington", "Wisconsin", "Puerto Rico", "Maryland", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Minnesota", "Mississippi", "Missouri", "Nebraska", "New Hampshire", "New Mexico", "North Dakota", "Oklahoma", "Oregon", "South Carolina", "South Dakota", "Vermont", "Virginia", "West Virginia", "Wyoming"]
    setCountry: function (id) {
        var record = Records.findOne(id);
        var coord = record.coords.ippCoordinates;
        coord = [coord.lng, coord.lat];
        var result = pip(countryGeojson, coord);
        if (!result || !result.length) {
            Records.update(id, {
                $set: {
                    'incidentLocation.country': 'Unknown',
                }
            });
            return;
        }
        var val = result[0].properties;
        var stateProvince = val.name ? val.name : 'Unknown';
        Records.update(id, {
            $set: {
                'incidentLocation.country': stateProvince,
            }
        });
        return result;
    },
    setStateProvince: function (id) {
        var record = Records.findOne(id);
        var coord = record.coords.ippCoordinates;
        coord = [coord.lng, coord.lat];
        var result = pip(USAStatesGeojson, coord);
        if (!result || !result.length) {
            Records.update(id, {
                $set: {
                    'incidentLocation.state-province': 'Unknown',
                }
            });
            return;
        }
        var val = result[0].properties;
        var stateProvince = val.NAME ? val.NAME : 'Unknown';
        Records.update(id, {
            $set: {
                'incidentLocation.state-province': stateProvince,
            }
        });
        return result;
    },
    setEcoRegion: function (id) {
        var record = Records.findOne(id);
        var coord = record.coords.ippCoordinates;
        coord = [coord.lng, coord.lat];
        var result = pip(EcoRegionGeojson, coord);
        if (!result || !result.length) {
            Records.update(id, {
                $set: {
                    'incidentLocation.ecoregionDomain': 'Unknown',
                    'incidentLocation.ecoregionDivision': 'Unknown'
                }
            });
            return;
        }
        var val = result[0].properties;
        var ecoregiondomain = val.DOM_DESC ? val.DOM_DESC : 'Unknown';
        var ecoregionDivision = (val.DIV_NUM && val.DIV_DESC) ? (val.DIV_NUM + '-' + val.DIV_DESC) : 'Unknown';
        Records.update(id, {
            $set: {
                'incidentLocation.ecoregionDomain': ecoregiondomain,
                'incidentLocation.ecoregionDivision': ecoregionDivision
            }
        });
        return result;
    },
    setWeather: function (id, options) {
        var options = options || {};
        var internet = Config.findOne()
            .internet;
        if (!internet) {
            return;
        }
        var record = Records.findOne(id);
        Records.update(id, {
            $set: {
                'weather': {}
            }
        });
        if (options.unset) {
            return true;
        }
        var coords = record.coords.ippCoordinates;
        var date = record.timeLog.lastSeenDateTime;
        if (!coords || !date) {
            return;
        }
        date = new Date(date)
            .toISOString()
            .split('T')[0];
        var latlng = [coords.lat, coords.lng].join(',');;
        var time = 'T12:00:00-0400';
        var dateTime = [date, time].join('');
        var latlngDate = [latlng, dateTime].join(',');
        var units = (record.measureUnits === 'Metric') ? 'units=si' : 'units=us';
        var url = Config.findOne()
            .sarcatServer + '/weather/';
        //var url = 'http://api.forecast.io/forecast/' + forecastAPI + '/';
        url += latlngDate + '?';
        url += units;
        console.log(url)
        var result = HTTP.get(url);
        if (!result.data) {
            return;
        }
        var data = result.data;
        if (!data.daily || !data.daily.data.length) {
            return;
        }
        var dailyData = data.daily.data[0];
        dailyData.precipType = dailyData.precipType || 'none';
        dailyData.cloudCover = dailyData.cloudCover || 0;
        Records.update(id, {
            $set: {
                'weather': dailyData
            }
        });
        return dailyData;
    },
    setBearing: function (id, field) {
        function radians(n) {
            return n * (Math.PI / 180);
        }

        function degrees(n) {
            return n * (180 / Math.PI);
        }

        function bearing(startLat, startLong, endLat, endLong) {
            startLat = radians(startLat);
            startLong = radians(startLong);
            endLat = radians(endLat);
            endLong = radians(endLong);
            var dLong = endLong - startLong;
            var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
            if (Math.abs(dLong) > Math.PI) {
                if (dLong > 0.0)
                    dLong = -(2.0 * Math.PI - dLong);
                else
                    dLong = (2.0 * Math.PI + dLong);
            }
            return parseInt((degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0);
        }
        var record = Records.findOne(id);
        var obj = {};
        obj[field] = '';
        Records.update(id, {
            $unset: obj
        });
        var coord1 = record.coords.ippCoordinates;
        var coord2 = record.coords.findCoord;
        if (!coord1 || !coord2) {
            return false;
        }
        var val = bearing(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
        var obj = {};
        obj[field] = val;
        Records.update(id, {
            $set: obj
        });
        return val;
    },
    setDispersionAngle: function (id) {
        var field = 'findLocation.dispersionAngle';
        var record = Records.findOne(id);
        var obj = {};
        obj[field] = '';
        Records.update(id, {
            $unset: obj
        });
        var initialDirectionofTravel = record.incidentOperations.initialDirectionofTravel;
        var findBearing = record.findLocation.findBearing;
        if (!initialDirectionofTravel || !findBearing) {
            return false;
        }
        var val = parseInt(findBearing) - parseInt(initialDirectionofTravel)
        var obj = {};
        obj[field] = val;
        Records.update(id, {
            $set: obj
        });
        return val;
    },
    uploadISRID: function (toUpload) {
        this.unblock();
        var url = Config.findOne()
            .sarcatServer + '/uploadISRID'
        return HTTP.post(url, toUpload);
    },
    setElevation: function (id) {
        var record = Records.findOne(id);
        Records.update(id, {
            $unset: {
                'findLocation.elevationChange': ''
            }
        });
        var coord1 = record.coords.ippCoordinates;
        var coord2 = record.coords.findCoord;
        if (!coord1 || !coord2) {
            return false;
        }
        var url = Config.findOne()
            .sarcatServer + '/elevation/';
        url += 'latLngCollection=' + coord1.lat + ',' + coord1.lng + ',' + coord2.lat + ',' + coord2.lng;
        var result = HTTP.get(url);
        var data = result.data;
        if (!data) {
            return;
        }
        var results = data.elevationProfile;
        if (!results.length) {
            return;
        }
        var _coord1 = results[0].height;
        var _coord2 = results[1].height;
        if (!_coord1 || !_coord2) {
            return;
        }
        var val = parseInt(_coord2 - _coord1);
        if (record.measureUnits === 'US') {
            val = parseInt(val * 3.2808399);
        }
        Records.update(id, {
            $set: {
                'findLocation.elevationChange': val
            }
        });
        return result;
    },
    setDistance: function (id) {
        var haversine = function (start, end, options) {
            var toRad = function (num) {
                return num * Math.PI / 180;
            }
            var km = 6371
            var mile = 3960
            options = options || {}
            var R = options.unit === 'mile' ?
                mile :
                km
            var dLat = toRad(end.lat - start.lat)
            var dLon = toRad(end.lng - start.lng)
            var lat1 = toRad(start.lat)
            var lat2 = toRad(end.lat)
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            if (options.threshold) {
                return options.threshold > (R * c)
            } else {
                return +((R * c)
                    .toFixed(2));
            }
        }
        var record = Records.findOne(id);
        Records.update(id, {
            $unset: {
                'findLocation.distanceIPP': ''
            }
        });
        var coord1 = record.coords.ippCoordinates;
        var coord2 = record.coords.findCoord;
        if (!coord1 || !coord2) {
            return false;
        }
        var unit = record.measureUnits ? 'mile' : 'km';
        var val = haversine(coord1, coord2, {
            unit: unit
        });
        Records.update(id, {
            $set: {
                'findLocation.distanceIPP': val
            }
        });
        return val;
    },
});
Records.allow({
    remove: function () {
        return true;
    },
    update: function (a, b) {
        return true;
    },
    insert: function () {
        return true;
    }
});
RecordsAudit.allow({
    insert: function () {
        return true;
    },
    remove: function () {
        return true;
    },
});
Config.allow({
    'update': function () {
        return true;
    },
    'insert': function () {
        return true;
    }
});
Meteor.users.allow({
    'remove': function (userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    },
    'update': function (userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    }
});

