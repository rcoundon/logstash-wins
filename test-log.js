const {createLogger, transports, format } = require('winston');
const { combine, timestamp, label, prettyPrint, json } = format;

const leadentLogstash = require('./leadent-winston.js');

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
            timeout_connect_retries: 1000,
            max_connect_retries: 1000,
            node_name: "test",
            username: "user",
            password: "password",
            basicAuth: true
        })
    ],
    exitOnError: false
})

logger.debug({stuff:"Hi!"});

logger.error({type: "error happened"})

logger.debug("just a string")