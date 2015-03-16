

var completeProfile = function() {
    var obj = Meteor.user().profile;
    var formLen = Object.keys(obj).length;
    var schemaLen = Schemas.profile._schemaKeys.length;
    return formLen === schemaLen;
};
Template.userHome.rendered = function() {
if(!completeProfile()){
    Session.set('userView','Profile');
}
};
Template.userHome.helpers({

    userView: function(name) {
        console.log(name)
        var view = Session.get('userView') === name;
        return view ? '' : 'hide';
    },
    recordStats: function() {
        var records = Records.find().fetch();
        // console.log(records)
        return JSON.stringify(records);
    },
    renderForm: function(name) {
        var render = ['profile'];
        return render.indexOf(name) !== -1 ? true : false;
    },
    formComplete: function(name) {
        var complete = completeProfile();
        return complete ? '' : 'warning-bg';
    },
    selectedPersonDoc: function() {
        console.log(this)
        return this.data.person;
    },
});
Template.userHome.events({});
/*
AutoForm.hooks({
    profileUpdateForm: {
        onSubmit: function(doc) {
            alert('!!!');
            console.log(doc);
            Schemas.User.clean(doc);
            this.done();
            return false;
        },
        onSuccess: function(operation, result, template) {
            console.log(operation, result, template)
            console.log('updated');
            //Router.go('users.show',{'username':template.data.doc.username});
        },
        onError: function(operation, error, template) {
            console.log(operation, error)
        },
    }
});
*/
