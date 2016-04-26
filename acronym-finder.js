/*
 Handles the finding of acronyms and the maintenance of an acronym blacklist.
 
*/

var _ = require('lodash');
var request = require('request');  
var jsdom = require('jsdom');

module.exports = function(unusedConfig) {

    var acronyms = [];
    var acronymBlackList = [];
    var defaultAcronymBlackList = ['am','as', 'at', 'is', 'it', 'me', 'os'];   

    var haveAcronymsLoaded = false;
    var ensureAcronymsBuilt = function() {

        request({ uri:'https://en.wikipedia.org/wiki/List_of_computing_and_IT_abbreviations' }, function (error, response, body) {  
            if (error && response.statusCode !== 200) {
                console.log('Error when contacting wikipedia');
            }

            jsdom.env({
                html: body,
                scripts: [
                'http://code.jquery.com/jquery-2.2.3.min.js'
                ],
                done: function (err, window) {
                    var $ = window.jQuery;

                    // jQuery is now loaded on the jsdom window created from 'agent.body'
                    // now for some jquery to pull all the acroyms
                    $('#mw-content-text').find('a').each(function(){
                        var current = $(this);
                        if (current.text().length > 1){
                            acronyms.push({text: current.text(), 'href': current.attr('href')})
                        }
                    });
                    haveAcronymsLoaded = true;    
                }
            });
        });
    }
    
    var isBlacklistBuilt = false;
    var ensureBlacklistIsBuilt = function(message, controller) {
        if (isBlacklistBuilt)             
            return true;
            
        if (typeof(controller.storage.isAuthorised) !== typeof(Function)) {
            // We are not using Firebase storage
            acronymBlackList = defaultAcronymBlackList;
            return true;
        }            
            
        if (!controller.storage.isAuthorised()) {
            acronymBlackList = defaultAcronymBlackList;
            return false;
        } 

        controller.storage.teams.get(message.team, function(err, team_data){
            if (!team_data || !team_data.blacklist) {            
                controller.storage.teams.save({id: message.team, blacklist: defaultAcronymBlackList}, function(err){                
                    if (err != null){
                        isBlacklistBuilt = false;    
                    } else {
                        isBlacklistBuilt = true;
                        acronymBlackList = defaultAcronymBlackList;
                    }
                    return isBlacklistBuilt;
                });            
            } else {
                isBlacklistBuilt = true;
                acronymBlackList = team_data.blacklist;
                return isBlacklistBuilt;            
            }
        })    
    };    
        
    var addToBlacklist = function(acronymToIgnore, bot, message, controller) {
        
        if (_.indexOf(acronymBlackList, acronymToIgnore) > -1)
            return;
        
        acronymBlackList.push(acronymToIgnore);
        
        controller.storage.teams.save({id: message.team, blacklist: acronymBlackList}, function(err){
            if (err != null) {
                console.log('Error when adding to blacklist');
            } 
        });
        bot.reply(message, 'I am now ignoring: ' + acronymToIgnore);    
    };

    var findAcronyms = function(bot, message, controller) {
        if (haveAcronymsLoaded) {
            var matched = message.match[1];
            var foundAcronym = false;
            var words = matched.split(" ");
            
            ensureBlacklistIsBuilt(message, controller);
            
            for (j = 0; j < words.length; j++) {
                var currentWord = words[j].toLowerCase();
                
                if (_.indexOf(acronymBlackList, currentWord) == -1){
                    for (i = 0; i < acronyms.length; i++) {
                        var text = acronyms[i].text.toLowerCase();
                        if (text == currentWord) {
                            bot.reply(message, 'https://en.wikipedia.org' + acronyms[i].href);            
                            foundAcronym = true;
                            break;                 
                        }
                    }            
                }
            }              
        }
    };

    var publicApi = {
        ensureAcronymsBuilt: ensureAcronymsBuilt,
        ensureBlacklistIsBuilt: ensureBlacklistIsBuilt,
        addToBlacklist: addToBlacklist,        
        findAcronyms: findAcronyms        
    };
    return publicApi;
};