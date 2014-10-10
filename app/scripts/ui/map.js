sarcat.map = function(elem, callback) {


    elem.insert('iframe', ':first-child')
    .attr('src','tmp/mapview.html')
        .attr('id', 'map')
        .style({
            height: '500px',
            width: '100%'
        });

    if (callback) {
        callback();
    }
return;
//<iframe src="tmp/mapview.html" width="100%" height="600px" border="0" frameborder="0" style="float:left; z-index:999;"></iframe>
/*

    elem.insert('div', ':first-child')
        .attr('id', 'map')
        .style({
            height: '500px',
            width: '100%'
        });
    L.mapbox.accessToken = 'pk.eyJ1IjoibWFwcGlza3lsZSIsImEiOiJ5Zmp5SnV3In0.mTZSyXFbiPBbAsJCFW8kfg';
    L.mapbox.map('map', 'examples.map-i86nkdio')
        .setView([40, -74.50], 9);
    if (callback) {
        callback();
    }*/
};