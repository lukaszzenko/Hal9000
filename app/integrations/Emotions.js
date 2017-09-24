var request = require('request'),
    secrets = require('../config/secrets'),
    config = require('../config/config'),
    base64 = require('../helpers/base64');



exports.recognize = function (image64, callback) {
    var imageData = base64.decodeBase64Image(image64);
    var r = request.post(config.EMOTION_ENDPOINT + '/recognize', {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': secrets.MS_EMOTION_KEY_1
        },
        body: imageData.data
    }, function(err, resp, body) {
       if (err) return callback(err);
       callback(null, resp);
    });
}

exports.getBestScoringEmotion = function (body) {
    var data = JSON.parse(body);
    console.log(data);
    if (data.length == 0) {
        return null;
    }
    var scores = data[0].scores;
    return Object.keys(scores).reduce(function(a, b) { return scores[a] > scores[b] ? a : b });
}
