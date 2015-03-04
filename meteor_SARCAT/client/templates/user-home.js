var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);
listFadeInHold = null;
Template.userHome.rendered = function() {};
Template.userHome.helpers({});
Template.userHome.events({});
AutoForm.hooks({
    profileUpdateForm: {
        onSubmit: function(doc) {
            alert('!!!');
            console.log(doc);
            Schemas.User.clean(doc);
            this.done();
            return false;
        },
        /*onSuccess: function(operation, result, template) {
            console.log(operation, result, template)
            console.log('updated');
            //Router.go('users.show',{'username':template.data.doc.username});
        },
        onError: function(operation, error, template) {
            console.log(operation, error)
        },*/
    }
});
