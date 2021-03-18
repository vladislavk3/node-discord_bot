require('dotenv').config();
const got = require('got');
const Discord = require('discord.js');
const jsdom = require("jsdom");
const fs = require('fs')
const bot = new Discord.Client();
const { INTERVAL_TIME, TOKEN, CHANNEL_ID_STOCK } = process.env;
const filename = "link.txt";

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  start();
});

function start() {
  setInterval(function () {
    readFile();    
  }, INTERVAL_TIME);
}

function readFile() {
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) throw err;
    
    let links = data.split("\n");
    if (links) {
      links.forEach(link => {
        callAPI(link);
      });
    }
  });  
}

function callAPI(link) {
  link = link.trim();
  got.get(link)
    .then(response => {
      let data = response.body;
      if (!data) return;

      const dom = new jsdom.JSDOM(data);
      let product = dom.window.document.getElementById('product_wrap');
      if (!product) return;

      let productName = product.querySelector('h1').textContent;
      productName = productName ? productName : '';
      let btnAddCart = product.querySelector('.cart_modal');
      if (btnAddCart) {
        let notifyString = 'Product: ' + productName + '\n' + 'Online Stock: ' + link + '\n' + 'Add to cart: ' + link.replace('/product/readProduct', '/cart/check_loop') + '/1/4';
        console.log(notifyString);
        bot.channels.get(CHANNEL_ID_STOCK).send(notifyString);
      }
    })
    .catch(error => {
      console.log(error);
    });
}
