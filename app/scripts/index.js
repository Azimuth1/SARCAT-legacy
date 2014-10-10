(function() {
    d3.json('data/config.json', function(d) {
        var sar = sarcat({
            layout: d.config
        });
        console.log(sar);
    });
})();