//var EDITING_KEY = 'editingList';
//Session.setDefault(EDITING_KEY, false);
//Session.set('toggleTest', true);
//Session.set('weather', false);
// Track if this is the first time the list template is rendered
var firstRender = true;
//var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

var weather = false;

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
console.log(this.data.record);
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
        //console.log(this)
        //var complete = Match.test(record[name], Schemas[name]);
        var record = this.value; //Session.get('currentRecord');
        if (!record) {
            return;
        }

        var formLen = _.filter(record, function(d) {
            var val = d;
            if (val === 'Unknown' || val === '' || !val) {
                val = false;
            }
            return val;
        }).length;
        var schemaLen = Schemas[name]._schemaKeys.length;
        var complete = (formLen === schemaLen);
        //console.log(formLen===schemaLen)
        //console.log(name,formLen,schemaLen,complete);
        return complete ? '' : 'warning-bg';
    },
    formId: function(name) {
        return 'af_' + this.name;
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

    }
});
var hooksObject = {
    before: {
        // Replace `formType` with the form `type` attribute to which this hook applies
        formType: function(doc) {
            // Potentially alter the doc
            doc.foo = 'bar';
            // Then return it or pass it to this.result()
            //return doc; (synchronous)
            //return false; (synchronous, cancel)
            //this.result(doc); (asynchronous)
            //this.result(false); (asynchronous, cancel)
        }
    },
    // The same as the callbacks you would normally provide when calling
    // collection.insert, collection.update, or Meteor.call
    after: {
        // Replace `formType` with the form `type` attribute to which this hook applies
        formType: function(error, result) {}
    },
    // Called when form does not have a `type` attribute
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
        // You must call this.done()!
        //this.done(); // submitted successfully, call onSuccess
        //this.done(new Error('foo')); // failed to submit, call onError with the provided error
        //this.done(null, 'foo'); // submitted successfully, call onSuccess with `result` arg set to 'foo'
    },
    // Called when any submit operation succeeds
    onSuccess: function(formType, result) {},
    // Called when any submit operation fails
    onError: function(formType, error) {},
    // Called every time the form is revalidated, which can be often if keyup
    // validation is used.
    formToDoc: function(doc, ss, formId) {},
    // Called whenever `doc` attribute reactively changes, before values
    // are set in the form fields.
    docToForm: function(doc, ss) {},
    // Called at the beginning and end of submission, respectively.
    // This is the place to disable/enable buttons or the form,
    // show/hide a 'Please wait' message, etc. If these hooks are
    // not defined, then by default the submit button is disabled
    // during submission.
    beginSubmit: function() {},
    endSubmit: function() {}
};
/*AutoForm.hooks({
    xrecordAdminForm: hooksObject
});*/
hooks2 = {
    onSubmit: function(doc) {
        console.log('!!!!!!')
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
        console.log(error);
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
AutoForm.addHooks('af_recordInfo', hooks2);
