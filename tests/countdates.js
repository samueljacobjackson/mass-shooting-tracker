var csvjson = require('csvjson');
var fs = require('fs');
var _ = require('lodash');

var format = function() {
    var options = {
        delimiter : ',', // optional 
        quote     : '"' // optional 
    }
    var data = ''
    data += fs.readFileSync('test2016.csv', 'utf-8');
    data += fs.readFileSync('test2015.csv', 'utf-8');
    data = data.replace(/,(?!(?:[^"]*"[^"]*")*[^"]*$)/mg,"").replace(/['"]+/g, "");
    return csvjson.toObject(data, options);
}

var average = function(data){
    var c = _.uniqBy(data, function(n){
        //return n.date.split('/')[0] + n.date.split('/')[2];
        return n.date;
    }).length;
    return c;
}

var data = format();
console.log(average(data));