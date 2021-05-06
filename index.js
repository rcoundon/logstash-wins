const net = require('net');
const socket = new net.Socket();

const Transport = require('winston-transport');
const {format} = require('winston');
const defaultTransform = require('./transform/transform');
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
        this._transform = opts.transformer || defaultTransform;
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
            this.processLogQueue();
        }
        callback(); 
    }

    sendToLogstash(log){
        let logEntry = this._transform(log, null);
        logEntry = logEntry.transform({
            level: log.level,
            message: log.message,
            label: this._label
        })
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
        })
        
        this._socket.on("connect", () => {
            this._connected = true;
            this._retrying = false;
            this._currentRetry = 0;
            clearInterval(this._interval);
            this._interval = null;
            // wait 60s for socket to be ready
            setTimeout(()=> {
                this.processLogQueue();
            }, 60000);
        });

        this._socket.on("error", (error) => {
            this.emit('error', error);
        })
        
        this._socket.on("drain", (msg) => {
        })
        
        this._socket.on("end", (msg) => {
        })
        
        this._socket.on("timeout", (msg) => {
        })

        this._socket.on("close", (msg) => {            
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
                if(!this._socket.connecting){
                    this._currentRetry++;
                    this._socket.connect(this._port, this._host);
                }            
            }, this._retryInterval);
        }
        if(this._currentRetry === this._maxRetries){
            clearInterval(this._interval);
            this._silent = true;
            this.emit('error', new Error('Max retries reached, going silent, further logs will be stored'));
        }
    }
};
