var AlexaSkill = require('./lib/AlexaSkill');
var tracker = require('./lib/tracker');
var data = require('./lib/data');
require('dotenv').config();

var AsciiCode = function () {
    AlexaSkill.call(this, process.env.APP_ID);
};

AsciiCode.prototype = Object.create(AlexaSkill.prototype);
AsciiCode.prototype.constructor = AsciiCode;

AsciiCode.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AsciiCode onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

AsciiCode.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("AsciiCode onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = '<speak>What would you like to know about mass shootings in america?</speak>';
    var repromptText = '<speak>You inquire by date and or by city and state</speak>';
    response.ask(speechOutput, repromptText);
};

AsciiCode.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AsciiCode onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

AsciiCode.prototype.intentHandlers = {
    "SumDuringIntent": function (intent, session, response) {
        if (limitDate(intent.slots, response, false)){return;}
        var options = data.getOptions(intent.slots, false);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, false);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "SumSinceIntent": function (intent, session, response) {
        if (limitDate(intent.slots, response, true)){return;}
        var options = data.getOptions(intent.slots, true);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, false);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "CountDuringIntent": function (intent, session, response) {
        if (limitDate(intent.slots, response, false)){return;}
        var options = data.getOptions(intent.slots, false);
        tracker.query(options)
        .then(function(result){            
            var speak = getSpeech(result, options, true);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    "CountSinceIntent": function (intent, session, response) {
        if (limitDate(intent.slots, response, true)){return;}
        var options = data.getOptions(intent.slots, true);
        tracker.query(options)
        .then(function(result){
            var speak = getSpeech(result, options, true);
            response.tellWithCard(speak[0], "Mass Shootings", speak[1]);
        }).done();
    },
    'AMAZON.HelpIntent' : function (intent, session, response) {
        speechOutput = '<speak>You may ask me how many mass shootings there have been in america. Find out more at w w w dot mass shooting tracker dot com, or join the conversation on reddit in r guns are cool.</speak>';
        repromptText = '<speak>You may ask me how many mass shootings there have been in america. Find out more at w w w dot mass shooting tracker dot com, or join the conversation on reddit in r guns are cool.</speak>';
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
    if(!options.since){
        by = options.dateParts === 3 ? 'on' : 'in';
    }
    if(countOnly){
        speak += 'There ' + (result[1] === 1 ? 'was ' : 'were ');
        speak += '<say-as interpret-as="cardinal">' + result[1] + '</say-as> mass shooting' + (result[1] === 1 ? ' ' : 's ');
        speak += by + ' <say-as interpret-as="date" format="ymd">' + options.dateString + '</say-as>';
    }
    else {
        speak += '<say-as interpret-as="cardinal">' + result[0] + '</say-as>' + (result[0] === 1 ? ' person was ' : ' people were ') + options.category + (options.category == 'wounded' ?  ' but not killed ' : ' ');
        speak += by + ' <say-as interpret-as="date" format="ymd">' + options.dateString + '</say-as>'; 
        speak += ' in <say-as interpret-as="cardinal">' + result[1] + '</say-as> mass shooting' + (result[1] === 1 ? '' : 's');
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

var limitDate = function(slots, response, since){
    if(slots.date.value){
        var date = new Date(Date.parse(slots.date.value));
        var dateParts = slots.date.value.split('-').length;

        if(date < new Date(2013, 0, 1)){
            response.tell('<speak>I\'m sorry, I do not have data prior to <say-as interpret-as="date" format="ymd">2013-01-01</say-as></speak>')
            return true;
        }
        if(date > new Date()){
            response.tell('<speak>I\'m sorry, I do not have data on future shootings</speak>')
            return true;
        }
    }
    return false;
}

exports.handler = function (event, context) {
    var asciiCode = new AsciiCode();
    asciiCode.execute(event, context);
};