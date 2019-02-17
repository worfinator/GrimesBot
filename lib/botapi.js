'use strict';

var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var slackbot = "";

var BotAPI = function Constructor(settings) {
	slackbot = settings.slackbot;
    this.settings = settings;
    this.settings.name = this.settings.name || 'Grimesbot';

    //console.log(this);
};

// parse application/json
app.use(bodyParser.json())

app.get("/", function (req, res){
	res.end("I'm Rick Grimes Bitch!");
})

app.get('/random', function (req, res){
	// Random message
	slackbot._randomMessage();

	res.end("Random Message");
})

app.post('/saytochannel', function (req, res){
	var body = req.body;
	var channelName = body.channel_name;
	var message = body.message;
	var giphy = body.giphy;

	if (!giphy) giphy = false;

	if (slackbot._isChannelMember(channelName)){
		if (giphy){
			slackbot._displayGiphy(channelName);
		}

		slackbot._sayToChannel(channelName, message);
		res.end("Message sent to " + channelName + " channel");
	} else {
		res.end("Not a member of " + channelName + " channel");
	}
})

app.get('/allchannels', function (req, res){
	// Random message
	var channels = slackbot._listChannels(true);

	res.send(channels);
})

app.get('/channels', function (req, res){
	// Random message
	var channels = slackbot._listChannels(false);

	res.send(channels);
})

app.post('/channel', function (req, res){
	// Get channel by name
	var body = req.body;
	var channelName = body.channel_name;
	var channel = slackbot._getChannelByName(channelName);

	res.send(channel);
})

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 80;
var server = app.listen(port, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log("Example app listening at http://%s:%s", host, port)
})

module.exports = BotAPI;