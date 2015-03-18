var UserCoarseLocation = Parse.Object.extend('UserCoarseLocation', {
    // Instance Methods
    /**
     * update
     * @param location {object} guaranteed to contain city and state information
     */
    update: function(location) {
        _Y.log('UserCoarseLocation.update');
        var result = null;
        var data = {
            city: location.city,
            state: location.state
        };
        result = this.save(data);
        return result;
    },
    initialize: function(attrs, options) {
    }
}, {
    // Class Methods
    createForUser: function(user, callback) {
        var coarseLocation = new UserCoarseLocation();
        coarseLocation.setUserACL(user);
        coarseLocation.set('user', user);
        if (typeof callback === 'function') {
            callback(coarseLocation);
        }
        var data = {
            coarseLocation: coarseLocation
        };
        user.save(data);
        return coarseLocation;
    },
    getForUser: function(user, callback) {
        var promise = new Parse.Promise();
        var coarseLocation = user.get('coarseLocation');
        if (coarseLocation) {
            coarseLocation.refresh().then(function(coarseLocation) {
                if (typeof callback === 'function') {
                    callback(coarseLocation);
                }
                promise.resolve(coarseLocation);
            }, function(error) {
                coarseLocation = UserCoarseLocation.createForUser(user, callback);
                promise.resolve(coarseLocation);
            });
        } else {
            coarseLocation = UserCoarseLocation.createForUser(user, callback);
            promise.resolve(coarseLocation);
        }
        return promise;
    },
    updateForUser: function(user, location) {
        if (location.city && location.state) {
            UserCoarseLocation.getForUser(user, function(coarseLocation) {
                if (coarseLocation) {
                    coarseLocation.update(location);
                }
            });
        }
    }
});
