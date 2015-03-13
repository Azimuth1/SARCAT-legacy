Template.userHome.rendered = function() {};
Template.userHome.helpers({
    userView: function(name) {
        return Session.get('userView') === name;
    },
    recordStats: function(){
        var records = Records.find().fetch();
        console.log(records)
        return JSON.stringify(records);
    },
    renderForm: function(name) {
        var render = ['profile'];
        return render.indexOf(name) !== -1 ? true : false;
    },
    formComplete: function(name) {
        var obj = Meteor.user()[name];
        var formLen = Object.keys(obj).length;
        var schemaLen = Schemas.profile._schemaKeys.length;
        var complete = formLen === schemaLen;
        //var complete = Match.test(obj, Schemas[name]);
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
