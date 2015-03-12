var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);
Template.form.rendered = function() {
    console.log(this.data)
    Session.set('currentRecord', this.data.record);
};
Template.form.helpers({
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
    renderForm: function(name) {
        return 'recordInfo';
        var render = ['recordInfo', 'incident'];
        return render.indexOf(name) !== -1 ? true : false;
    },
    formComplete: function(name) {
        console.log(name)
        var record = Session.get('currentRecord');
        //console.log(record)
        if (!record) {
            return;
        }
        //console.log(record,name)
        var complete = Match.test(record[name], Schemas[name]);
        // console.log(name, complete)
        return complete ? '' : 'afWarning';
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
    editing: function() {
        return Session.get(EDITING_KEY);
    },
    arrRecord: function(val) {
        result = [];
        var use = ['recordInfo','incident','subjectInfo'];
        var record = this.record;
        for (var key in record) {
            if (use.indexOf(key) !== -1) {
                result.push({
                    name: key,
                    value: record[key]
                });
            }
        }
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
    },*/
    autoSaveMode: function() {
        return Session.get('autoSaveMode') ? true : false;
    },
    /*selectedPersonDoc: function() {
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
    Session.set(EDITING_KEY, true);
    // force the template to redraw based on the reactive change
    Tracker.flush();
    template.$('.js-edit-form input[type=text]').focus();
    var name = template.$('[name=name]').val();
    Meteor.call('updateRecords', list._id, name, function(err) {
        console.log(err);
    });
};
var saveList = function(list, template) {
    Session.set(EDITING_KEY, false);
    /*Records.update(list._id, {
        $set: {
            name: template.$('[name=name]').val()
        }
    });*/
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
        // we must remove each item individually from the client
        Records.find({
                listId: list._id
            })
            .forEach(function(todo) {
                Records.remove(todo._id);
            });
        //Records.remove(list._id);
        Meteor.call('removeRecord', list._id);
        Router.go('home');
        return true;
    } else {
        return false;
    }
};
var toggleListPrivacy = function(list) {
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
    /*'keydown input[type=text]': function(event) {
        // ESC
        //console.log(this,event)
        if (27 === event.which) {
            event.preventDefault();
            $(event.target)
                .blur();
        }
    },*/
    'blur input[type=text]': function(event, template) {
        //console.log('!')
        // if we are still editing (we haven't just clicked the cancel button)
        if (Session.get(EDITING_KEY)) saveList(this, template);
    },
    'submit .js-edit-form': function(event, template) {
        //event.preventDefault();
        saveList(this, template);
    },
    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-cancel, click .js-cancel': function(event) {
       // event.preventDefault();
        Session.set(EDITING_KEY, false);
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
    /*'click .js-edit-list': function(event, template) {
        editList(this, template);
    },
    'click .js-toggle-list-privacy': function(event, template) {
        Meteor.call('toggleListPrivacy', 'this', 'template');
        //toggleListPrivacy(this, template);
    },*/
    'click .js-delete-list': function(event, template) {
        var record = Session.get('currentRecord');
        deleteList(record);
    },
    /*'click .js-todo-add': function(event, template) {
        template.$('.js-todo-new input')
            .focus();
    },
    'click .person-row': function() {
        Session.set('selectedPersonId', this._id);
    },*/
    'change ._afInput': function(event, template) {
        //var name = event.target.name.split('.')[0];
        //return checkComplete(name);
        /*
        console.log(name)


                var currentRecord = Session.get('currentRecord');
                var complete = true;//Match.test(currentRecord[name], Schemas[name]);
                var result = complete ? 'panel-success' : 'panel-warning';
                Session.set('afComplete_' + name, result);
                return result;
        */
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
        //this.done(null, "foo"); // submitted successfully, call onSuccess with `result` arg set to "foo"
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
    // show/hide a "Please wait" message, etc. If these hooks are
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
        console.log()
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
