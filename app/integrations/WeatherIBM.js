var request = require('request'),
    secrets = require('../config/secrets'),
    config = require('../config/config');

exports.getForecast = function(lat, lon, successCallback, errorCallback) {
    request.get({
        url: config.IBM_WEATHER_ENDPOINT + lat + '/' + lon + '/forecast/nowcast.json?units=e',
        headers: {
            'accept': 'application/json',
            'X-IBM-Client-Id': secrets.IBM_WEATHER_CLIENT_ID,
            'X-IBM-Client-Secret': secrets.IBM_WEATHER_SECRET_KEY,
        },
    }, function(err, resp, body) {
       if (err) return errorCallback(err);
       successCallback(JSON.parse(body));
    });
}
