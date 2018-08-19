let net = require('net');
let socket = new net.Socket();

const Transport = require('winston-transport');

const {format} = require('winston');
const util = require('util');
const logUtils = require('./lib/logutils');
const rp = require('request-promise-native');
const defaultTransform = require('./transform/transform');
const supportsReady = logUtils.nodeSocketSupportsReady();
//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class LogstashTCP extends Transport {

    constructor(opts) {
        super(opts);

        this._port = opts.port || 5000;
        this._host = opts.host || "localhost";
        this._label = opts.label;
        this._maxRetries = opts.maxRetries || 1000;
        this._retryInterval = opts.retryInterval || 100;
        this._logQueue = [];
        this._transform = defaultTransform;
        this._connected = false;
        this._silent = false;
        this._currentRetry = 0;
        this._retrying = false;
        this._socket = new net.Socket({
            writable: true,
            readable: false
        });
        this._socket.setDefaultEncoding("utf8");
        this.connect();
        console.log("Constructed");
    }
    
    log(info, callback) {
        setImmediate( () => {
            this.emit('logged', info);   
        });

        if(this._silent){
            callback();    
        }

        this._logQueue.push(info);
        if(this._connected){
            console.log('About to process log queue');
            this.processLogQueue();
        }
        callback(); 
    }

    sendToLogstash(log){
        let logEntry = defaultTransform(log, null);
        logEntry = logEntry.transform({
            level: log.level,
            message: log.message
        })
        console.log(`Log: ${JSON.stringify(logEntry)}`);
        this._socket.write(JSON.stringify(logEntry) + "\n");
        this.emit('logged', logEntry);
    }

    processLogQueue() {
        while(this._logQueue.length > 0){
            let log = this._logQueue.shift()
            this.sendToLogstash(log);
        }
    }
    
    connect() {
        this._socket.connect(this._port, this._host, function(){
            socket.setKeepAlive(true, 30000);
        });

        this._socket.on("ready", (conn) => {
            console.log(`socket ready`);      
        })
        
        this._socket.on("connect", () => {
            console.log(`socket connects`);
            this._connected = true;
            this._retrying = false;
            this._currentRetry = 0;
            clearInterval(this._interval);
            this._interval = null;
            // wait 60s for socket to be ready
            setTimeout(()=> {
                console.log(`Start processing again`);
                this.processLogQueue();
            }, 60000);
        });

        this._socket.on("error", (error) => {
            console.error(`Error emitted: ${error}`);
        })
        
        this._socket.on("drain", (msg) => {
            console.log(`Socket drained ${msg}`);
        })
        
        this._socket.on("end", (msg) => {
            console.log(`Socket ended ${msg}`);
        })
        
        this._socket.on("timeout", (msg) => {
            console.log(`Socket timeout ${msg}`);
        })

        this._socket.on("close", (msg) => {
            console.log(`Socket closed ${msg}`);
            this._connected = false;
            if(!this._retrying){
                this.retryConnection();
            }   
        })
    }

    retryConnection() {
        this._retrying = true;
        if(!this._interval){
            this._interval = setInterval(() => {   
                console.log(`Retry number ${this._currentRetry}`);
                if(!this._socket.connecting){
                    this._currentRetry++;
                    console.log(`initiating a connect on socket`);
                    this._socket.connect(this._port, this._host);
                }            
            }, this._retryInterval);
        }
        if(this._currentRetry === this._maxRetries){
            clearInterval(this._interval);
            this._silent = true;
            emit('error', new Error('Max retries reached, going silent, further logs will be stored'));
        }
    }
};
