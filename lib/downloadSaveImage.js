const fs = require('fs');
const request = require('request');

const downloadSaveImg = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

module.exports = downloadSaveImg;
