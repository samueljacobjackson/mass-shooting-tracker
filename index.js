var AlexaSkill = require('./lib/AlexaSkill');
var tracker = require('./lib/tracker');
var data = require('./lib/data');
require('dotenv').config();

var MassShootingTracker = function () {
    AlexaSkill.call(this, process.env.APP_ID);
};

MassShootingTracker.prototype = Object.create(AlexaSkill.prototype);
MassShootingTracker.prototype.constructor = MassShootingTracker;

MassShootingTracker.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("MassShootingTracker onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

MassShootingTracker.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("MassShootingTracker onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = '<speak>What would you like to know about mass shootings in america? You may inquire how many people were shot, killed or wounded and filter by date, city and or state.</speak>';
    var repromptText = '<speak>You may inquire how many people were shot, killed or wounded and filter by date, city and or state.</speak>';
    response.ask(speechOutput, repromptText);
};

MassShootingTracker.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("MassShootingTracker onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

MassShootingTracker.prototype.intentHandlers = {
    "SumDuringIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, false)){return;}
        var options = data.getOptions(intent.slots, false);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, false);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "SumSinceIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, true)){return;}
        var options = data.getOptions(intent.slots, true);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, false);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "CountDuringIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, false)){return;}
        var options = data.getOptions(intent.slots, false);
        tracker.query(options)
        .then(function(result){            
            var speak = getSpeech(result, options, true);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "CountSinceIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, true)){return;}
        var options = data.getOptions(intent.slots, true);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, true);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "AvgSumDuringIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, false)){return;}
        var options = data.getOptions(intent.slots, false);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, false);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "AvgSumSinceIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, true)){return;}
        var options = data.getOptions(intent.slots, true);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, false);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "AvgCountDuringIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, false)){return;}
        var options = data.getOptions(intent.slots, false);
        tracker.query(options)
        .then(function(result){            
            var speak = getSpeech(result, options, true);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "AvgCountSinceIntent": function (intent, session, response) {
        if (data.limitDate(intent.slots, response, true)){return;}
        var options = data.getOptions(intent.slots, true);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, true);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    'AMAZON.HelpIntent' : function (intent, session, response) {
        speechOutput = '<speak>I can tell you how many mass shootings there have been in america and how many were shot, killed or wounded. I define a mass shooting as an incident of violence in which 4 or more people are shot. Find out more at w w w dot mass shooting tracker dot org, or join the conversation on reddit in r guns are cool.</speak>';
        repromptText = '<speak>I can tell you how many mass shootings there have been in america and how many were shot, killed or wounded. I define a mass shooting as an incident of violence in which 4 or more people are shot. Find out more at w w w dot mass shooting tracker dot org, or join the conversation on reddit in r guns are cool.</speak>';
        response.ask(speechOutput, repromptText);
    },
    'AMAZON.StopIntent' : function (intent, session, response) {
        response.tell('');
    },
    'AMAZON.CancelIntent' : function (intent, session, response) {
        response.tell('');
    }
}

var getSpeech = function(result, options, countOnly) {
    var speak = '';
    var by = 'since';
    var curr = false;
    var thisDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

console.log(result);

    if(options.dateParts === 1 && options.startDate.getFullYear() === thisDate.getFullYear()){
        curr = true;
    }
    if(options.dateParts === 2 && options.startDate.getFullYear() === thisDate.getFullYear() && options.startDate.getMonth() === thisDate.getMonth()){
        curr = true;
    }

    if(!options.since){
        by = options.dateParts === 3 ? 'on' : 'in';
    }
    if(countOnly){
        if(options.hasBucket){        
            speak += 'There was an average of <say-as interpret-as="cardinal">' + result[3] + '</say-as> mass shooting' + (result[3] === 1 ? ' per ' : 's per ') + options.bucket + ' ';
        }
        else {
            speak += 'There ' + (result[1] === 1 ? 'was ' : 'were ');
            speak += '<say-as interpret-as="cardinal">' + result[1] + '</say-as> mass shooting' + (result[1] === 1 ? ' ' : 's ');
        }
        speak += by + ' <say-as interpret-as="date" format="ymd">' + options.dateString + '</say-as>';
        if(curr && !options.since && result[1] > 0){speak += ' so far'}
    }
    else {
        if(options.hasBucket){
            speak += 'An average of <say-as interpret-as="cardinal">' + result[2] + '</say-as>' + (result[2] === 1 ? ' person was ' : ' people were ');
            speak += options.category + (options.category == 'wounded' ?  ' but not killed per ' : ' per ') + options.bucket + ' ';
        }
        else {
            speak += '<say-as interpret-as="cardinal">' + result[0] + '</say-as>' + (result[0] === 1 ? ' person was ' : ' people were ');
            speak += options.category + (options.category == 'wounded' ?  ' but not killed ' : ' ');
        }
        speak += by + ' <say-as interpret-as="date" format="ymd">' + options.dateString + '</say-as>'; 
        if(!options.hasBucket){
            speak += ' in <say-as interpret-as="cardinal">' + result[1] + '</say-as> mass shooting' + (result[1] === 1 ? '' : 's');
        }
        if(curr && !options.since && result[0] > 0){speak += ' so far'}
    }
    if(options.city){
        speak += ' in ' + options.city;
        if(options.fullState){
           speak += ', ' + options.fullState;
        }
    }
    else if(options.fullState){
        speak += ' in ' + options.fullState;
    }
    speak += '.';
    var card = speak.replace(/<say-as interpret-as="date" format="ymd">/g, '').replace(/<say-as interpret-as="cardinal">/g, '').replace(/<\/say-as>/g, '');
    speak = '<speak>' + speak + '</speak>';
    return [speak, card];
}

exports.handler = function (event, context) {
    var massShootingTracker = new MassShootingTracker();
    massShootingTracker.execute(event, context);
};