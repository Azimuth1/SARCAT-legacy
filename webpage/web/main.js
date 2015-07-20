$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'styles/main.css'));

$.getJSON("config.json", function(data) {
    config = data;
})



