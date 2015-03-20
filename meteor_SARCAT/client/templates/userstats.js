var drawn;
Template.userStats.rendered = function() {
    var data = Records.find()
        .fetch();
    console.log(data);
    if (drawn) {
        return;
    }
    var keyCount = Schemas.SARCAT._schemaKeys.map(function(d) {
        //return d
        var result = d.split('.');
        return result[result.length - 1]
    });
    keyCount = _.object(_.map(keyCount, function(x) {
        // console.log(x);
        return [x, []]
    }));
    _.each(data, function(d) {
        _.each(d, function(e, f) {
            if (_.isString(e)) {
                if (keyCount[f]) {
                    keyCount[f].push(e);
                }
            }
            if (_.isObject(e)) {
                _.each(e, function(g, h) {
                    if (keyCount[h]) {
                        keyCount[h].push(g);
                    }
                });
            }
        });
    });
    count = _.chain(keyCount)
        .map(function(d, e) {
            var count = _.countBy(d);
            var keys = _.keys(count);
            if (_.keys(count)
                .length && keys[0]) {
                var string = _.map(count, function(val, key) {
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
    data.forEach(function(d) {
        var odd_even = false;
        $.each(data, function() {
            var tbl_row = '';
            $.each(this, function(k, v) {
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
Template.userStats.helpers({
    records: function() {
        return Records.find();
    }
});
Template.userStats.events({});
