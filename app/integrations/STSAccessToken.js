var request = require('request'),
    secrets = require('../config/secrets'),
    config = require('../config/config');



exports.obtain = function (successCallback, errorCallback) {
    //curl -v -X POST "https://api.cognitive.microsoft.com/sts/v1.0/issueToken" -H "Content-type: application/x-www-form-urlencoded" -H "Content-Length: 0" -H "Ocp-Apim-Subscription-Key: fd069834defd4bdca5f366265b1577ea
    request.post({
        url: config.STS_ISSUE_TOKEN_ENDPOINT ,
        headers: {
            'Ocp-Apim-Subscription-Key': secrets.MS_CS_STS_KEY
        }
    }, function(err, resp, body) {
        if(err) {
            return errorCallback(err);
        }
        try {
            var accessToken = body;
            if(accessToken) {
                successCallback(accessToken);
            } else {
                errorCallback(body);
            }
        } catch(e) {
            errorCallback(e);
        }
    });
}