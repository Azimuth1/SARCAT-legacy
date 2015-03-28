var mapDrawn;
var drawn;
Template.records.rendered = function () {

    console.log(this.data);
    var data = Records.find()
        .fetch();
    console.log(data);
    if (drawn) {
        return;
    }
    var keyCount = Schemas.SARCAT._schemaKeys.map(function (d) {
        //return d
        var result = d.split('.');
        return result[result.length - 1]
    });
    keyCount = _.object(_.map(keyCount, function (x) {
        // console.log(x);
        return [x, []]
    }));
    _.each(data, function (d) {
        _.each(d, function (e, f) {
            if (_.isString(e)) {
                if (keyCount[f]) {
                    keyCount[f].push(e);
                }
            }
            if (_.isObject(e)) {
                _.each(e, function (g, h) {
                    if (keyCount[h]) {
                        keyCount[h].push(g);
                    }
                });
            }
        });
    });
    count = _.chain(keyCount)
        .map(function (d, e) {
            var count = _.countBy(d);
            var keys = _.keys(count);
            if (_.keys(count)
                .length && keys[0]) {
                var string = _.map(count, function (val, key) {
                        return key + ': ' + val;
                    })
                    .join(' || ');
                return {
                    field: e,
                    count: string
                };
            }
        })
        .compact()
        .value();
    var data = count;
    console.log(data)
    var tbl_body = '';
    data.forEach(function (d) {
        var odd_even = false;
        $.each(data, function () {
            var tbl_row = '';
            $.each(this, function (k, v) {
                tbl_row += '<td>' + v + '</td>';
            })
            tbl_body += '<tr class=\'' + (odd_even ? 'odd' : 'even') + '\'>' + tbl_row + '</tr>';
            odd_even = !odd_even;
        });
    })
    $('#target_table_id')
        .html(tbl_body);
    drawn = true;
};
Template.records.helpers({
    lists: function () {
        return Records.find();
    },
    isNotViewer: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin', 'editor']);
    },
    newRecord: function () {
        return Records.findOne(Session.get('newRecord'));
    },

});
Template.records.events({
    'click #createRecordModal button': function () {
        // $('#createRecordModal').modal('hide')
    },
    'click .js-deleteRecord': function () {
        var record = Records.findOne(Session.get('newRecord'));
        Meteor.call('removeRecord', record, function (error, d) {
            console.log(error, d)
        })
    },
    'click .js-newRecord': function () {
        var list = {
            userId: Meteor.userId()
        };
        list._id = Meteor.call('addRecord', list, function (error, d) {
            if (error) {
                console.log(error);
            }
            Session.set('newRecord', d)
        });
        /*if (!map) {
            setTimeout(function () {
                var config = Session.get('config');
                var coords = config.agencyProfile.coordinates;

                var mapPoints = [{
                    "name": "incidentOperations.ippCoordinates",
                    "text": "IPP Location"
                }];

                formSetMap('formMap', agencyProfile.coordinates, mapPoints);
                map = newFormSetMap('recordMap', config.agencyProfile.coordinates, mapPoints);
            }, 500);


*/

        if (mapDrawn) {
            return;
        }
                var config = Session.get('config');
           

        var mapPoints = [{
            "name": "incidentOperations.ippCoordinates",
            "text": "IPP Location"
        }];

        setTimeout(function (d) {
            formSetMap('recordMap', config.agencyProfile.coordinates, mapPoints);
        }, 500);
        mapDrawn = true;
        return;

        // }

    }
});
