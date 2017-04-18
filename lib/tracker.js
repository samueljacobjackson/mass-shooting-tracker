var _ = require('lodash');
var drive = require('./drive');
var data = require('./data');
var Promise = require('bluebird');
var fs = require('fs');

var query = function(options){
    return new Promise(function(resolve, reject){
        getData(options.startDate.getFullYear(), options.endDate.getFullYear())
        .then(function(result){
            return data.format(result);
        })
        .then(function(result){
            var count = 0;
            var sum = _.sumBy(result, function(n){
                if(options.state && options.state != n.state){   
                    return 0;
                }
                if(options.city && n.city.toLowerCase() != options.city.toLowerCase().replace(/\(.*\)/g,'').replace(/(^\s*)|(\s*$)/g,'')){
                    return 0;
                }
                var trackerDate = new Date(Date.parse(n.date));
                if(trackerDate < options.startDate || trackerDate > options.endDate){
                    return 0;
                }
                count++;
                switch(options.category) {
                    case 'wounded':
                        return parseInt(n.wounded);
                    case 'killed':
                        return parseInt(n.killed);
                    case 'shot':
                        return parseInt(n.killed) + parseInt(n.wounded);
                }
            });
            return resolve([sum, count]);
        });
    });
}

var getData = function(startYear, endYear) {
    return new Promise(function(resolve, reject) {
        if(startYear > endYear) {endYear = startYear;}
        var year = startYear - 1;
        var data = '';
        return promiseWhile(function () {return year < endYear;}, function(){
            year++;
            return drive.getFile(year.toString())
            .then(function(result){
                data += result.replace(/,(?!(?:[^"]*"[^"]*")*[^"]*$)/mg,"").replace(/['"]+/g, "");
            });
        })
        .then(function(){
            return resolve(data);
        });
    });
}

var promiseWhile = Promise.method(function(condition, action) {
    if (!condition()) {return;};
    return action().then(promiseWhile.bind(null, condition, action));
});

module.exports.query = query;
