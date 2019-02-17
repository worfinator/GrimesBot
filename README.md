# grimesbot

GrimesBot is a slackbot based upon the Travis-ci NorrisBot. It's a no nonsense task orientated Zombie killing 357 magnum wheeling kick ass survivour.

![Rick Grimes face](icon.jpg)

GrimesBot is loaded with Rick Grimes sage like quotes which are emparted every time that someone says “Rick Grimes” in the chatroom.

## Installation

As simple as installing any other global node package. Be sure to have npm and node (`>= 0.10` version, or io.js `>= 1.0`) installed and launch:

```bash
$ npm install -g grimesbot
```


## Running the GrimesBot

To run the GrimesBot you must have an [API token](#getting-the-api-token-for-your-slack-channel) to authenticate the bot on your slack channel. Once you get it (instructions on the next paragraph) you just have to run:


```bash
BOT_API_KEY=somesecretkey grimesbot
```


## Getting the API token for your Slack channel

To allow the GrimesBot to connect your Slack channel you must provide him an API key. To retrieve it you need to add a new Bot in your Slack organization by visiting the following url: https://*yourorganization*.slack.com/services/new/bot, where *yourorganization* must be substituted with the name of your organization (e.g. https://*loige*.slack.com/services/new/bot). Ensure you are logged to your Slack organization in your browser and you have the admin rights to add a new bot.

You will find your API key under the field API Token, copy it in a safe place and get ready to use it.


## Configuration

The GrimesBot is configurable through environment variables. There are several variable available:

| Environment variable | Description |
|----------------------|-------------|
| `BOT_API_KEY` | this variable is mandatory and must be used to specify the API token needed by the bot to connect to your Slack organization |
| `BOT_DB_PATH` | optional variable that allows you to use a different database or to move the default one to a different path |
| `BOT_NAME` | the name of your bot, it’s optional and it will default to norrisbot |



## Launching the bot from source

If you downloaded the source code of the bot you can run it using NPM with:

```bash
$ npm start
```

Don't forget to set your `BOT_API_KEY` environment variable bedore doing so. Alternatively you can also create a file called `token.js` in the root folder and put your token there (you can use the `token.js.example` file as a reference).

## License

Licensed under [MIT License](LICENSE). © Luciano Mammino.
