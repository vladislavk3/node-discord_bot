require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const jsdom = require("jsdom");
const fs = require('fs')
const bot = new Discord.Client();
const { INTERVAL_TIME, TOKEN, CHANNEL_ID_STOCK, CHANNEL_ID_STOCK_2 } = process.env;
const link_filename = "link.txt";
const proxy_filename = "proxy.txt";
var proxyList = [];
var index = 0;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  start();
});



function start() {
  // Read proxy list
  fs.readFile(proxy_filename, 'utf8', function(err, data) {
    if (err) throw err;
    
    let lines = data.split("\n");
    if (lines) {
      lines.forEach(line => {
        line = line.trim();
        let proxyArray = line.split(":");
        if (proxyArray) {
          proxyList.push({host: proxyArray[0], port: proxyArray[1]});
        }
      });

      callAPI();
    }
  });
}

function callAPI() {
  let interval = Math.floor(Math.random() * 5) + 10;
  let proxyInfo = proxyList[index % proxyList.length];

  // Read link list
  fs.readFile(link_filename, 'utf8', function(err, data) {
    if (err) throw err;
    
    let links = data.split("\n");
    if (links) {
      setTimeout(() => {
        let i = 0;
        links.forEach(link => {
          link = link.trim();
          axios.get(link, {
            proxy: proxyInfo
          })
            .then(response => {
              let data = response.data;
              if (!data) return;

              const dom = new jsdom.JSDOM(data);
              let productNameElement = dom.window.document.getElementsByClassName('product-name');
              let productName = productNameElement && productNameElement.length > 0 && productNameElement[0].textContent;
              productName = productName ? productName : '';
              let block = dom.window.document.getElementById('m-none');
              let btnAddCart = block && block.getElementsByClassName('btn-add-cart');
              if (btnAddCart && btnAddCart.length > 0) {
                if (btnAddCart[0].className.includes('btn-addcart')) {
                  let notifyString = '<@&805111311762456598> | <@&805113458780798996> **Product: ' + productName + '**\n' + 'Online Stock: ' + link + '\n' + 'Add to cart: ' + link.replace('product', 'addcart');
                  console.log(notifyString);
                  bot.channels.get(CHANNEL_ID_STOCK).send(notifyString);
                  bot.channels.get(CHANNEL_ID_STOCK_2).send(notifyString);
                }
              }

              i++;
              if (i == links.length) {
                index++;
                callAPI();
              }
            })
            .catch(error => {
              console.log('error', proxyInfo);
              i++;
              if (i == links.length) {
                index++;
                callAPI();
              }
            });
        });
      }, interval);
    }
  });
}
