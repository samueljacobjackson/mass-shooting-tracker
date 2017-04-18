var google = require('googleapis');
var fs = require ('fs');
var key = require('../key.json');

var getFile = function(year){
    var auth = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ['https://www.googleapis.com/auth/drive.readonly'],
        null
    );

    var drive = google.drive({
        version: 'v3',
        auth: auth
    });

    var years = require('../years.json');

    var fileId = years[year];
    var respData = '';
    drive.files.get({
        fileId: fileId
    }, function (err, metadata) {
        if (err) {
            console.log(err);
        }
        console.log('Downloading %s...', fileId + '.csv');
        var dest = fs.createWriteStream(fileId + '.csv');
        drive.files.export({
            fileId: fileId,
            mimeType: 'text/csv'
        })
        .on('data', function(chunk){
            respData += chunk;
        })
        .on('end', function(){
            console.log(respData);
        })
        .on('error', function (err) {
            console.log(err);
        })
    });
}

getFile('2016');