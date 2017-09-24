var config = {}

config.STS_ISSUE_TOKEN_ENDPOINT = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
config.SPEECH_RECOGNITION_ENDPOINT = 'https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1';

config.SYNTHESIZE_ENDPOINT = 'https://speech.platform.bing.com/synthesize';

config.LUIS_ENDPOINT = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/';
config.LUIS_APP = '95199096-4dc9-4b8c-86c7-a0c64fd849bc';
config.LUIS_APP_HACKZURICH = '4c093489-e725-48c6-b675-aa6281bc4cf9';
config.LUIS_STAGING = true;

config.EMOTION_ENDPOINT = "https://westus.api.cognitive.microsoft.com/emotion/v1.0";

config.IBM_WEATHER_ENDPOINT = 'https://api.us.apiconnect.ibmcloud.com/infomichaelwellnerde-dev/hackzurich/v1/geocode/';

module.exports = config;
