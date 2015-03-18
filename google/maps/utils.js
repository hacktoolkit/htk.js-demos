/**
 * extractAddressComponents
 * @param addressComponents {object} from GMaps geocoder result
 * @return {object} with extracted/flattened address components
 */
function extractAddressComponents(addressComponents) {
    // if (addressComponents.length >= 9)
    // though, not necessarily always in this order
    // 0 - street_number
    // 1 - route (street name)
    // 2 - neighborhood
    // 3 - locality (city)
    // 4 - administrative_area_level_2 (county)
    // 5 - administrative_area_level_1 (state)
    // 6 - country
    // 7 - postal_code (zipcode)
    // 8 - postal_code_suffix (+4 zipcode)
    var extracted = {};
    _.forEach(addressComponents, function(addressComponent) {
        var key = addressComponent.types[0];
        var value = addressComponent.long_name;
        if (key === 'administrative_area_level_1') {
            extracted['state'] = addressComponent.short_name;
        } else if (key === 'locality') {
            extracted['city'] = value;
        }
        extracted[key] = value;
    });
    return extracted;
}

/**
 * reverseGeocode
 * Reverse geocodes a latitude and longitude into an address
 * @param latitude
 * @param longitude
 * @return {promise}
 */
function reverseGeocode(latitude, longitude) {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(latitude, longitude);
    var promise = _Y.Promise(function(resolve, reject) {
        var location = {
            latitude : latitude,
            longitude : longitude,
            geocoderResult: null
        };
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var result = results[0];
                if (result) {
                    location.geocoderResult = result;
                } else {
                    _Y.log('Geocoder failed. No results');
                }
            } else {
                _Y.log('Geocoder failed due to: ' + status);
            }
            resolve(location);
        });
    });
    return promise;
}
