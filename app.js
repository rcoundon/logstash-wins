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
            retryInterval: 1000,
            maxRetries: 1000,
            label: "test",
        })
    ],
    exitOnError: false
})

logger.debug({stuff:"Hi!"});

logger.error({type: "error happened"})

logger.debug("just a string")