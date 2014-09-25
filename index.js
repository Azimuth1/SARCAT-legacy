$('.control-label strong').map(function() {
    var name = $(this) .text();return name
    
})


$('.step').map(function() {
    var name = $(this).text();console.log(name)
    var topics = $(this + '.control-label strong');console.log(topics)
});




a = $('.step').map(function(d,e) {
    var group = $(this).text();
    var step = $('#step'+(d+1));



    var controlgroup = step.find('.box-content').children('.control-group')
    var data = controlgroup.map(function() {
		var text = $(this).find('.control-label strong').map(function(){return $(this).text()})
		var type = $(this).find('input, select').map(function(){
			var type = $(this).attr('type') || 'select';
			var options = $(this).find('option').map(function(d){return $(this).text()})

			var obj = {};
			obj.type=type
			if(options.length){obj.options=options}
			return obj
		})
    	return {type:type}
    }).get();

 

    //var type = controlgroup.find('input').map(function() {return $(this).attr('type')});
    return {group:group,data:data}
});




{
  "globals": {
  "L": false,
  "require": false,
  "module": false,
  "console": false,
  "document": false,
  "window": false
  },
  "globalstrict": true,
  "loopfunc": true
}