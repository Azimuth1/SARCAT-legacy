var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);
// Track if this is the first time the list template is rendered
//var firstRender = true;
//var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;
Template.form.rendered = function() {

/*
        var map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-i875mjb7'
        }).addTo(map);

*/



    /*if (firstRender) {
        // Released in app-body.js
        listFadeInHold = LaunchScreen.hold();
        // Handle for launch screen defined in app-body.js
        listRenderHold.release();
        firstRender = false;
    }
    this.find('.js-title-nav')
        ._uihooks = {
            insertElement: function(node, next) {
                $(node)
                    .hide()
                    .insertBefore(next)
                    .fadeIn();
            },
            removeElement: function(node) {
                $(node)
                    .fadeOut(function() {
                        this.remove();
                    });
            }
        };*/
};
Template.form.helpers({
    editing: function() {
        return Session.get(EDITING_KEY);
    },
    todosReady: function() {
        return Router.current()
            .todosHandle.ready();
    },
    records: function() {
        console.log(this)
        return this;
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
    console.log(list);
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
    'keydown input[type=text]': function(event) {
        // ESC
        if (27 === event.which) {
            event.preventDefault();
            $(event.target)
                .blur();
        }
    },
    'blur input[type=text]': function(event, template) {
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
    },
    'change .autosave-toggle': function() {
        Session.set('autoSaveMode', !Session.get('autoSaveMode'));
    },*/
});



AutoForm.hooks({
    recordAdminForm: {
        onSubmit: function(doc) {
            alert('!!!');
            console.log(doc);
            Schemas.SARCAT.clean(doc);
            this.done();
            return false;
        },
        onSuccess: function(operation, result, template) {
            console.log(operation, result, template);
            console.log('updated');
            //Router.go('users.show',{'username':template.data.doc.username});
        },
        onError: function(operation, error, template) {
            console.log(operation, error);
        },
    }
});
