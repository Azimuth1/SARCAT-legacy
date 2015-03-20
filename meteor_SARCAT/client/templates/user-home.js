var agencyProfileIncomplete = function() {
    var config = Session.get('config');
    if (!config) {
        return;
    }
    var agencyProfile = config.agencyProfile;
    var apKeys = Object.keys(agencyProfile);
    return apKeys.length < Schemas.agencyProfile._schemaKeys.length;
}
Template.userHome.rendered = function() {};
Template.userHome.helpers({
    userView: function(name) {
        //console.log(name);
        return Session.get('userView') === name;
    },
    isAdmin: function() {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    recordStats: function() {
        var records = Records.find()
            .fetch();
        return JSON.stringify(records);
    },
    renderForm: function(name) {
        var render = ['profile'];
        return render.indexOf(name) !== -1 ? true : false;
    },
    selectedPersonDoc: function() {
        return this.data.person;
    },
});
