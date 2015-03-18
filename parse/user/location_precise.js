var UserPreciseLocation = Parse.Object.extend('UserPreciseLocation', {
    // Instance Methods
    getLatLngString: function(readable) {
        var geoPoint = this.get('location');
        var latlng;
        if (geoPoint) {
            if (readable) {
                latlng = geoPoint.latitude.toFixed(5) + ', ' + geoPoint.longitude.toFixed(5);
            } else {
                latlng = geoPoint.latitude + ',' + geoPoint.longitude;
            }
        }
        return latlng;
    },
    update: function(location) {
        _Y.log('UserPreciseLocation.update');
        var point = new Parse.GeoPoint({
            latitude: location.latitude,
            longitude: location.longitude
        });
        //_Y.log(location.geocoderResult);
        var keysToOmit = [
            'latitude',
            'longitude',
            'geocoderResult'
            
        ];
        var data = _.omit(location, function(value, key, object) {
            var shouldOmit = _.includes(keysToOmit, key);
            return shouldOmit;
        });
        //_Y.log(data);
        data.location = point;
        var promise = this.save(data);
        return promise;
    },
    initialize: function(attrs, options) {
    }
}, {
    // Class Methods
    createForUser: function(user, callback) {
        var preciseLocation = new UserPreciseLocation();
        preciseLocation.setUserACL(user);
        preciseLocation.set('user', user);
        _Y.log('created');
        if (typeof callback === 'function') {
            _Y.log('called back');
            callback(preciseLocation);
        }
        var data = {
            preciseLocation: preciseLocation
        };
        user.save(data);
        return preciseLocation;
    },
    getForUser: function(user, callback) {
        var promise = new Parse.Promise();
        var preciseLocation = user.get('preciseLocation');
        if (preciseLocation) {
            preciseLocation.refresh().then(function(preciseLocation) {
                if (typeof callback === 'function') {
                    callback(preciseLocation);
                }
                promise.resolve(preciseLocation);
            }, function(error) {
                preciseLocation = UserPreciseLocation.createForUser(user, callback);
                promise.resolve(preciseLocation);
            });
        } else {
            preciseLocation = UserPreciseLocation.createForUser(user, callback);
            promise.resolve(preciseLocation);
        }
        return promise;
    },
    updateForUser: function(user, location) {
        UserPreciseLocation.getForUser(user, function(preciseLocation) {
            if (preciseLocation) {
                preciseLocation.update(location);
            }
        });
    }
});
