const express = require('express')
const TelegramBot = require('node-telegram-bot-api');
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const token = process.env.TG_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// bot.on('messa', (msg) => {
//   console.log("msg")
//   console.log(msg)
//     if (msg.reply_to_message) {
//         const originalPost = msg.reply_to_message;
//         if (msg.text.startsWith('Source:')) {
//             const source = msg.text;
//             const editedText = `${originalPost.caption}\n\n${source}`;
//             bot.editMessageCaption(editedText, {chat_id: originalPost.chat.id, message_id: originalPost.message_id});
//         }
//     }
// });

bot.on('message', async (msg) => {
  console.log("msg")
  console.log(msg)
  if (!msg.photo) return

  const fileId = msg.photo[0]?.file_id;
  const fileUrl = bot.getFileLink(fileId);

  const callToFuzzy = async (url) => {
    const response = await fetch('https://api-next.fuzzysearch.net/v1/url?url=' + encodeURIComponent(url), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.FUZZY_API_KEY,
      }
    });
    const res = await response.json();
    // fileId: source?.site_info?.file_id
    const sources = res.map((source) => source?.site_info?.sources?.[0]).filter((source) => source)
    console.log("response")
    console.log(sources)
  }

  await callToFuzzy(fileUrl)

  const originalPost = msg.reply_to_message;
  // if (originalPost.forward_from_chat && originalPost.forward_from_chat.id === parseInt(channelId)) {
  const source = msg.text;
  const editedText = `${originalPost.caption}\n\n${source}`;
  bot.editMessageCaption(editedText, {
    chat_id: channelId,
    message_id: originalPost.forward_from_message_id,
  });

});