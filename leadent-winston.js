const Transport = require('winston-transport');

const util = require('util');
const logUtils = require('./lib/logutils');
const rp = require('request-promise-native');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class LeadentLogstash extends Transport {

    constructor(opts) {
      super(opts);
      console.log("Constructed");
      this.logstashHost = opts.host;
      this.logstashPort = opts.port;
      this.logstashUrl = "http://";
      if(this.logstashPort){
          this.logstashUrl += `${this.logstashHost}:${this.logstashPort}`;
      }
      else{
          this.logstashUrl += this.logstashHost;
      }
      this.user = opts.username;
      this.password = opts.password;
      this.basicAuth = opts.basicAuth;

      if(this.basicAuth){
          this.basicAuthString = logUtils.getBasicAuthString(this.user, this.password);
      }

      this.rpOptions = {
            headers: {
              Authorization: this.basicAuthString
            },
            uri: this.logstashUrl,
            json: true
      }
    }
    
    log(info, callback) {
      setImmediate(async () => {
        this.rpOptions.body = info.message;
        try{
            let result = await rp.post(this.rpOptions);
            console.log(result);
        }
        catch(err){
            console.error(err);
        }
        console.log(`Log: ${JSON.stringify(info)}`);
        this.emit('logged', info);
      });
      
      // Perform the writing to the remote service
      callback();
    }
  };