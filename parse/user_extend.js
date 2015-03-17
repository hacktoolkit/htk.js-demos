/**
 * refresh
 * ensures that the local copy of the object is the freshest
 * https://parse.com/docs/js_guide#objects-retrieving
 */
Parse.User.prototype.refresh = function() {
    var promise = new Parse.Promise();
    if (this.getName() === '') {
        this.fetch({
            success: function(updatedUser) {
                promise.resolve(updatedUser);
            },
            error: function(oldUser, error) {
                promise.reject(error);
            }
        });
    } else {
        promise.resolve(this);
    }
    return promise;
}

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

Parse.User.prototype.getFbImageUrl = function(width, height) {
    width = typeof width === 'undefined'? 60 : width;
    height = width;
    var imgUrl = '//graph.facebook.com/' + this.get('fbId') + '/picture?width=' + width + '&height=' + height;
    return imgUrl;
}

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

Parse.User.prototype.getLatLngString = function(readable) {
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
}

/**
 * updateWithGraphUser
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
        parseUser.set('fbId', fbId);
        parseUser.set('firstName', firstName);
        parseUser.set('lastName', lastName);
        parseUser.set('email', email);
        parseUser.set('fbUser', fbUser);
        parseUser.save().then(function(updatedUser) {
            _Y.log(updatedUser.get('firstName'));
            if (typeof callback === 'function') {
                callback(updatedUser);
            }
            promise.resolve(updatedUser);
        });
    });
    return promise;
}

Parse.User.prototype.updateCloseFacebookFriends = function() {
    _Y.log('Parse.User.prototype.getCloseFacebookFriends');
    var parseUser = this;
    var promise = new Parse.Promise();
    FB.api('/me/friends?limit=2000', function(response) {
        var friends = response.data;
        var friendIds = [];
        for (var i=0; i < friends.length; ++i) {
            var friend = friends[i];
            friendIds.push(friend.id);
        }
        promise.resolve(friendIds);
        parseUser.set('fbFriends', friendIds);
        parseUser.save();
    });
    return promise;
}

Parse.User.prototype.markLocationOnMap = function(googleMap) {
    _Y.log('markLocationOnMap');
    var marker = null;
    var geoPoint = this.get('location');
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
            anchor: new google.maps.Point(0, iconSize)
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

Parse.User.prototype.updateLocation = function(location) {
    _Y.log('updateLocation');
    var parseUser = this;
    var point = new Parse.GeoPoint({
        latitude: location.latitude,
        longitude: location.longitude
    });
    parseUser.set('location', point);
    parseUser.set('locationLastUpdatedAt', new Date());
    if (location.address) {
        parseUser.set('address', location.address);
    }
    var promise = parseUser.save();
    return promise;
}

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
