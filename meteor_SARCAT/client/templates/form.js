var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);
// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;
Template.form.rendered = function() {
    if (firstRender) {
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
        };
};
Template.form.helpers({
    editing: function() {
        return Session.get(EDITING_KEY);
    },
    todosReady: function() {
        var a = Router.current()
            .todosHandle.ready();
        console.log('a');
        return Router.current()
            .todosHandle.ready();
    },
    todos: function(listId) {
        return Todos.find({
            listId: listId
        }, {
            sort: {
                createdAt: -1
            }
        });
    },
    autoSaveMode: function() {
        return Session.get('autoSaveMode') ? true : false;
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
    }
});
var editList = function(list, template) {
    Session.set(EDITING_KEY, true);
    // force the template to redraw based on the reactive change
    Tracker.flush();
    template.$('.js-edit-form input[type=text]')
        .focus();
};
var saveList = function(list, template) {
    Session.set(EDITING_KEY, false);

    Records.update(list._id, {
        $set: {
            name: template.$('[name=name]')
                .val()
        }
    });
}
var deleteList = function(list) {
    // ensure the last public list cannot be deleted.
    if (!list.userId && Records.find({
            userId: {
                $exists: false
            }
        })
        .count() === 1) {
        return alert('Sorry, you cannot delete the final public list!');
    }
    var message = 'Are you sure you want to delete the list ' + list.name + '?';
    if (confirm(message)) {
        // we must remove each item individually from the client
        Todos.find({
                listId: list._id
            })
            .forEach(function(todo) {
                Todos.remove(todo._id);
            });
        Records.remove(list._id);
        Router.go('home');
        return true;
    } else {
        return false;
    }
};
var toggleListPrivacy = function(list) {

    console.log(list,list.userId);
    a=Meteor.userId();
    console.log(a)
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
        if (Session.get(EDITING_KEY))
            saveList(this, template);
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
            toggleListPrivacy(this, template);
        }
        event.target.selectedIndex = 0;
    },
    'click .js-edit-list': function(event, template) {
        editList(this, template);
    },
    'click .js-toggle-list-privacy': function(event, template) {
        toggleListPrivacy(this, template);
    },
    'click .js-delete-list': function(event, template) {
        deleteList(this, template);
    },
    'click .js-todo-add': function(event, template) {
        template.$('.js-todo-new input')
            .focus();
    },
    'submit .js-todo-new': function(event) {
        event.preventDefault();
        var $input = $(event.target)
            .find('[type=text]');
        if (!$input.val())
            return;
        Todos.insert({
            listId: this._id,
            text: $input.val(),
            checked: false,
            createdAt: new Date()
        });
        Records.update(this._id, {
            $inc: {
                incompleteCount: 1
            }
        });
        $input.val('');
    },
    'click .person-row': function() {
        Session.set('selectedPersonId', this._id);
    },
    'change .autosave-toggle': function() {
        Session.set('autoSaveMode', !Session.get('autoSaveMode'));
    },
});
