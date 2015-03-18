/*var completeProfile = function() {
    var obj = Meteor.user().profile;
    var formLen = Object.keys(obj).length;
    var schemaLen = Schemas.profile._schemaKeys.length;
    return formLen === schemaLen;
};*/

Template.userHome.rendered = function() {
    var admin = Roles.userIsInRole(Meteor.userId(), ['admin']);
    var userView;

    /*if (!completeProfile()) {
        userView = 'userProfile';
    } else {*/
    userView = admin ? 'admin' : 'userStats';
    //}

    Session.set('userView', userView);
    $('.userView[data=' + userView + ']').click();

};

Template.userHome.helpers({
    userView: function(name) {
        //console.log(name);
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
        //console.log(this);
        return this.data.person;
    },
});
/*
Template.userProfile.helpers({
    profileIncomplete: function() {
        var complete = completeProfile();
        //console.log(complete);
        Session.set('profileComplete', complete);
        return !complete;
    }
});
*/