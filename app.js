const {createLogger, transports, format } = require('winston');
const { combine, timestamp, label, prettyPrint, json } = format;

const logstashTcpWins = require('./index.js');

const logger = createLogger({
    format: combine (
         label({ label: 'right meow!' }),
         timestamp(),
         prettyPrint(),
         json()
    ),
    transports: [
        new logstashTcpWins({
            level: "debug",
            port: 5000,
            json: true,
            host: "localhost",
            retryInterval: 2000,
            maxRetries: 1000,
            label: "MyTestLabel",
        })
    ],
    exitOnError: false
})

let x = 0;

setInterval(() => {
    logger.debug({
        stuff:"Hi!",
        id: x++
    });
},100)
