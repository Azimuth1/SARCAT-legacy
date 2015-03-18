

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
