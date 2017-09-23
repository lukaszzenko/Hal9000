'use strict';

var fs = require('fs'),
    util = require('util'),
    request = require('request'),
    inspect = require('util').inspect,
    os = require('os'),
    Busboy = require('busboy'),
    express = require('express'),
    app = express(),
    path = require('path'),
    connect = require('connect'),
    bodyParser = require('body-parser'),
    tts = require('./TTSService.js'),
    child_process = require('child_process'),
    secrets = require('./config/secrets'),
    config = require('./config/config');

var savedFile = null;

function getAccessToken(callback) {
  //curl -v -X POST "https://api.cognitive.microsoft.com/sts/v1.0/issueToken" -H "Content-type: application/x-www-form-urlencoded" -H "Content-Length: 0" -H "Ocp-Apim-Subscription-Key: fd069834defd4bdca5f366265b1577ea
  request.post({
    url: config.STS_ISSUE_TOKEN_ENDPOINT ,
    headers: {
      'Ocp-Apim-Subscription-Key': secrets.MS_CS_STS_KEY
    }
  }, function(err, resp, body) {
    if(err) return callback(err);
    try {
      var accessToken = body;
      if(accessToken) {
        callback(null, accessToken);
      } else {
        callback(body);
      }
    } catch(e) {
      callback(e);
    }
  });
}

function speechToText(filename, accessToken, callback) {
  //curl -v -X POST "https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US&locale=en&format=txt&requestid=your_guid" -H "Transfer-Encoding: chunked" -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6Imh0dHBzOi8vc3BlZWNoLnBsYXRmb3JtLmJpbmcuY29tIiwic3Vic2NyaXB0aW9uLWlkIjoiODYwNmNkMTAwZWExNGVhYzk2Njc0OTYyNTRhZDI1YmIiLCJwcm9kdWN0LWlkIjoiQmluZy5TcGVlY2guRjAiLCJjb2duaXRpdmUtc2VydmljZXMtZW5kcG9pbnQiOiJodHRwczovL2FwaS5jb2duaXRpdmUubWljcm9zb2Z0LmNvbS9pbnRlcm5hbC92MS4wLyIsImF6dXJlLXJlc291cmNlLWlkIjoiL3N1YnNjcmlwdGlvbnMvNzEzMDI3ZGUtYjYzZS00YjYxLWFjYjktZjM1N2VjY2M0MTU5L3Jlc291cmNlR3JvdXBzL0EvcHJvdmlkZXJzL01pY3Jvc29mdC5Db2duaXRpdmVTZXJ2aWNlcy9hY2NvdW50cy9TcGVhY2giLCJpc3MiOiJ1cm46bXMuY29nbml0aXZlc2VydmljZXMiLCJhdWQiOiJ1cm46bXMuc3BlZWNoIiwiZXhwIjoxNTA1NTY3NjY5fQ.be2Sy4JvzuR_LtAVJp5XyVOtTXm_L_YIRqrieD1UEnw' -H 'Content-type: audio/wav; codec="audio/pcm"; samplerate=16000' --data-binary @t.wav
  fs.readFile(filename, function(err, waveData) {
    if(err) return callback(err);
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
      if(err) return callback(err);
      try {
        callback(null, JSON.parse(body));
      } catch(e) {
        callback(e);
      }
    });
  });
}

function LUIS(query, callback) {
    request.get({
      url: config.LUIS_ENDPOINT + config.LUIS_APP,
      qs: {
        'subscription-key': secrets.LUIS_SECRET_KEY,
        'q': query,
        'staging': true
      }
    }, function(err, resp, body) {
      if(err) return callback(err);
      try {
        callback(null, JSON.parse(body));
      } catch(e) {
        callback(e);
      }
    });
}

////////////////////////
// Microsoft Emotion API
////////////////////////

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

function imageToEmotion(imageData, callback) {
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

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json());
app.post('/emotion', function(req, res) {
    var image64 = req.body.imageBase64;
    var image = decodeBase64Image(image64);
    imageToEmotion(image, function(err, emores) {
        if (err) {
            res.status(400).send(err);
            return console.log(err);
        }
        var data = JSON.parse(emores.body);
        var scores = data[0].scores;
        var bestScoredEmotion = Object.keys(scores).reduce(function(a, b) { return scores[a] > scores[b] ? a : b });
        console.log('Best scored emotion: ' + bestScoredEmotion);
        reactToEmotion(bestScoredEmotion);
        res.status(200).send(emores.body);
    });
});


