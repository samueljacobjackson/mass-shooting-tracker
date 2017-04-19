var csvjson = require('csvjson');
var fs = require('fs');
var Promise = require('bluebird');

var format = function(data) {
    return new Promise(function(resolve, reject){
        var options = {
            delimiter : ',', 
            quote     : '"'
        };
        return resolve(csvjson.toObject(data, options));
    });
}

var getOptions = function(slots, since){
    var options = {};

    if(slots.state.value){
        var states = require('./states.json');
        options.state = states[slots.state.value.toLowerCase()];
        options.fullState = slots.state.value;
    }
    if(slots.city.value){options.city = slots.city.value;}
    
    if(!slots.date.value){slots.date.value = new Date().getFullYear().toString();}
    options.dateString = slots.date.value;
    options.dateParts = slots.date.value.split('-').length
    
    options.startDate = new Date(Date.parse(slots.date.value));
    if (since){
        options.endDate = new Date();
        if(options.dateParts === 1){
            options.dateString += '-01-01';
            options.dateParts = 3;
        }
        else if (options.dateParts === 2){
            options.dateString += '-01';
            options.dateParts = 3;
        }
    }
    else {
        if(options.dateParts === 1){
            options.endDate = new Date(options.startDate.getFullYear(), 11, 31, 23, 59, 59);
        }
        if(options.dateParts === 2){
           options. endDate = new Date(options.startDate.getFullYear(), options.startDate.getMonth() + 1, 0, 23, 59, 59)
        }
        if(options.dateParts === 3){
            options.endDate = new Date(options.startDate.getFullYear(), options.startDate.getMonth(), options.startDate.getDate(), 23, 59, 59);
        }
    }
    
    options.hasBucket = false;
    options.bucket = "day";
    if(slots.bucket){
        options.hasBucket = true;
        if(slots.bucket.value){options.bucket = slots.bucket.value;}
    }

    if(!slots.category.value) {slots.category.value = 'shot';}
    options.category = slots.category.value;
    
    options.since = since;
    if(options.startDate > options.endDate){options.endDate = options.startDate;}
    return options;
}

var doEndDate = function(date, dateParts){
    return endDate;
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
            response.tell('<speak>I\'m sorry, I do not have data on future shootings</speak>');
            return true;
        }
    }
    return false;
}

module.exports.limitDate = limitDate;
module.exports.format = format;
module.exports.getOptions = getOptions;