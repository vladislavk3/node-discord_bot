require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const jsdom = require("jsdom");
const fs = require('fs')
const bot = new Discord.Client();
const { INTERVAL_TIME, TOKEN2, CHANNEL_ID_STOCK } = process.env;
const filename = "link.txt";

bot.login(TOKEN2);

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
  axios.get(link)
    .then(response => {
      let data = response.data;
      if (!data) return;

      const dom = new jsdom.JSDOM(data);
      let block = dom.window.document.getElementById('m-none');
      let btnAddCart = block && block.getElementsByClassName('btn-add-cart');
      if (btnAddCart && btnAddCart.length > 0) {
        if (btnAddCart[0].className.includes('btn-addcart')) {
          console.log('Online Stock: ' + link);
          bot.channels.get(CHANNEL_ID_STOCK).send('Online Stock: ' + link);
        } else if (!btnAddCart[0].className.includes('bg-outstock-all')) {
          console.log('Branch Stock: ' + link);
          bot.channels.get(CHANNEL_ID_STOCK).send('Branch Stock: ' + link);
        }
      }
    })
    .catch(error => {
      console.log(error);
    });
}
