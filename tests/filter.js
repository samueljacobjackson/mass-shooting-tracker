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
    //data += fs.readFileSync('test2016.csv', 'utf-8');
    data = data.replace(/,(?!(?:[^"]*"[^"]*")*[^"]*$)/mg,"").replace(/['"]+/g, "");
    return csvjson.toObject(data, options);
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

var options = {};
options.city = 'chicago';
options.startDate = new Date(2016, 10, 3);
options.endDate = new Date(2016, 10, 3, 23, 59, 59);
var data = format();
fs.writeFileSync("test.json", JSON.stringify(filter(data, options)));