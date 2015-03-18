/**
 * refresh
 * @return {Parse.Promise<Parse.User>} refreshed user if user has an empty name
 */
Parse.User.prototype.refresh = function() {
    var promise = new Parse.Promise();
    if (this.getName() === '') {
        promise = Parse.Object.prototype.refresh.call(this);
    } else {
        promise.resolve(this);
    }
    return promise;
}

/**
 * afterLogin
 * Called after User successfully logs in
 */
Parse.User.prototype.afterLogin = function() {
    //this.setUserACL(this);
}

/**
 * getCachedRelation
 */
Parse.User.prototype.getCachedRelation = function(key) {
    var obj;
    if (this._cachedRelations) {
        obj = this._cachedRelations[key];
    }
    return obj;
}

/**
 * cacheRelation
 */
Parse.User.prototype.cacheRelation = function(key, value) {
    if (!this._cachedRelations) {
        this._cachedRelations = {};
    }
    this._cachedRelations[key] = value;
}

/**
 * getName
 *
 * @return {string} User name
 */
Parse.User.prototype.getName = function() {
    var name = '';
    var firstName = this.get('firstName');
    var lastName = this.get('lastName');
    if (typeof firstName !== 'undefined') {
        name += firstName;
        if (typeof lastName !== 'undefined') {
            name += ' ';
        }
    }
    if (typeof lastName !== 'undefined') {
        name += lastName;
    }
    return name;
}

/**
 * getFbImageUrl
 * @return {string} url of Facebook image
 */
Parse.User.prototype.getFbImageUrl = function(width, height) {
    width = typeof width === 'undefined'? 60 : width;
    height = width;
    var imgUrl = '//graph.facebook.com/' + this.get('fbId') + '/picture?width=' + width + '&height=' + height;
    return imgUrl;
}

/**
 * getFbImage
 * @return {string} img tag of Facebook image
 */
Parse.User.prototype.getFbImage = function(width, height) {
    var name = this.getName();
    var imgUrl = this.getFbImageUrl(width, height);
    var imgHtml = '<img src="' + imgUrl + '" alt="' + name + '" title="' + name + '" />';
    return imgHtml;
}

Parse.User.prototype.getAddress = function() {
    var address = this.get('address');
    return address;
}

/**
 * updateWithGraphUser
 * Updates User with Facebook graph user data
 * This function can only be called on the currently logged-in user
 */
Parse.User.prototype.updateWithGraphUser = function(callback) {
    _Y.log('updateWithGraphUser');
    var parseUser = this;
    var promise = new Parse.Promise();
    FB.api('/me', function(fbUser) {
        _Y.log(fbUser);
        var fbId = fbUser.id;
        var firstName = fbUser.first_name;
        var lastName = fbUser.last_name;
        var email = fbUser.email;
        var fbUrl = fbUser.link;
        var data = {
            fbId: fbId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            fbUrl: fbUrl,
            fbUser: fbUser
        };
        parseUser.save(data).then(function(updatedUser) {
            _Y.log(updatedUser.get('firstName'));
            if (typeof callback === 'function') {
                callback(updatedUser);
            }
            promise.resolve(updatedUser);
        });
    });
    return promise;
}

/**
 * updateCloseFacebookFriends
 * @return {promise} array of friend ids
 */
Parse.User.prototype.updateCloseFacebookFriends = function() {
    _Y.log('Parse.User.prototype.updateCloseFacebookFriends');
    var parseUser = this;
    var promise = new Parse.Promise();
    FB.api('/me/friends?limit=2000', function(response) {
        var friends = response.data;
        var friendIds = _.map(friends, 'id');
        promise.resolve(friendIds);
        parseUser.set('fbFriends', friendIds);
        parseUser.save();
    });
    return promise;
}

/**
 * markLocationOnMap
 * @param {obj} googleMap
 * @return {obj} marker
 */
Parse.User.prototype.markLocationOnMap = function(googleMap, preciseLocation) {
    _Y.log('User.markLocationOnMap');
    var marker = null;
    var geoPoint = preciseLocation.get('location');
    if (geoPoint) {
        var location = new google.maps.LatLng(geoPoint.latitude, geoPoint.longitude);

        var iconSize = 60; // 48 is also okay?
        var icon = {
            url: this.getFbImageUrl(iconSize),
            // This marker is `iconSize` pixels wide by `iconSize` pixels tall.
            size: new google.maps.Size(iconSize, iconSize),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the bottom-left at 0,`iconSize`.
            anchor: new google.maps.Point(0, iconSize),
            scaledSize: new google.maps.Size(iconSize, iconSize)
        };
        marker = new google.maps.Marker({
            map: googleMap,
            icon: icon,
            title: this.getName(),
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: location
        });
    }
    return marker;
}

/**
 * getCoarseLocation
 */
Parse.User.prototype.getCoarseLocation = function() {
    _Y.log('User.getCoarseLocation');
    var promise = new Parse.Promise();
    var coarseLocation = this.get('coarseLocation');
    if (coarseLocation) {
        coarseLocation.refresh().then(function(coarseLocation) {
            promise.resolve(coarseLocation);
        });
    } else {
        coarseLocation = new UserCoarseLocation();
        coarseLocation.set('user', this);
//        coarseLocation.save();
        var data = {
            coarseLocation: coarseLocation
        };
        this.save(data).then(function(updatedUser) {
            promise.resolve(coarseLocation);
        });
    }
    return promise;
}

/**
 * getPreciseLocation
 */
Parse.User.prototype.getPreciseLocation = function() {
    _Y.log('User.getPreciseLocation');
    var preciseLocation = this.get('preciseLocation');
    if (!preciseLocation) {
        preciseLocation = new UserPreciseLocation();
        preciseLocation.set('user', this);
//        preciseLocation.save();
        var data = {
            preciseLocation: preciseLocation
        };
        this.save(data);
    }
    return preciseLocation;
}

/**
 * updateLocation
 * updates the stored location
 * @param {obj} location
 */
Parse.User.prototype.updateLocation = function(location) {
    _Y.log('User.updateLocation');
    if (location) {
        var geocoderResult = location.geocoderResult;
        location.address = geocoderResult.formatted_address;
        var addressComponents = geocoderResult.address_components;
        var extractedAddressComponents = extractAddressComponents(addressComponents);
        location = _.merge(location, extractedAddressComponents);
        UserCoarseLocation.updateForUser(this, location);
        UserPreciseLocation.updateForUser(this, location);
    }
}

/**
 * getFriends
 * Retrieve previously stored Facebook friends
 * @return {promise} array of Users who are Facebook friends
 */
Parse.User.prototype.getFriends = function() {
    _Y.log('Parse.User.prototype.getFriends');
    var promise = new Parse.Promise();
    var fbFriends = this.get('fbFriends');
    if (fbFriends) {
        var query = new Parse.Query(Parse.User);
        query.containedIn('fbId', fbFriends);
        query.find({
            success: function(fbParseFriends) {
                _Y.log('Successfully retrieved Facebook friends');
                promise.resolve(fbParseFriends);
            }
        });
    }
    return promise;
}
