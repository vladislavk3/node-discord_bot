require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const jsdom = require("jsdom");
const fs = require('fs')
const bot = new Discord.Client();
const { INTERVAL_TIME, TOKEN, CHANNEL_ID_STOCK, CHANNEL_ID_STOCK_2 } = process.env;
const link_filename = "link.txt";
const proxy_filename = "proxy.txt";
const agent_filename = "agent.txt";
var proxyList = [];
var agentList = [];
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

      // Read agent list
      fs.readFile(agent_filename, 'utf8', function(err, data) {
        if (err) throw err;
        
        let agents = data.split("\n");
        if (agents) {
          agents.forEach(item => {
            item = item.trim();
            agentList.push(item);
          });

          callAPI();
        }
      });
    }
  });
}

function callAPI() {
  let interval = Math.floor(Math.random() * 5) + 10;
  let proxyInfo = proxyList[index % proxyList.length];
  let userAgent = agentList[index % agentList.length];

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
            headers: {
              'User-Agent': userAgent
            },
            proxy: proxyInfo
          })
            .then(response => {
              let data = response.data;
              if (!data) return;

              const dom = new jsdom.JSDOM(data);
              let product = dom.window.document.getElementById('product_wrap');
              if (!product) return;

              let productName = product.querySelector('h1').textContent;
              productName = productName ? productName : '';
              let btnAddCart = product.querySelector('.cart_modal');
              if (btnAddCart) {
                let notifyString = '**<@&806725467377238047> | <@&806725722352910397> Product: ' + productName + '**\n' + 'Online Stock: ' + link + '\n' + 'Add to cart: ' + link.replace('/product/readProduct', '/cart/check_loop') + '/1/4';
                console.log(notifyString);
                bot.channels.get(CHANNEL_ID_STOCK).send(notifyString);
                bot.channels.get(CHANNEL_ID_STOCK_2).send(notifyString);
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
