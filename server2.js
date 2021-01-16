require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const jsdom = require("jsdom");
const bot = new Discord.Client();
const { INTERVAL_TIME, TOKEN, DIRECT_BUY_LINK, Chanel_ID_DIRECT_BUY } = process.env;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  callAPI();
});

function callAPI() {
  setInterval(function () {
    axios.get(DIRECT_BUY_LINK)
      .then(response => {
        let data = response.data;
        if (!data) return;

        const dom = new jsdom.JSDOM(data);
        let buyListDom = dom.window.document.getElementsByClassName('direct-buy');
        let buyList = [];
        for (let i = 0; i < buyListDom.length; i++) {
          let shop_full_specs_link = buyListDom[i].getElementsByClassName('shop-full-specs-link');
          let shop_links = buyListDom[i].getElementsByClassName('shop-links');
          if (shop_full_specs_link && shop_full_specs_link.length > 0 && shop_links && shop_links.length > 0) {
            // Check button that add to cart
            if (shop_links[0].querySelector('button')) {
              let direct_buy_link = shop_full_specs_link[0].querySelector('a') && shop_full_specs_link[0].querySelector('a').href;
              // Check exclude products
              if (direct_buy_link.includes('5358857400') || direct_buy_link.includes('5335621300')) return;

              if (direct_buy_link) {
                direct_buy_link = `https://www.amd.com${direct_buy_link}`;
                bot.channels.get(Chanel_ID_DIRECT_BUY).send('Direct buy link: ' + direct_buy_link);
              }
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }, INTERVAL_TIME);
}
