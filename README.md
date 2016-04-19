# Acrobot 

## A Slack Bot that provides meanings for acronyms.

Acrobot listens to your conversations on Slack. If it encounters an IT-related acronym, Acrobot will provide a link to the meaning of that acronym from Wikipedia.

You can also ask Acrobot to ignore an acronym from now on by using the ignore command.

e.g. @acrobot ignore xmpp

---

## Installation

Grab this repository

```bash
git clone git@github.com:zdam/acrobot.git
```

Install node dependencies

```bash
npm install
```
---

## Getting started 

After you've installed Acrobot, the first thing you'll need to do is register your bot with Slack, and get a few configuration options set. This will allow your bot to connect, send and receive messages.

* Log into Slack, go to this url: https://MY-COMPANY-HERE.slack.com/apps/build/custom-integration
* Choose Bots
* Choose a Username for your bot (e.g. acrobot) then click Add bot Integration
* Take a copy of the API Token
* Click Save Integration

The API Token needs to be passed to node as the environment variable: slack_token

---

## Simple debugging Setup

VSCode is a free cross-platform editor that has excellent NodeJS debugging in just a couple of clicks.

This repository has a .vscode folder with an example-launch.json file ready to go.

* Rename example-launch.json to launch.json
* Fill out the SLACK_TOKEN environment variable and save launch.json
* Click the Debug Icon in VSCode and then press F5 to begin debugging your bot.

---

## Optional: Configure and use Firebase for persistant acronym blacklist storage

Out of the box Acrobot will use local file storage to store the acronym blacklist.  This will work if you host the running Node process locally, but if you deploy to a cloud NodeJS provider this generally will not work. In this case you can use Firebase for storage.

* Get a free Firebase account
* Create an application
* Note the custom auth secret

The firebase application url and auth secret needs to be passed to node as the variables: firebase_url and firebase_token

* you can set these in your launch.json file when debugging 

 