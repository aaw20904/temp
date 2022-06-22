const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const serveStatic = require("serve-static");
const crypto = require('crypto');
let weatherResponse={};

let options = {
  cert: fs.readFileSync('example.crt'),
  key: fs.readFileSync('example.key'),
  rejectUnauthorized: false
}
 process.nextTick(async ()=>{
    try{
    weatherResponse = await getContent('http://api.weatherapi.com/v1/current.json?key=ef63eec0a0114ddfb03141254222106&q=Kiev&aqi=no')
    weatherResponse = JSON.parse(weatherResponse);
    } catch(e){
        weatherResponse = {"weather":"network error!"};
    }
})
let app = express();

const setCustomCacheControl = (res, path) => {
    if (serveStatic.mime.lookup(path) === "text/html") {
      res.setHeader("Service-Worker-allowed", "true");
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
};

app.use(express.json());
app.use(express.static('public'));
  
  app.use(
    serveStatic(path.join(__dirname, "public"), {
      setHeaders: setCustomCacheControl,
    })
  );

  app.post('/api/random',async (req, res)=>{
    console.log(req.body);
    /*let result = await new Promise((resolve,reject)=>{
        crypto.randomBytes(8,(err,buf)=>{
            if(err){reject(err)}
            resolve(buf);
        })
    })
    let string = result.toString('hex');*/
    res.json(weatherResponse);
  })






app.listen(80,()=>{console.log('listen on port 80..')})

/*let server = https.createServer(app,options);
server.listen(443,()=>{console.log('listen opn port 443....')});*/



/***a library to fetch a resource from the network **/
const getContent = function(url) {
    // return new pending promise
    return new Promise((resolve, reject) => {
      // select http or https module, depending on reqested url
      const lib = url.startsWith('https') ? require('https') : require('http');
      const request = lib.get(url, (response) => {
        // handle http errors
        if (response.statusCode < 200 || response.statusCode > 299) {
           reject(new Error('Failed to load page, status code: ' + response.statusCode));
         }
        // temporary data holder
        const body = [];
        // on every content chunk, push it to the data array
        response.on('data', (chunk) => body.push(chunk));
        // we are done, resolve promise with those joined chunks
        response.on('end', () => resolve(body.join('')));
      });
      // handle connection errors of the request
      request.on('error', (err) => reject(err))
      })
  };
  
