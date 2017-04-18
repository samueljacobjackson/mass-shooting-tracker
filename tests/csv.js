var csvjson = require('csvjson');
var fs = require('fs');

var format = function() {
    var options = {
        delimiter : ',', // optional 
        quote     : '"' // optional 
    }
    var data = ''
    data += fs.readFileSync('test2014.csv', 'utf-8');
    //data += fs.readFileSync('test2016.csv', 'utf-8');
    return csvjson.toObject(data, options);
}
fs.writeFileSync("test.json",JSON.stringify(format()));
