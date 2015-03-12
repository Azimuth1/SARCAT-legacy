
Template.userHome.rendered = function() {};
Template.userHome.helpers({
    renderForm: function(name) {
        var render = ['profile'];
        return render.indexOf(name) !== -1 ? true : false;
    },
    formComplete: function(name) {
        var complete = Match.test(Meteor.user()[name], Schemas[name]);
        return complete ? '' : 'afWarning';
    },
    selectedPersonDoc: function(){
        console.log(this)
        return this.data.person;
    },
});
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
