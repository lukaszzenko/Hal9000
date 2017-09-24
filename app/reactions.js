const WeatherIBM = require('./integrations/WeatherIBM');

exports.reactToEmotion = function (emotion, callback) {
    var action = null;
    if (emotion == 'happiness') {
        action = {
            'movement': 'Happy',
            'response': "I see you're feeling good"
        };
    }
    else if (emotion == null) {
        action = {
            'movement': 'NoClue',
            'response': "I can't see your face. Are you here? I would like to see you sir..."
        };
    }
    else {
        action = {
            'movement': 'NoClue',
            'response': "You seem to be burdened with something, Sir. Want me to tell you a joke?"
        };
    }
    callback(action);
}

exports.reactToWeather = function (data, callback) {
    var res;
    if(data && data.forecast && data.forecast.narrative_128char) {
        res = "The weather is " + data.forecast.narrative_128char;
    }
    else {
        res = "It looks like it will rain today...";
    }
    callback({
        'response': res,
        'movement': 'Contempt',
    });
}

exports.reactToIntent = function (luisRes, callback) {
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
            WeatherIBM.getForecast(52.22967560, 21.01222870, function (data) {
                exports.reactToWeather(data, callback);
            }, function (err) {
                console.log(err)
            });
        },
        'Weather.GetForecast': function() {
            WeatherIBM.getForecast(52.22967560, 21.01222870, function (data) {
                exports.reactToWeather(data, callback);
            }, function (err) {
                console.log(err)
            });
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
        callback(intent_func_or_dict);
    }
}
