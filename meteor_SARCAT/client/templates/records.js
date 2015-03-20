

Template.records.rendered = function() {
    console.log(this.data);
};



Template.records.helpers({
    lists: function() {
        return Records.find();
    }
});


Template.records.events({

});