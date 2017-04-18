var google = require('googleapis');
var fs = require ('fs');
var key = require('./key.json');
var Promise = require('bluebird');

var getFile = function(year){
    return new Promise(function(resolve, reject){
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

        var years = require('./fileIds.json');

        var fileId = years[year];
        var respData = '';
        drive.files.get({
            fileId: fileId
        }, function (err, metadata) {
            if (err) {
                return reject(err);
            }
            drive.files.export({
                fileId: fileId,
                mimeType: 'text/csv'
            })
            .on('data', function(chunk){
                respData += chunk;
            })
            .on('end', function(){
                return resolve(respData);
            })
            .on('error', function (err) {
                return reject(err);
            })
        });
    });
}

module.exports.getFile = getFile;