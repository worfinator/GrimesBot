'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "Grimesbot")
 *      dbPath : the path to access the database (will default to "data/Grimesbot.db")
 *
 * @param {object} settings
 * @constructor
 *
 * @author Luciano Mammino <lucianomammino@gmail.com>
 */
var GrimesBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'Grimesbot';
    this.dbPath = settings.dbPath || path.resolve(__dirname, '..', 'data', 'grimesbot.db');

    this.user = null;
    this.db = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(GrimesBot, Bot);

/**
 * Run the bot
 * @public
 */
GrimesBot.prototype.run = function () {
    GrimesBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
GrimesBot.prototype._onStart = function () {
    this._loadBotUser();
    this._connectDb();
    this._firstRunCheck();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
GrimesBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromGrimesBot(message) &&
        this._isMentioningRickGrimes(message)
    ) {
        this._replyWithRandomQuote(message);
    }
};

/**
 * Replyes to a message with a random Joke
 * @param {object} originalMessage
 * @private
 */
GrimesBot.prototype._replyWithRandomJoke = function (originalMessage) {
    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    });
};

/**
 * Replyes to a message with a random Quote
 * @param {object} originalMessage
 * @private
 */
GrimesBot.prototype._replyWithRandomQuote = function (originalMessage) {
    var self = this;
    self.db.get('SELECT id, quote FROM quotes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.quote, {as_user: true});
        self.db.run('UPDATE quotes SET used = used + 1 WHERE id = ?', record.id);
    });
};

/**
 * Loads the user object representing the bot
 * @private
 */
GrimesBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

/**
 * Open connection to the db
 * @private
 */
GrimesBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

/**
 * Check if the first time the bot is run. It's used to send a welcome message into the channel
 * @private
 */
GrimesBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
        }

        // updates with new last running time
        self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
    });
};

/**
 * Sends a welcome message in the channel
 * @private
 */
GrimesBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'We’re all infected' +
        '\n Just say `Rick Grimes` or `' + this.name + '` and see if "Shit happens"',
        {as_user: true});
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GrimesBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GrimesBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C'
        ;
};

/**
 * Util function to check if a given real time message is mentioning Chuck Norris or the Grimesbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GrimesBot.prototype._isMentioningRickGrimes = function (message) {
    return message.text.toLowerCase().indexOf('rick grimes') > -1 ||
        message.text.toLowerCase().indexOf('rg') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

/**
 * Util function to check if a given real time message has ben sent by the Grimesbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
GrimesBot.prototype._isFromGrimesBot = function (message) {
    return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
GrimesBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

GrimesBot.prototype._getChannelByName = function (channelName) {
    return this.channels.filter(function (item) {
        return item.name === channelName;
    })[0];
};

GrimesBot.prototype._randomMessage = function () {
    var self = this;
    if (self.channels.length){
        self.db.get('SELECT id, quote FROM quotes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
            if (err) {
                return console.error('DATABASE ERROR:', err);
            }

            self.postMessageToChannel(self.channels[0].name, record.quote, {as_user: true});
            self.db.run('UPDATE quotes SET used = used + 1 WHERE id = ?', record.id);
        });
    }
};

GrimesBot.prototype._listChannels = function (showAll) {
    if (showAll){
        return this.channels;
    } else {
        return this.channels.filter(function (item){
            return item.is_member === true;
        });    
    }    
};

GrimesBot.prototype._sayToChannel = function (channelName, message) {
    this.postMessageToChannel(channelName, message, {as_user: true});
};

GrimesBot.prototype._isChannelMember = function (channelName) {
    var channel = this._getChannelByName(channelName);

    if (!channel) return false;

    if (channel.is_member) {
        return true;
    } else {
        return false
    }
};

GrimesBot.prototype._displayGiphy = function (channelName) {
    var self = this;
    self.db.get('SELECT id, link FROM giphys ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        self.postMessageToChannel(channelName, record.link, {as_user: true});
        self.db.run('UPDATE giphys SET used = used + 1 WHERE id = ?', record.id);
    });
};

module.exports = GrimesBot;
