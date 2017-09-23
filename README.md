# Hal9000

## Table of content

1. About
2. Installation
3. Ideas / TODOs


## 1. About

### Intro

Have you ever wanted a human emotion AI assistant? This is possible now!

Right now all market assistants are soulless beings, they have voice, no more no less.
People have no physical connection with them. Today Assistant can or even should be your friend.
Real friend needs a physical representation, for example as robots have....

We introduce you the real Hal9000! The robot assistant with voice, strong hands and emotions. He cares about your life,
answers all questions and express his state.

### Background

Hal9000 was a project started on HackZurich 2017 in a team of:

1. Łukasz Jocz
2. Paweł Kamiński
3. Michał Piotr Stankiewicz
4. Michał Stefańczyk


It will be continued here as a project of AI home assistant set up on raspberry pi and managing shoping lists,
home duties etc.


## 2. Installation

First of all you should create virtualenv with python2.7.

```sh
virtualenv --no-site-packages --distribute -p python /path/to/your/env
```
Than, using virtualenv, install package

. /path/to/your/env/bin/activate
install requirements

```sh
pip install -r requirements.txt
```

Then run flask robot.py app, it enables communication with robot. You may need robot simulator.

Then you have to install node (at least 6) and install dependencies:
```sh
npm install 
```

Microphone part may require following libraries:
```sh
sudo apt-get install alsa-base alsa-utils
sudo apt-get install libasound2-dev
```

Then start node server:
```sh
node app/app.js
```


## 3. Ideas / TODOs

[ ] Search for information in Bing
[ ] Look up the weather for other days than today
[ ] Add items to shopping list / to-do list
[ ] Live face detection
[ ] Reminders
[ ] Manage calendar
[ ] Manage home theather and TV
[ ] Home automation (coffe maker, shades)
[ ] Communication (call number, send message)
[ ] Call a taxi
