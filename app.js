/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
A Slack Bot using Botkit

Acrobot listens for any acronyms that it knows about and provides
a link to wikipedia for the said acronym. 

You can also ask acrobot to ignore an acronym using the ignore command.
e.g. @acrobot ignore xmpp

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.slack_token ) {
    console.log('Error: Specify slack_token in environment');
    process.exit(1);
}

// 3rd party libs
var Botkit = require('BotKit');

// acrobot functionality
var acronyms = require('./acronym-finder.js')();
acronyms.ensureAcronymsBuilt();

var controller = buildController(process.env);

var bot = controller.spawn({
    token: process.env.slack_token
}).startRTM();

controller.hears(['ignore (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var acronymToIgnore = message.match[1].toLowerCase();
    acronyms.addToBlacklist(acronymToIgnore, bot, message, controller);    
});

controller.hears(['(.*)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    acronyms.findAcronyms(bot, message, controller);
});

function buildController(env) {
    var slackBotOptions = {
        debug: false
    };
    
    // Hook up Firebase storage if it has been configured
    if (env.firebase_url && env.firebase_url.length > 0) {
        var firebaseConfig = {
            firebase_uri: process.env.firebase_url, 
            firebase_secretToken: process.env.firebase_token
        }
        
        var firebaseStorageProvider = require('./firebase-storage.js')(firebaseConfig);
        slackBotOptions.storage = firebaseStorageProvider;
    }
    
    return Botkit.slackbot(slackBotOptions);    
}