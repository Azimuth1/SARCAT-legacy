sarcat.map = function(elem, callback) {
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
    }
};