var request = require('request'),
    secrets = require('../config/secrets'),
    config = require('../config/config');

exports.recognizeIntent = function (query, successCallback, errorCallback) {
    request.get({
        url: config.LUIS_ENDPOINT + config.LUIS_APP,
        qs: {
            'subscription-key': secrets.LUIS_SECRET_KEY,
            'q': query,
            'staging': config.LUIS_STAGING
        }
    }, function(err, resp, body) {
        if(err) return errorCallback(err);
        try {
            successCallback(JSON.parse(body));
        } catch(e) {
            errorCallback(e);
        }
    });
}
