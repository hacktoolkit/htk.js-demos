var delay = function(millis) {
    var promise = new Parse.Promise();
    setTimeout(function() {
        promise.resolve();
    }, millis);
    return promise;
};

//delay(100).then(function() {
//  // This ran after 100ms!
//});

/*
  var TestObject = Parse.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({foo: "bar"}, {
  success: function(object) {
  $(".success").show();
  },
  error: function(model, error) {
  $(".error").show();
  }
  });
*/

/**
 * refresh
 * Wrapper around Parse.Object.fetch
 * Ensures that the local copy of the object is the freshest
 * https://parse.com/docs/js_guide#objects-retrieving
 *
 * @return {Parse.Promise<Parse.Object>}
 */
Parse.Object.prototype.refresh = function() {
    var promise = new Parse.Promise();
    this.fetch({
        success: function(updatedObject) {
            promise.resolve(updatedObject);
        },
        error: function(oldObject, error) {
            promise.reject(error);
        }
    });
    return promise;
}

/**
 * setUserACL
 * Set an ACL on user's data to not be publicly readable
 * https://parse.com/docs/data#security-objects
 * @param user {Parse.User} the user with privileges
 * @param opts {object} various options
 */
Parse.Object.prototype.setUserACL = function(user, opts) {
    this.setACL(new Parse.ACL(user));
    if (opts) {
        if (opts.saveImmediately) {
            this.save();
        }
    }
}

// Fetches the config at most once every 12 hours per app runtime
var refreshParseConfig = function() {
  var lastFetchedDate;
  const configRefreshInterval = 12 * 60 * 60 * 1000;
  return function() {
    var currentDate = new Date();
    if (lastFetchedDate === undefined ||
        currentDate.getTime() - lastFetchedDate.getTime() > configRefreshInterval) {
      Parse.Config.get();
      lastFetchedDate = currentDate;
    }
  };
}();
