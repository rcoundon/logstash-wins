let net = require('net');
let socket = new net.Socket();

const Transport = require('winston-transport');

const {format} = require('winston');
const util = require('util');
const logUtils = require('./lib/logutils');
const rp = require('request-promise-native');
const defaultTransform = require('./transform/transform');
//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class LeadentLogstash extends Transport {

    constructor(opts) {
        super(opts);

        this._port = opts.port || 5000;
        this._host = opts.host || "localhost";
        this._label = opts.label;
        this._maxRetries = opts.maxRetries || 1000;
        this._retryInterval = opts.retryInterval || 100;
        this._logQueue = [];
        this._transform = defaultTransform;
        this.connect();
        console.log("Constructed");
    }
    
    log(info, callback) {
        // Add the log entry to the queue and return
        this._logQueue.push(info);
        callback();
        setImmediate( () => {
            
            this.processLogQueue();
        });
    }
    processLogQueue() {
        while(this._logQueue.length > 0){
            let log = this._logQueue.shift()
            
            let logEntry = defaultTransform(log, null);
            logEntry = logEntry.transform({
                level: log.level,
                message: log.message
            })
            console.log(`Log: ${JSON.stringify(logEntry)}`);
            this._socket.write(JSON.stringify(logEntry) + "\n");
            this.emit('logged', logEntry);
        }
    }
    
    connect(){

        this._socket = net.createConnection(this._port, this._host, function(){
            socket.setKeepAlive(true, 60 * 1000);
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
        
        this._socket.on("close", (msg) => {
            console.log(`Socket closed ${msg}`);
        })
    }
   
};



