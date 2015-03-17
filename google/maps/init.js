function initializeGmaps() {
    var mapOptions = {
        center: new google.maps.LatLng(DEFAULT_GMAP_LAT, DEFAULT_GMAP_LNG),
        zoom: DEFAULT_GMAP_ZOOM,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById(GMAP_CONTAINER), mapOptions);
}
google.maps.event.addDomListener(window, 'load', initializeGmaps);
