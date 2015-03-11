var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);
currentRecord = null;

//listFadeInHold = null;
//var currentRecord = null;
Template.form.rendered = function() {
    //a=this
    var record = this.data.record;
    Session.set('currentRecord', record);
    //currentRecord = record;

};
var checkComplete = function(name) {
    console.log(this, name);
    var currentRecord = Session.get('currentRecord');
    //console.log(name,currentRecord[name],Schemas[name]);
    var complete = Match.test(currentRecord[name], Schemas[name]);
    console.log(complete)
    var result = complete ? 'panel-success' : 'panel-warning';
    Session.set('afComplete_' + name, result);
    return complete;
};
Template.form.helpers({
    currentRecord: function() {
        return Session.get('currentRecord');
    },
    renderForm: function(name) {
        var render = ['recordInfo', 'incident'];
        return render.indexOf(name) !== -1 ? true : false;
    },
    formComplete: function() {
        return Session.get('afComplete');
    },
    autoSaveMode: function() {
        return true; //Session.get('autoSaveMode') ? true : false;
    },
    isSchema: function(obj, obj2) {
        console.log(obj, obj2)
        return obj === obj2;
    },
    schemaCompleteClass: function(name) {
        checkComplete()
            //return 'g'
            //var currentRecord = Session.get('currentRecord');
            //console.log(this, name, currentRecord);
        var complete = Match.test(currentRecord[name], Schemas[name]);
        //Session.set('afComplete_' + a, complete);
        //console.log(complete)
        return complete ? 'panel-success' : 'panel-warning';
        //checkComplete(name);
    },
    schemaComplete: function(a) {
        return Match.test(this[a], Schemas[a]);
    },
    editing: function() {
        return Session.get(EDITING_KEY);
    },
    records: function() {
        //console.log(this);
        result = [];
        for (var key in this) result.push({
            name: key,
            value: this[key]
        });
        //console.log(result);
        return result;
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
/*
Template.tax_line_fields.events({
 'change': function(){
    Session.set('form_changed', this.Date());
    obj = form2js t.find("form")
    _.extend(@, obj)
  }
});
Template.tax_line_fields.form_changed = function(){
  return Session.get('form_changed');
};

*/
Template.form.events({
    'keydown input[type=text]': function(event) {
        // ESC
        //console.log(this,event)
        if (27 === event.which) {
            event.preventDefault();
            $(event.target)
                .blur();
        }
    },
    'blur input[type=text]': function(event, template) {
        //console.log('!')
        // if we are still editing (we haven't just clicked the cancel button)
        if (Session.get(EDITING_KEY)) saveList(this, template);
    },
    'submit .js-edit-form': function(event, template) {
        event.preventDefault();
        saveList(this, template);
    },
    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-cancel, click .js-cancel': function(event) {
        event.preventDefault();
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
        deleteList(this, template);
    },
    /*'click .js-todo-add': function(event, template) {
        template.$('.js-todo-new input')
            .focus();
    },
    'click .person-row': function() {
        Session.set('selectedPersonId', this._id);
    },*/
    'change .afInput': function(event, template) {
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
AutoForm.hooks({
    recordAdminForm: {
        /*formToDoc: function(doc, ss, formId) {
            console.log(doc)
        },*/
        /*before: {
            update: function(modifier) {
                //console.log(this.name,modifier)
                //return modifier;// (synchronous)
                //return false; (synchronous, cancel)
                return this.result(modifier);// (asynchronous)
                //this.result(false); (asynchronous, cancel)
            }
        },*/
        onSubmit: function(doc) {
            console.log('submit');
            //console.log(doc);
            Schemas.SARCAT.clean(doc);
            this.done();
            return false;
        },
        onSuccess: function(operation, result, template) {
            //console.log(operation, result, template);
            //Session.set('formChanged', new Date());
            //Session.get('form_changed');
            //checkCompelte
            //console.log(operation, result, template);
            //Router.go('users.show',{'username':template.data.doc.username});
        },
        onError: function(operation, error, template) {
            //var name = template.data.fields;
            //return checkComplete(name);
        },
        /*docToForm: function(doc, ss) {
            console.log(doc);
            this.done();
        },*/
    }
});
