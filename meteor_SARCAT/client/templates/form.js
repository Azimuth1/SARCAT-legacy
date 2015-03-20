//var EDITING_KEY = 'editingList';
//Session.setDefault(EDITING_KEY, false);

//Session.set('weather', false);
// Track if this is the first time the list template is rendered
var firstRender = true;
//var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;
var weather = false;
Template.registerHelper("Schemas", Schemas);
/*
if(!weather){
$.ajax({
    url: 'https://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/70,20',
    jsonp: 'callback',
    dataType: 'jsonp',
    success: function(data) {
        console.log('!!!!');
        Session.set('weather', data);
        weather=true;
    }
});
}
*/
Template.form.rendered = function() {
    //console.log(this.data.record);
    $('.collapse').collapse({
        toggle: false
    });
    Session.set('currentRecord', this.data.record);
    /*
        var data = {
            "time": 1426269221,
            "summary": "Windy and Mostly Cloudy",
            "icon": "wind",
            "precipIntensity": 0,
            "precipProbability": 0,
            "temperature": 44.09,
            "apparentTemperature": 33.76,
            "dewPoint": 1.66,
            "humidity": 0.17,
            "windSpeed": 31.77,
            "windBearing": 218,
            "cloudCover": 0.6,
            "pressure": 1021.8,
            "ozone": 345.58
        };
        data = _.map(data, function(d, e) {
            return {
                key: e,
                val: d
            };
        });

        console.log(data);

        var tbl_body = '';
        var odd_even = false;
        $.each(data, function() {
            var tbl_row = '';
            $.each(this, function(k, v) {
                tbl_row += '<td>' + v + '</td>';
            })
            tbl_body += '<tr class=\'' + (odd_even ? 'odd' : 'even') + '\'>' + tbl_row + '</tr>';
            odd_even = !odd_even;
        });

        $('#target_table_id').html(tbl_body);*/
};
Template.form.helpers({
    formType: function() {
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return highRole ? 'update' : 'disabled';
    },
    todosReady: function() {
        //var ready = Router.current().todosHandle.ready();
        //console.log('todosReady',Router.current().todosHandle.ready());
        return true; //Router.current().todosHandle.ready();
    },
    getObj: function(obj, name) {
        return obj[name];
    },
    getData: function(obj, name) {
        return this.data.record;
    },
    Schemas: function() {
        return Schemas;
    },
    Records: function() {
        return Records;
    },
    currentRecord: function() {
        return Session.get('currentRecord');
    },
    formComplete: function(name) {
        //console.log(this);
        var name=this.field;
        //var complete = Match.test(record[name], Schemas[name]);
        var record = this.doc; //Session.get('currentRecord');
        if (!record) {
            return;
        }
        var formLen = _.filter(record, function(d) {
            var val = d;
            if (val === '' || !val) {
                val = false;
            }
            return val;
        }).length;
        var schemaLen = Schemas[name]._schemaKeys.length;
        var complete = (formLen === schemaLen);
        return formLen+'/'+schemaLen;
        //console.log(formLen,schemaLen)
        //console.log(name,formLen,schemaLen,complete);
        //return complete ? '' : 'warning-bg';
    },
    formId: function(name) {
        return 'af_' + this.field;
    },
    autoSaveMode: function() {
        return true; //Session.get('autoSaveMode') ? true : false;
    },
    isSchema: function(obj, obj2) {
        //console.log(obj, obj2)
        return obj === obj2;
    },
    /*editing: function() {
        return Session.get(EDITING_KEY);
    },*/
    arrRecord: function(val) {
        if (!this.record) {
            return;
        }
        result = [];
        var use = ['recordInfo', 'incident', 'subjectInfo', 'timeLog', 'incidentOperations', 'incidentOutcome', 'medical', 'resources'];
        var record = this.record;
        _.each(use, function(d) {
            if (record[d]) {
                result.push({
                    name: d,
                    value: record[d]
                });
            }
        });
        return val ? record[val] : result;
    },
    arrRecords: function() {
        if (!this.record) {
            return;
        }
        var record = this.record;
        return _.chain(record).map(function(d, key) {
            if (_.isObject(d)) {
                return _.map(d, function(d2, key2) {
                    return {
                        name: key+'.'+key2,
                        //name: 'Schemas.'+key2,
                        val: d2
                    };
                });
            }
            
        }).flatten().compact().value();
    },
    schemas: function(){
        console.log(this)
        var record = this.record;
        var schemas= ['incidentOperations','recordInfo', 'incident', 'subjectInfo', 'timeLog', 'incidentOutcome', 'medical', 'resources'];
    return schemas.map(function(d){return {field:d,doc:record[d]};});
    },
    test:function(){
        return 'recordInfo';
    }
    /*todos: function(listId) {
        return Todos.find({
            listId: listId
        }, {
            sort: {
                createdAt: -1
            }
        });
    },

    selectedPersonDoc: function() {
        return People.findOne(Session.get('selectedPersonId'));
    },
    isSelectedPerson: function() {
        return Session.equals('selectedPersonId', this._id);
    },
    formType: function() {
        if (Session.get('selectedPersonId')) {
            return 'update';
        } else {
            return 'disabled';
        }
    },
    disableButtons: function() {
        return !Session.get('selectedPersonId');
    }*/
});
var editList = function(list, template) {
    //console.log(list);
    //Session.set(EDITING_KEY, true);
    // force the template to redraw based on the reactive change
    Tracker.flush();
    template.$('.js-edit-form input[type=text]').focus();
    var name = template.$('[name=name]').val();
    Meteor.call('updateRecords', list._id, name, function(err) {
        console.log(err);
    });
};
var saveList = function(list, template) {
    //Session.set(EDITING_KEY, false);
    var name = template.$('[name=name]').val();
    Meteor.call('updateRecords', list._id, name, function(err) {
        console.log(err);
    });
};
var deleteList = function(list) {
    if (list.userId !== Meteor.userId()) {
        return alert('Sorry, You can only delete lists you created!');
    }
    var message = 'Are you sure you want to delete the list ' + list.name + '?';
    if (confirm(message)) {
        Meteor.call('removeRecord', list._id, function() {
            Router.go('form', Records.findOne());
        });
        return true;
    } else {
        return false;
    }
};
var toggleListPrivacy = function(list) {
    return toggleListPrivacy = !toggleListPrivacy;
    if (list.userId) {
        Records.update(list._id, {
            $unset: {
                userId: true
            }
        });
    } else {
        Records.update(list._id, {
            $set: {
                userId: Meteor.userId()
            }
        });
    }
};
Template.form.events({
    'blur input[type=text]': function(event, template) {
        // if (Session.get(EDITING_KEY)) saveList(this, template);
    },
    /*'submit .js-edit-form': function(event, template) {
        //event.preventDefault();
        saveList(this, template);
    },*/
    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-cancel, click .js-cancel': function(event) {
        // event.preventDefault();
        // Session.set(EDITING_KEY, false);
    },
    'change .list-edit': function(event, template) {
        if ($(event.target)
            .val() === 'edit') {
            editList(this, template);
        } else if ($(event.target)
            .val() === 'delete') {
            deleteList(this, template);
        } else {
            Meteor.call('toggleListPrivacy', 'this', 'template');
            //toggleListPrivacy(this, template);
        }
        event.target.selectedIndex = 0;
    },
    'click .js-toggle-list-privacy': function(event, template) {
        var toggleTest = Session.get('toggleTest');
        var result = !toggleTest;
        Session.set('toggleTest', result);
        return result ? 'a' : 'b';
        //console.log(Session.get('toggleTest'));
        //Meteor.call('toggleListPrivacy', 'this', 'template');
        //toggleListPrivacy(this, template);
    },
    'click .js-delete-list': function(event, template) {
        var record = Session.get('currentRecord');
        deleteList(record);
    },
    'click .formNav': function(event, template) {
        $('.collapse').collapse('hide');
        $('#collapse_' + this.name).collapse('toggle');
    },
    'change ._afInput': function(event, template) {
    },


    'change [name="resources.resourcesUsed"]': function(event, template) {
        console.log('!')
    },
//$('[name="resources.resourcesUsed"]')





});

hooks2 = {
    onSubmit: function(doc) {
        console.log(doc);
        Schemas.SARCAT.clean(doc);
        console.log(doc);
        this.done();
        return false;
    },
    // Schemas.SARCAT.clean(doc);
    onSuccess: function(formType, result) {
        console.log(formType, result);
    },
    onError: function(formType, error) {
        console.log(formType,error);
    },
    beginSubmit: function(a) {
        // console.log()
        console.log('beginSubmit');
    },
    endSubmit: function() {
        console.log('endSubmit');
    }
};
/*
AutoForm.hooks({
    recordAdminForm: {
        // Schemas.SARCAT.clean(doc);
        onSuccess: function(operation, result, template) {
            console.log(operation, result);
        },
        onError: function(operation, error, template) {
            console.log(error);
        },
        beginSubmit: function() {
            console.log('beginSubmit');
        },
        endSubmit: function() {
            console.log('endSubmit');
        }
    }
});*/
AutoForm.addHooks('kaf_recordInfo', hooks2);
