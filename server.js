require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const bot = new Discord.Client();
const { INTERVAL_TIME, TOKEN, API_LINK, Chanel_ID_3060, Chanel_ID_3070, Chanel_ID_3080, Chanel_ID_3090 } = process.env;
var purchase_link_3060 = '';
var purchase_link_3070 = '';
var purchase_link_3080 = '';
var purchase_link_3090 = '';

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  callAPI();
});

function callAPI() {
  setInterval(function () {
    axios.get(API_LINK)
      .then(response => {
        let featuredProduct = response.data && response.data.searchedProducts && response.data.searchedProducts.featuredProduct;
        let productDetailList = response.data && response.data.searchedProducts && response.data.searchedProducts.productDetails;
        let new_purchase_link_3080 = featuredProduct && featuredProduct.retailers && featuredProduct.retailers.length > 0 && featuredProduct.retailers[0].purchaseLink;
        let new_purchase_link_3090 = productDetailList && productDetailList.length > 0 && productDetailList[0].retailers && productDetailList[0].retailers.length > 0 && productDetailList[0].retailers[0].purchaseLink;
        let new_purchase_link_3070 = productDetailList && productDetailList.length > 1 && productDetailList[1].retailers && productDetailList[1].retailers.length > 0 && productDetailList[1].retailers[0].purchaseLink;
        let new_purchase_link_3060 = productDetailList && productDetailList.length > 2 && productDetailList[2].retailers && productDetailList[2].retailers.length > 0 && productDetailList[2].retailers[0].purchaseLink;
        if (new_purchase_link_3060 && (new_purchase_link_3060 != purchase_link_3060)) {
          purchase_link_3060 = new_purchase_link_3060;
          bot.channels.get(Chanel_ID_3060).send('New purchase link: ' + purchase_link_3060);
        }

        if (new_purchase_link_3070 && (new_purchase_link_3070 != purchase_link_3070)) {
          purchase_link_3070 = new_purchase_link_3070;
          bot.channels.get(Chanel_ID_3070).send('New purchase link: ' + purchase_link_3070);
        }

        if (new_purchase_link_3080 && (new_purchase_link_3080 != purchase_link_3080)) {
          purchase_link_3080 = new_purchase_link_3080;
          bot.channels.get(Chanel_ID_3080).send('New purchase link: ' + purchase_link_3080);
        }

        if (new_purchase_link_3090 && (new_purchase_link_3090 != purchase_link_3090)) {
          purchase_link_3090 = new_purchase_link_3090;
          bot.channels.get(Chanel_ID_3090).send('New purchase link: ' + purchase_link_3090);
        }        
      })
      .catch(error => {
        console.log(error);
      });
  }, INTERVAL_TIME);
}
