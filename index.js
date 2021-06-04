const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

//==============socketio initialisation========================
// const { Server } = require("socket.io");
// const io = new Server(server);
//below is the old version of initialisation of socketio
const io = require("socket.io")(server, {
  allowRequest: (req, callback) => {
    callback(null, req.headers.origin === undefined); // cross-origin requests will not be allowed
  }
});
let websiteSocket;

//==============serial port commm initialisation========================
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// Read the port data
port.on("open", () => {
  console.log('serial port open');
});
parser.on('data', data =>{
  console.log(data);
  const obj = JSON.parse(data);
  console.log(obj.status);
  switch (obj.status) {
    case 'delay':
      if(obj.value == 10){
        websiteSocket.emit('speed_update', 'high');
        websiteSocket.emit('seek', '0.0');
      }else if(obj.value == 40){
        websiteSocket.emit('speed_update', 'mid');
        websiteSocket.emit('seek', '4.0');
      }else if(obj.value == 70){
        websiteSocket.emit('speed_update', 'low');
        websiteSocket.emit('seek', '8.0');
      }else if(obj.value == 100){
        websiteSocket.emit('speed_update', 'super_low');
        websiteSocket.emit('seek', '12.0');
      }
      break;
    case 'calm':
      websiteSocket.emit('speed_update', 'calm');
      websiteSocket.emit('seek', '16.0');
      break;
    case 'reset':
      websiteSocket.emit('seek', '0.0');
    break;
    default:
      break;
  }
  console.log('data from serial port', JSON.parse(data));
});

//==============delay and playback rate mapping========================
//common playback rate range 0.5-4.0 (audio cut outside this range for normal video)
//delay time range
const delayMin = 10;
const delayMax = 100;
//chrome playback rate range
const rateMin = 0.0625;
const rateMax = 16.0;
const delayRange =  delayMax - delayMin;
const rateRange = rateMax - rateMin;

//==============web server functions========================
//serve static files
app.use(express.static(__dirname + '/public'));

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//==============socketio functions========================
io.on('connection', (socket) => {
  console.log('website connected: ', socket.id);
  websiteSocket = socket;
  
  socket.on('disconnect', () => {
    console.log('website disconnected:', socket.id);
  });
  
  // seek to calm status
  // websiteSocket.emit('speed_update', 'calm'); 
  //websiteSocket.emit('audio_control', 'stop');
  // websiteSocket.emit('speed_update', speed);
  
  socket.on('speed_update', (currentDelay)=>{
    console.log(currentDelay);
    const delayPercentage = currentDelay/delayRange;
    const rateValue = rateMin + rateRange * delayPercentage;
  });

  socket.on('installation_reset', ()=>{
    console.log("installation reset");
    websiteSocket.get(i.toString()).emit('audio_control', 'reset');
  });

  setTimeout(function () {
    websiteSocket.emit('play', 'xx');
    console.log('play!');
  }, 3000);
    
});


server.listen(8080, () => {
  console.log('listening on *:8080');
});


//==============selenium initialisation and startup========================
const {Builder, By, Key, until} = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
const chromeOptions = new chrome.Options();
chromeOptions.addArguments(['--start-maximized']);
chromeOptions.excludeSwitches('enable-automation');
(async () => {
  let driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();
  try {
    await driver.get('http://localhost:8080/1');
    await driver.findElement(By.xpath('//body')).click()
  } finally {
    // await driver.quit();
  }
})();
