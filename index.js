const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);
const io = require("socket.io")(server, {
  allowRequest: (req, callback) => {
    callback(null, req.headers.origin === undefined); // cross-origin requests will not be allowed
  }
});


// const {Builder, By, Key, until} = require('selenium-webdriver');
// const capabilities = {
//     'chromeOptions': {
//         'excludeSwitches': ['enable-automation']
//     }
// }
// (async function example() {
//   let driver = await new Builder()
//   .forBrowser('chrome')
//   .setChromeOptions(chromeOptions)
//   .withCapabilities(capabilities)
//   .build();
//   try {
//     await driver.get('http://www.google.com/ncr');
//     await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
//     await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
//   } finally {
//     await driver.quit();
//   }
// })();


let websiteSocket;

//serve static files
app.use(express.static(__dirname + '/public'));

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('website connected: ', socket.id);
  websiteSocket = socket;
  // websiteSocket.send("hello from video server");
  // websiteSocket.emit("hey", "yo");
  
  socket.on('disconnect', () => {
    console.log('website disconnected:', socket.id);
  });
  

  // seek to calm status
  // websiteSocket.emit('speed_update', 'calm'); 

  //websiteSocket.emit('audio_control', 'stop');


  // websiteSocket.emit('speed_update', speed);
  socket.on('test_python', (msg)=>{
    console.log(msg);
  });

  socket.on('installation_reset', ()=>{
    console.log("installation reset");
    websiteSocket.get(i.toString()).emit('audio_control', 'reset');
  });

  setTimeout(function () {
    websiteSocket.emit('play', 'xx');
    console.log('play!');
  }, 5000);
    
});


server.listen(8080, () => {
  console.log('listening on *:8080');
});

///bin/chromium-browser --autoplay-policy=no-user-gesture-requequired http://localhost:8080/1