/*
 Firebase storage for acrobot.
 
 This is a generic storage mechanism, acrobot is only using it for storage of ignored acronyms at the moment.
*/

var Firebase = require('firebase');

module.exports = function(config) {

    if (!config && !config.firebase_uri && !config.firebase_secretToken)
        throw new Error('Need to provide firebase uri and secret token');
    
    var isAuthComplete = false;
    var isAuthorised = function() {
        return isAuthComplete;
    };
        
    var rootRef = new Firebase(config.firebase_uri);
    rootRef.authWithCustomToken(config.firebase_secretToken, function(error, authData){
        if (error) {
            console.log("Authentication Failed!", error);
        } else {
            isAuthComplete = true;
            console.log("Authenticated successfully with payload:", authData);
        }        
    });
    var teamsRef = rootRef.child('teams');
    var usersRef = rootRef.child('users');
    var channelsRef = rootRef.child('channels');

    var get = function(firebaseRef) {
        return function(id, cb) {
            firebaseRef.child(id).once('value',
                function(records) {
                    cb(undefined, records.val());
                },
                function(err) {
                    cb(err, undefined);
                }
            );
        };
    };

    var save = function(firebaseRef) {
        return function(data, cb) {
            var firebase_update = {};
            firebase_update[data.id] = data;
            firebaseRef.update(firebase_update, cb);
        };
    };

    var all = function(firebaseRef) {
        return function(cb) {
            firebaseRef.once('value',
                function(records) {
                    var list = [];
                    for (key of Object.keys(records.val())) {
                        list.push(records.val()[key]);
                    }
                    cb(undefined, list);
                },
                function(err) {
                    cb(err, undefined);
                }
            );
        };
    };

    var storage = {
        isAuthorised: isAuthorised,
        teams: {
            get: get(teamsRef),
            save: save(teamsRef),
            all: all(teamsRef)
        },
        channels: {
            get: get(channelsRef),
            save: save(channelsRef),
            all: all(channelsRef)
        },
        users: {
            get: get(usersRef),
            save: save(usersRef),
            all: all(usersRef)
        }
    };

    return storage;

};