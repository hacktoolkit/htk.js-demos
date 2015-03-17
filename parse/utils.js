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
