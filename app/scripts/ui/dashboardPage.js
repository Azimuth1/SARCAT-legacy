sarcat.dashboardPage = function(context, sar) {
    var login = context.append('div')
        .attr('class', 'login');
    var introtText = login.append('div')
        .attr('class', 'intro-text');
    introtText.append('div')
        .attr('class', 'intro-lead-in')
        .text('Missing persons database entry.');
    introtText.append('div')
        .attr('class', 'intro-heading')
        .text('SARCAT');
    var elem = login.append('div')
        .attr('class', 'form-welcome');
    elem.append('h1')
        .text('Welcome User!');
    elem.append('hr');
    elem.append('button')
        .attr('type', 'button')
        .attr('class', 'btn btn-primary btn-lg btn-block')
        .text('Create New Record')
        .on('click', function() {
            sar.formPage();
        });
    elem.append('button')
        .attr('type', 'button')
        .attr('class', 'btn btn-default btn-lg btn-block')
        .text('Edit Existing Record');
};