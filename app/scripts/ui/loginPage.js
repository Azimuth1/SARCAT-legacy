sarcat.loginPage = function(context, sar) {
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
    var form = login.append('div')
        .attr('class', 'wrapper')
        .append('form')
        .attr('class', 'form-signin');
    form.append('h2')
        .attr('class', 'form-signin-heading')
        .text('Login');

    var username = form.append('input')
        .attr('autofocus', '')
        .attr('class', 'form-control')
        .attr('name', 'username')
        .attr('value', 'SARCATUser@sarcat.org')
        .attr('type', 'text')
        .attr('required', '');

    var password = form.append('input')
        .attr('autofocus', '')
        .attr('class', 'form-control')
        .attr('name', 'username')
        .attr('value', 'aaaaaa')
        .attr('type', 'password')
        .attr('required', '');

    var remember = form.append('label')
        .attr('class', 'checkbox');
    remember.append('input')
        .attr('type', 'checkbox');
    remember.append('p')
        .text('Remember Me');
    form.append('button')
        .attr('class', 'btn btn-lg btn-primary btn-block demoLogin')
        .attr('type', 'button')
        .text('Login')
        .on('click', function() {
            
            sar.auth(username.node().value,password.node().value);
        });
    form.append('button')
        .attr('class', 'btn btn-lg btn-default btn-block demoLogin')
        .attr('type', 'button')
        .text('Not Registered?');
};