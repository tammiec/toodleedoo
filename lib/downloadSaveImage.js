const fs = require('fs');
const request = require('request');

const downloadSaveImg = (uri, filename, callback) => {
  try {
    request.head(uri, (err, res, body) => {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  } catch(err) {
    console.err(err);
  }
};
module.exports = downloadSaveImg;
