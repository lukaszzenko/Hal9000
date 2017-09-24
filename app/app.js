'use strict';

var fs = require('fs'),
    os = require('os'),
    Busboy = require('busboy'),
    express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    SpeechToText = require('./integrations/SpeechToText.js'),
    TextToSpeech = require('./integrations/TextToSpeech.js'),
    Emotions = require('./integrations/Emotions.js'),
    LUIS = require('./integrations/LUIS.js'),
    WeatherIBM = require('./integrations/WeatherIBM.js'),
    secrets = require('./config/secrets'),
    config = require('./config/config'),
    reactions = require('./reactions');

var savedFile = null;


////////////////////////
// Microsoft Emotion API
////////////////////////

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json());
app.post('/emotion', function(req, res) {
    var image64 = req.body.imageBase64;

    Emotions.recognize(image64, function(err, emores) {
        if (err) {
            res.status(400).send(err);
            return console.log(err);
        }
        var bestScoredEmotion = Emotions.getBestScoringEmotion(emores.body);
        console.log('Best scored emotion: ' + bestScoredEmotion);
        reactions.reactToEmotion(bestScoredEmotion, luisAction);
        res.status(200).send(emores.body);
    });
});

////////////////////////
// End Microsoft Emotion API
////////////////////////

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});


app.post('/recognize', function(req, res) {
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      savedFile = path.join(os.tmpDir(), 'test.wav');
      file.pipe(fs.createWriteStream(savedFile));
      console.log('File is saved to: ' + savedFile);
  });

  busboy.on('finish', function() {
      var result = '';
      SpeechToText.Recognize(savedFile, function(speechres) {
          res.status(200).send(String(speechres.DisplayText));
      });
  });
  req.pipe(busboy);
});

function luisAction(action) {
    console.log(action);
    TextToSpeech.Synthesize(action.response);
}

app.get('/luis', function(req, res) {
    LUIS.recognizeIntent(req.query.q, function (luisres) {
        reactions.reactToIntent(luisres, luisAction);
        res.status(200).send(luisres);
    }, function (err) {
        return console.log(err);
    });
});

app.get('/tts', function(req, res){
    TextToSpeech.Synthesize(req.query.q);
    res.status(200).send(req.query.q);
});

app.listen(process.env.PORT || 3000);
console.log("Running at Port 3000");
