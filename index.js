var Botkit = require('botkit')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

var kv = require('beepboop-persist')()
/*kv.set('a key', 'the key, is water', function (err) {
  // handle error :)
  kv.get('a key', function (err, val) {
    // handle error :)
    // val should be 'the key, is water'
    console.log(val)

    kv.list(function (err, keys) {
        console.log(keys)
      // handle error :)
      // keys should be ['a key']
      kv.del('a key', function (err) {
        // handle error :)
        // 'a key' should be deleted
      })
    })
  })
})*/

controller.hears(['all'], ['direct_mention'], function (bot, message) {
  kv.list(function (err, keys) {
    if (keys.length) {
      kv.mget(keys, function (err, values) {
        for (key in keys) {
          bot.reply(message, '`' + keys[key] + '`: `' + values[key] + '`')
        }
      })
    }
  })
})

controller.hears(['^(.+?)=(.+?)$'], ['direct_mention'], function (bot, message) {
  kv.get(message.match[1], function (err, val) {
    if (val) {
      bot.reply(message, '`' + message.match[1] + '` already saved as `' + val + '`')
    } else {
      kv.set(message.match[1], message.match[2], function (err) {
        bot.reply(message, '`' + message.match[1] + '` successfully saved as `' + message.match[2] + '`')
      })
    }
  })
})

controller.hears(['^.+$'], ['direct_mention'], function (bot, message) {
  kv.get(message.text, function (err, val) {
    if (val) {
      bot.reply(message, 'Definition for `' + message.text + '` is `' + val + '`')
    } else {
      bot.reply(message, 'Definition for `' + message.text + '` is not defined yet. Define it as: `<@' + bot.identity.id + '> ' + message.text + '=Definition text`')
    }
  })
})

/*controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})*/

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
