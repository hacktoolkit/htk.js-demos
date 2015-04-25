YUI().add(
    'login-manager',
function(Y) {
    // --------------------------------------------------
    // YUI "Local" Globals
    // --------------------------------------------------

    // CSS selectors
    var CSS_CLASS_HIDDEN = 'hidden';
    var CSS_CLASS_LOGGED_IN = 'logged-in';
    var CSS_CLASS_LOGGED_OUT = 'logged-out';
    var CSS_CLASS_LOGIN_BUTTON = 'login-button';
    var CSS_CLASS_LOGOUT_BUTTON = 'logout-button';

    var CSS_CLASS_LOGIN_USER_INFO = 'login-user-info';

    // Nodes
    var loginUserInfo = Y.all('.' + CSS_CLASS_LOGIN_USER_INFO);

    // App variables
    var syncLoginStateHandler = null;

    /* End YUI "Local" Globals */
    /* -------------------------------------------------- */

    function helloWorld() {
        // just to sanity check
        alert('hello world');
    }

    function setSyncLoginStateHandler(callback) {
        syncLoginStateHandler = callback;
    }

    function doFacebookLogin(callback) {
        Y.log('doFacebookLogin()');
        Parse.FacebookUtils.logIn('email', {
            success: function(parseUser) {
                parseUser.afterLogin();
                parseUser.updateWithGraphUser(callback).then(function(updatedUser) {
                    updatedUser.updateCloseFacebookFriends();
                });
                if (!parseUser.existed()) {
                    Y.log('User signed up and logged in through Facebook!');
                } else {
                    Y.log('User logged in through Facebook!');
                }
            },
            error: function(parseUser, error) {
                Y.log('User cancelled the Facebook login or did not fully authorize.');
            }
        });
    }

    function doLogout(callback) {
        Y.log('doLogout()');
        Parse.User.logOut();
        if (typeof callback === 'function') {
            callback();
        } else {
            syncLoginState(null);
        }
    }

    function syncLoginState(parseUser, callbacks) {
        Y.log('syncLoginState');
        if (typeof parseUser === 'undefined') {
            Y.log('Setting parseUser = Parse.User.current()');
            parseUser = Parse.User.current();
        }
        if (parseUser) {
            parseUser.refresh().then(function(updatedUser) {
                parseUser = updatedUser;
                var userName = parseUser.getName();
                toggleLoggedInNodesVisibility(true);
                
                loginUserInfo.each(function(node) {
                    node.setHTML('Logged in as: ' + userName);
                });
                if (callbacks && typeof callbacks.success === 'function') {
                    callbacks.success(parseUser);
                }
            }, function() {
                Y.log('Unable to refresh user');
                if (callbacks && typeof callbacks.error === 'function') {
                    callbacks.error();
                }
            })
        } else {
            toggleLoggedInNodesVisibility(false);
            if (callbacks && typeof callbacks.loggedOut === 'function') {
                callbacks.loggedOut();
            }
        }
    }

    function toggleLoggedInNodesVisibility(isLoggedIn) {
        var loggedInNodes = Y.all('.' + CSS_CLASS_LOGGED_IN);
        var loggedOutNodes = Y.all('.' + CSS_CLASS_LOGGED_OUT);
        loggedInNodes.removeClass(CSS_CLASS_HIDDEN);
        loggedOutNodes.removeClass(CSS_CLASS_HIDDEN);
        if (isLoggedIn) {
            loggedInNodes.show();
            loggedOutNodes.hide();
        } else {
            loggedOutNodes.show();
            loggedInNodes.hide();
        }
    }

    function handleLoginPressed(e) {
        if (typeof syncLoginStateHandler === 'function') {
            doFacebookLogin(syncLoginStateHandler);
        } else {
            doFacebookLogin(syncLoginState);
        }
    }

    function handleLogoutPressed(e) {
        var callback = syncLoginState;
        if (typeof syncLoginStateHandler === 'function') {
            callback = syncLoginStateHandler;
        }
        doLogout(function() {
            callback(null);
        });
    }

    // App Initializers
    function initEventHandlers() {
        Y.delegate('tap', handleLoginPressed, 'body', '.' + CSS_CLASS_LOGIN_BUTTON);
        Y.delegate('tap', handleLogoutPressed, 'body', '.' + CSS_CLASS_LOGOUT_BUTTON);
        Y.on('load', function(e) {
            syncLoginState();
        });
    }

    function init() {
    }

    initEventHandlers();
    init();

    // Module exports
    Y.LoginManager = {
        setSyncLoginStateHandler : setSyncLoginStateHandler,
        doFacebookLogin : doFacebookLogin,
        doLogout : doLogout,
        syncLoginState : syncLoginState,
        helloWorld : helloWorld
    }

}, '0.1.0', { requires: ['node', 'event'] });