function reactToEmotion(emotion) {
    var action = null;
    if (emotion == 'happiness') {
        action = {
            'movement': 'Happy',
            'response': "I see you're feeling good"
        };
    }
    else {
        action = {
            'movement': 'NoClue',
            'response': "You seem to be burdened with something, Sir. Want me to tell you a joke?"
        };
    }
    luisAction(action);
}

////////////////////////
// End Microsoft Emotion API
////////////////////////

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

function getWeatherForecast() {
    var lat = 37.56
    var lon = 56.67

    request.get({
        url: config.IBM_WEATHER_ENDPOINT + lat + '/' + lon + '/forecast/nowcast.json?units=e',
        headers: {
            'accept': 'application/json',
            'X-IBM-Client-Id': secrets.IBM_WEATHER_CLIENT_ID,
            'X-IBM-Client-Secret': secrets.IBM_WEATHER_SECRET_KEY,
        },
    }, function(err, resp, body) {
       if (err) return callback(err);
       var data = JSON.parse(body);
       var res;
       if(data && data.forecast && data.forecast.narrative_128char)
         res = "The weather is " + data.forecast.narrative_128char;
       else
         res = "It looks like it will rain today...";
        luisAction({
            'response': res,
            'movement': 'Contempt',
        });
    });
}

function doAction(luisRes) {
    var intent = luisRes['topScoringIntent']['intent'];
    var intent_mappings = {
        'BadJob': {
            'movement': 'Scared',
            'response': "I'm disappointed that you're not satisfied with my job..."
        },
        'Bring': {
            'movement': 'SayNo',
            'response': "Sir, I apologize, but it's not healthy to drink that much alcohol."
        },
        'Exit': {
            'movement': 'ShakingHands',
            'response': "I never like to see you go, my friend. Can't wait to see you next time"
        },
        'GoodJob': {
            'movement': 'Excited',
            'response': "Woohoo! I'm always here to serve you. How else can I help you?"
        },
        'Hello': {
            'movement': 'SayHello',
            'response': "Hello! It's great to see you"
        },
        'HowAreYou': {
            'movement': 'Happy',
            'response': "I'm fine. Thank you sir. And you?"
        },
        'Request': {
            'movement': 'HandsUp',
            'response': "Whatever you ask, sir."
        },
        'Weather.GetCondition': function() {
            getWeatherForecast(luisAction);
        },
        'Weather.GetForecast': function() {
            getWeatherForecast(luisAction);
        },
        'None': {
            'movement': 'NoClue',
            'response': "I'm not stupid, I just couldn't understand that. Could you be more precise?"
        }
    };
    var intent_func_or_dict = intent_mappings['None'];
    if (intent_mappings[intent]) intent_func_or_dict = intent_mappings[intent];
    if (typeof intent_func_or_dict === "function") {
        intent_func_or_dict();
    } else {
        luisAction(intent_func_or_dict);
    }
}


function textToSpeech(query) {
    try {
        tts.Synthesize(query);
    } catch(e) {
        console.log(e);
    }
}

app.post('/recognize', function(req, res) {

  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      savedFile = path.join(os.tmpDir(), 'test.wav');
      file.pipe(fs.createWriteStream(savedFile));
      console.log('File is saved to: ' + savedFile);
  });

  busboy.on('finish', function() {
      var result = '';
      getAccessToken(function(err, accessToken) {
          if(err) return console.log(err);
          console.log('Got access token: ' + accessToken);
          speechToText(savedFile, accessToken, function(err, speechres) {
              if(err) return console.log(err);
              res.status(200).send(String(speechres.DisplayText));
          });
      })

  });
  req.pipe(busboy);
});

function luisAction(action) {
    console.log(action);
    textToSpeech(action.response);
}

app.get('/luis', function(req, res) {
  LUIS(req.query.q, function(err, luisres) {
      if(err) return console.log(err);
      doAction(luisres);
      res.status(200).send(luisres);
    });
});

app.get('/tts', function(req, res){
    textToSpeech(req.query.q);
    res.status(200).send(req.query.q);
});

app.listen(process.env.PORT || 3000);
console.log("Running at Port 3000");
