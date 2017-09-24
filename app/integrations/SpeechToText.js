var fs = require('fs'),
    request = require('request'),
    STSAccessToken = require('./STSAccessToken'),
    secrets = require('../config/secrets'),
    config = require('../config/config');

function speechToText (filename, accessToken, successCallback, errorCallback) {
    //curl -v -X POST "https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US&locale=en&format=txt&requestid=your_guid" -H "Transfer-Encoding: chunked" -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6Imh0dHBzOi8vc3BlZWNoLnBsYXRmb3JtLmJpbmcuY29tIiwic3Vic2NyaXB0aW9uLWlkIjoiODYwNmNkMTAwZWExNGVhYzk2Njc0OTYyNTRhZDI1YmIiLCJwcm9kdWN0LWlkIjoiQmluZy5TcGVlY2guRjAiLCJjb2duaXRpdmUtc2VydmljZXMtZW5kcG9pbnQiOiJodHRwczovL2FwaS5jb2duaXRpdmUubWljcm9zb2Z0LmNvbS9pbnRlcm5hbC92MS4wLyIsImF6dXJlLXJlc291cmNlLWlkIjoiL3N1YnNjcmlwdGlvbnMvNzEzMDI3ZGUtYjYzZS00YjYxLWFjYjktZjM1N2VjY2M0MTU5L3Jlc291cmNlR3JvdXBzL0EvcHJvdmlkZXJzL01pY3Jvc29mdC5Db2duaXRpdmVTZXJ2aWNlcy9hY2NvdW50cy9TcGVhY2giLCJpc3MiOiJ1cm46bXMuY29nbml0aXZlc2VydmljZXMiLCJhdWQiOiJ1cm46bXMuc3BlZWNoIiwiZXhwIjoxNTA1NTY3NjY5fQ.be2Sy4JvzuR_LtAVJp5XyVOtTXm_L_YIRqrieD1UEnw' -H 'Content-type: audio/wav; codec="audio/pcm"; samplerate=16000' --data-binary @t.wav
    fs.readFile(filename, function(err, waveData) {
        if(err) return errorCallback(err);
        request.post({
            url: config.SPEECH_RECOGNITION_ENDPOINT,
            qs: {
                'language': 'en-US',
                'locale': 'en-US',
                'format': 'json',
                'requestid': secrets.MS_CS_SUBSCRIPTION_KEY
            },
            body: waveData,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'audio/wav; samplerate=16000',
                'Content-Length' : waveData.length
            }
        }, function(err, resp, body) {
            if(err) return errorCallback(err);
            try {
                successCallback(JSON.parse(body));
            } catch(e) {
                errorCallback(e);
            }
        });
    });
}

exports.Recognize = function (file, callback) {
    STSAccessToken.obtain(function (accessToken) {
        console.log('Got access token: ' + accessToken);
        speechToText(file, accessToken, callback, function (err) {
            return console.log(err);
        });
    }, function (err) {
        return console.log(err);
    });
}
