const {createLogger, transports, format } = require('winston');
const { combine, timestamp, label, prettyPrint, json } = format;

const logstashTcpWins = require('./index.js');

const logstashTransport = new logstashTcpWins({
    level: "debug",
    port: 5000,
    json: true,
    host: "localhost",
    retryInterval: 2000,
    maxRetries: 1000,
    label: "MyTestLabel",
});

logstashTransport.on('error', (error)=>console.error('logstash transport error',error));

const logger = createLogger({
    format: combine (
         label({ label: 'right meow!' }),
         timestamp(),
         prettyPrint(),
         json()
    ),
    transports: [
        logstashTransport
    ],
    exitOnError: false
});

logger.on('error', (error)=>console.warn('logstash error', error));

let x = 0;

setInterval(() => {
    logger.debug({
        stuff:"Hi!",
        id: x++
    });
},100)
