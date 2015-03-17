var completeProfile = function() {
    var obj = Meteor.user().profile;
    var formLen = Object.keys(obj).length;
    var schemaLen = Schemas.profile._schemaKeys.length;
    return formLen === schemaLen;
};



Template.userHome.rendered = function() {
    Session.set('userView', 'userProfile');
};


Template.userHome.helpers({
    userView: function(name) {
        console.log(name);
        return Session.get('userView') === name;
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
    /*formComplete: function(name) {
        var complete = completeProfile();
        return complete ? '' : 'warning-bg';
    },*/
    selectedPersonDoc: function() {
        console.log(this);
        return this.data.person;
    },
});







Template.userProfile.helpers({
    profileIncomplete: function() {
        var complete = completeProfile();
        console.log(complete);
        Session.set('profileComplete', complete);
        return !complete;
    }
});







Template.admin.rendered = function() {
    console.log(this.data);
};



Template.admin.helpers({
    profileIncomplete: function() {
        var complete = completeProfile();
        console.log(complete);
        Session.set('profileComplete', complete);
        return !complete;
    }
});
