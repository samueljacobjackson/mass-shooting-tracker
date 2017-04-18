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
        options.endDate = doDate(options.startDate, options.dateParts, true);
    }
    
    if(!slots.category.value) {slots.category.value = 'shot';}
    options.category = slots.category.value;
    
    options.since = since;
    if(options.startDate > options.endDate){options.endDate = options.startDate;}
    return options;
}

var doDate = function(date, dateParts, end){
    var startDate = new Date();
    var endDate = new Date();
    if(dateParts === 1){
        endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
    }
    if(dateParts > 1){
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    }
    if(dateParts > 2){
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), 23, 59, 59);
    }
    if(end){return endDate;}
    return startDate;
}

module.exports.format = format;
module.exports.getOptions = getOptions;