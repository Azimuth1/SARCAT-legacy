Meteor.methods({
    removeUser: function (userId) {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.users.remove(userId);
        }
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
            if (error) {
                console.log(error, result);
            }
        });
        Config.update(Config.findOne()
            ._id, {
                $set: {
                    initSetup: false
                }
            });
        // Meteor.users.remove(Meteor.userId());
    },
    addRole: function (id, role) {
        Roles.addUsersToRoles(id, [role]);
    },
    updateConfig: function (val) {
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
    addRecord: function (list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.insert(list);
    },
    removeRecord: function (id) {
        console.log(id)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        /*return Records.update(id, {
            $set: {
                remove: "true"
            }
        },function(d,e){console.log(d,e)});*/
        return Records.remove(id);
    },
    pushArray: function (id, name) {
        var obj = {};
        obj[name] = {};
        var update = Records.update(id, {
            $push: obj
        });
        console.log(update);
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
        console.log(update);
        return [id, name, val];
    },
    toggleListPrivacy: function (list) {
        //console.log(list, list.userId);
        a = Meteor.userId();
        //console.log(a);
        if (!Meteor.user()) {
            return alert('Please sign in or create an account to make private lists.');
        }
        if (list.userId) {
            Records.update(list._id, {
                $unset: {
                    userId: true
                }
            });
        } else {
            // console.log(2);
            // ensure the last public list cannot be made private
            if (Records.find({
                    userId: {
                        $exists: false
                    }
                })
                .count() === 1) {
                return alert('Sorry, you cannot make the final public list private!');
            }
            Records.update(list._id, {
                $set: {
                    userId: Meteor.userId()
                }
            });
        }
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
        // remove permissions for target group
        Roles.setUserRoles(targetUserId, [], group);
        // do other actions required when a user is removed...
    },
    changeRole: function (user, val) {
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
        console.log(recordId, resourceId);
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
        var dir = '../web.browser/app/uploads/records/' + id;
        //var stats = fs.lstatSync(dir);
        if (!fs.existsSync(dir)) {
            return [];
        }
        var files = fs.readdirSync('../web.browser/app/uploads/records/' + id);
        return files;
    },
    setEcoRegion: function (id) {
        var record = Records.findOne(id);
        var coord = record.coords.ippCoordinates;
        coord = [coord.lng, coord.lat];
        var result = pip(coord);
        var val = result[0] ? result[0].properties : {};
        var ecoregiondomain = val.DOM_DESC ? val.DOM_DESC : null;
        var ecoregionDivision = (val.DIV_NUM && val.DIV_DESC) ? (val.DIV_NUM + '-' + val.DIV_DESC) : null;
        Records.update(id, {
            $set: {
                'incident.ecoregiondomain': ecoregiondomain,
                'incident.ecoregionDivision': ecoregionDivision
            }
        });
        return val;
    },
    setWeather: function (id) {
        var record = Records.findOne(id);
        Records.update(id, {
            $set: {
                'weather': {}
            }
        });
        var coords = record.coords.ippCoordinates;
        var date = record.recordInfo.incidentdate;
        date = date.toISOString()
            .split('T')[0];
        if (!date || !coords) {
            return;
        }
        var latlng = [coords.lat, coords.lng].join(',');;
        var time = 'T12:00:00-0400';
        var dateTime = [date, time].join('');
        var latlngDate = [latlng, dateTime].join(',');
        var units = (record.measureUnits === 'Metric') ? 'units=si' : 'units=us';
        var url = 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/';
        url += latlngDate + '?';
        url += units;
        var result = HTTP.get(url);
        var data = JSON.parse(result.content);
        var dailyData = data.daily.data[0];
        _.each(dailyData, function (d, name) {
            var obj = {};
            obj['weather.' + name] = d;
            Records.update(id, {
                $set: obj
            });
        });

        if(!dailyData.precipType){
            Records.update(id, {
                $set: {'weather.precipType':'none'}
            });
        }
        return dailyData;
    },
    setFindBearing: function (id) {

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
        Records.update(id, {
            $unset: {
                'incidentOutcome.findBearing': ''
            }
        });
        var coord1 = record.coords.ippCoordinates;
        var coord2 = record.coords.findCoord;
        if (!coord1 || !coord2) {
            return false;
        }

        var val = bearing(coord1.lat, coord1.lng, coord2.lat, coord2.lng);

        Records.update(id, {
            $set: {
                'incidentOutcome.findBearing': val
            }
        });
        return val;

    },
    setElevation: function (id) {
        var record = Records.findOne(id);
        Records.update(id, {
            $unset: {
                'incidentOutcome.elevationChange': ''
            }
        });
        var coord1 = record.coords.ippCoordinates;
        var coord2 = record.coords.findCoord;
        if (!coord1 || !coord2) {
            return false;
        }
        var url = 'https://maps.googleapis.com/maps/api/elevation/json?locations=' + coord1.lat + ',' + coord1.lng + '|' + coord2.lat + ',' + coord2.lng + '&sensor=false&key=' + Config.findOne()
            .googleAPI;
        var result = HTTP.get(url);
        result = JSON.parse(result.content)
            .results;
        var _coord1 = result[0].elevation;
        var _coord2 = result[1].elevation;
        if (!_coord1 || !_coord2) {
            return;
        }
        var val = parseInt(_coord2 - _coord1);
        if (record.measureUnits === 'US') {
            val = parseInt(val * 3.2808399);
        }
        Records.update(id, {
            $set: {
                'incidentOutcome.elevationChange': val
            }
        });
        return val;
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
                return +((R * c).toFixed(2));
            }
        }
        var record = Records.findOne(id);
        Records.update(id, {
            $unset: {
                'incidentOutcome.distanceIPP': ''
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
                'incidentOutcome.distanceIPP': val
            }
        });
        //  return JSON.stringify([coord1, coord2, unit, val])
        return val;
    },
    setLocale: function (id) {
        var record = Records.findOne(id);
        Records.update(id, {
            $unset: {
                'incident.country': '',
                'incident.stateregion': ''
            }
        });
        var coord1 = record.coords.ippCoordinates;
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coord1.lat + ',' + coord1.lng + '&sensor=false&key=' + Config.findOne()
            .googleAPI;
        console.log(url)
        var result = HTTP.get(url);
        console.log(JSON.parse(result.content));
        result = JSON.parse(result.content)
            .results;
        var result0 = result[0] ? result[0].address_components : [];
        var countryAr = _.find(result0, function (d) {
            return _.contains(d.types, 'country')
        })
        var country = countryAr ? countryAr.long_name : null;
        var admin1Ar = _.find(result0, function (d) {
            return _.contains(d.types, 'administrative_area_level_1')
        });
        var admin1 = admin1Ar ? admin1Ar.long_name : null;
        Records.update(id, {
            $set: {
                'incident.country': country,
                'incident.stateregion': admin1
            }
        });
        return {
            country: country,
            admin1: admin1
        };
    },
});
Records.allow({
    remove: function () {
        return true;
    },
    update: function () {
        return true;
    },
    insert: function () {
        return true;
    }
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
