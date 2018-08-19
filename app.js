const {createLogger, transports, format } = require('winston');
const { combine, timestamp, label, prettyPrint, json } = format;

const leadentLogstash = require('./logstash-tcp.js');

const logger = createLogger({
    format: combine (
         label({ label: 'right meow!' }),
         timestamp(),
         prettyPrint(),
         json()
    ),
    transports: [
        new leadentLogstash({
            level: "debug",
            port: 5000,
            json: true,
            host: "localhost",
            retryInterval: 2000,
            maxRetries: 1000,
            label: "test",
        })
    ],
    exitOnError: false
})

let x = 0;
let moment = require('moment');
let now = moment();

setInterval(() => {
    logger.debug({
        stuff:"Hi!",
        id: x++,
        now: now.format('HH:mm:ss')

    });
},10000)
