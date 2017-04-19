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
            var data = filter(result, options);
            
            var bucketCount = _.uniqBy(data, function(o){
                if(options.bucket === 'day'){
                    return o.date;
                    //return n.date.split('/')[0] + n.date.split('/')[2];
                }
                if(options.bucket === 'month'){
                    return o.date.split('/')[0] + o.date.split('/')[2];
                }
                if(options.bucket === 'year'){
                    return o.date.split('/')[2];
                }
            }).length;
            
            var sum = _.sumBy(data, function(n){
                switch(options.category) {
                    case 'wounded':
                        return parseInt(n.wounded);
                    case 'killed':
                        return parseInt(n.killed);
                    case 'shot':
                        return parseInt(n.killed) + parseInt(n.wounded);
                }
            });

            var count = data.length;
            var avgSum = Number((sum/bucketCount).toFixed(2));
            var avgCount = Number((count/bucketCount).toFixed(2));
            return resolve([sum, count, avgSum, avgCount]);
        });
    });
}

var filter = function(data, options){
    var data = _.filter(data, function(n){
        if(options.state && options.state != n.state){   
            return;
        }
        if(options.city && n.city.toLowerCase() != options.city.toLowerCase().replace(/\(.*\)/g,'').replace(/(^\s*)|(\s*$)/g,'')){
            return;
        }
        var trackerDate = new Date(Date.parse(n.date));
        if(trackerDate < options.startDate || trackerDate > options.endDate){
            return;
        }
        return n;
    })
    return data;
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
