Meteor.methods({
    removeUser: function(userId) {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            var remove = Meteor.users.remove(userId);
            return remove;
        }
    },
    editUser: function(set, userId) {
        console.log(set, userId)
        Meteor.users.update(userId, set, function(error, result) {
            if (error) {
                return error;
            }
            return result;
        });
    },
    setPassword: function(userId, password, passwordReset) {
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
    createAdmin: function(username, email, password, id) {
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
        }, function(error, result) {
            return (error, result);
        });
        Config.update(Config.findOne()
            ._id, {
                $set: {
                    initSetup: false
                }
            });
    },
    addRole: function(id, role) {
        Roles.addUsersToRoles(id, [role]);
    },
    updateConfig: function(val) {
        console.log(val)
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
    addRecord: function(list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.insert(list);
    },
    removeRecord: function(records) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var id = records.map(function(d) {
            return d._id;
        })
        Records.remove({
            _id: {
                $in: id
            }
        });
        records.forEach(function(d) {
            RecordsAudit.insert({
                'type': 'remove',
                'recordId': id,
                'userId': Meteor.userId(),
                'userName': Meteor.user().username,
                'field': d.recordInfo.name,
                'value': d,
                'date': moment().format('MM/DD/YYYY HH:mm')
            });
        });
        return true;
    },
    pushArray: function(id, name) {
        var obj = {};
        obj[name] = {};
        var update = Records.update(id, {
            $push: obj
        });
        //console.log(update);
        return update;
    },
    updateRecord: function(id, name, val) {
        //console.log(id, name, val)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var obj = {};
        obj[name] = val;
        var update = Records.update(id, {
            $set: obj
        });
        /*RecordsAudit.insert({
            docId: id,
            userId: Meteor.userId(),
            update: name,
            value: val
        });*/
        var autoSaveChangedElement = this.autoSaveChangedElement || {};
        RecordsAudit.insert({
            'type': 'update',
            'recordId': id,
            'userId': Meteor.userId(),
            'userName': Meteor.user().username,
            'field': name,
            'value': val,
            'date': moment().format('MM/DD/YYYY HH:mm')
        })
        return update;
    },
    defaultAdmin: function() {
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
    deleteUser: function(targetUserId, group) {
        var loggedInUser = Meteor.user();
        if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['manage-users', 'support-staff'], group)) {
            throw new Meteor.Error(403, 'Access denied');
        }
        Roles.setUserRoles(targetUserId, [], group);
    },
    changeRole: function(user, val) {
        //RecordsAudit.remove({})
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.users.update(user, {
                $set: {
                    roles: [val]
                }
            });
        }
    },
    removeSubject: function(recordId, subjectId) {
        var newSubjects = Records.findOne(recordId)
            .subjects.subject.filter(function(d) {
                return d._key !== subjectId;
            });
        Records.update(recordId, {
            $set: {
                'subjects.subject': newSubjects
            }
        })
    },
    removeResource: function(recordId, resourceId) {
        console.log(recordId, resourceId);
        var newResource = Records.findOne(recordId)
            .resourcesUsed.resource.filter(function(d) {
                return d._key !== resourceId;
            });
        Records.update(recordId, {
            $set: {
                'resourcesUsed.resource': newResource
            }
        })
    },
    getFilesInPublicFolder: function(id) {
        var fs = Npm.require('fs');
        var dir = '../web.browser/app/uploads/records/' + id;
        if (!fs.existsSync(dir)) {
            return [];
        }
        var files = fs.readdirSync('../web.browser/app/uploads/records/' + id);
        return files;
    },
    removeLogo: function() {
        var fs = Npm.require('fs');
        var dirPath = process.env.PWD + '/public/uploads/logo';
        try {
            var files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath)
                    .isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
    },
    setEcoRegion: function(id) {
        var record = Records.findOne(id);
        var coord = record.coords.ippCoordinates;
        coord = [coord.lng, coord.lat];
        var result = pip(coord);
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
    setWeather: function(id, options) {
        var options = options || {};
        /*var forecastAPI = Config.findOne()
            .forecastAPI;
        if (!forecastAPI) {
            return;
        }*/
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
        var url = Meteor.settings.private.sarcatServer + '/weather/';
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
    setBearing: function(id, field) {
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
    setDispersionAngle: function(id) {
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
    uploadISRID: function(toUpload) {
        this.unblock();
        var url = Meteor.settings.private.sarcatServer + '/uploadISRID'
        console.log(url, toUpload);

        return HTTP.post(url, toUpload);
    },
    setElevation: function(id) {
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
        var url = Meteor.settings.private.sarcatServer + '/elevation/';
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
    setDistance: function(id) {
        var haversine = function(start, end, options) {
            var toRad = function(num) {
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
    /*setLocale: function(id) {
        var googleAPI = Config.findOne()
            .googleAPI;
        if (!googleAPI) {
            return;
        }
        var record = Records.findOne(id);
        Records.update(id, {
            $unset: {
                'incident.country': '',
                'incident.administrative1': '',
                'incident.administrative2': ''
            }
        });
        var coord1 = record.coords.ippCoordinates;
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coord1.lat + ',' + coord1.lng + '&sensor=false&key=' + googleAPI;
        console.log(url)
        var result = HTTP.get(url);
        console.log(JSON.parse(result.content));
        result = JSON.parse(result.content)
            .results;
        var result0 = result[0] ? result[0].address_components : [];
        var countryAr = _.find(result0, function(d) {
            return _.contains(d.types, 'country')
        })
        var country = countryAr ? countryAr.long_name : null;
        var admin1Ar = _.find(result0, function(d) {
            return _.contains(d.types, 'administrative_area_level_1')
        });
        var admin1 = admin1Ar ? admin1Ar.long_name : null;
        var admin2Ar = _.find(result0, function(d) {
            return _.contains(d.types, 'administrative_area_level_2')
        });
        var admin2 = admin2Ar ? admin2Ar.long_name : null;
        Records.update(id, {
            $set: {
                'incident.country': country,
                'incident.administrative1': admin1,
                'incident.administrative2': admin2
            }
        });
        return {
            country: country,
            admin1: admin1,
            county: admin2
        };
    },*/
});
Records.allow({
    remove: function() {
        return true;
    },
    update: function(a, b) {
        console.log(a, b, this)
        return true;
    },
    insert: function() {
        return true;
    }
});
RecordsAudit.allow({
    insert: function() {
        return true;
    },
    remove: function() {
        return true;
    },
});
Config.allow({
    'update': function() {
        return true;
    },
    'insert': function() {
        return true;
    }
});
Meteor.users.allow({
    'remove': function(userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    },
    'update': function(userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    }
});
