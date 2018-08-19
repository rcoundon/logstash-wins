# Logstash TCP Wins
Inspired by the winston-logstash module but as that isn't actively maintained and doesn't support 3.0.0 of Winston, I decided to create my own

## A Transport for Winston that allows for the sending of data to the Logstash TCP input plugin

Initialise the log transport like so:

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
                label: "test",
            })
        ],
        exitOnError: false
    })

### Still to-do
At the moment, the recovery from a Logstash outage relies on 60s passing after the socket has reported it's connected which is pretty poor.  Working on finding a way to be able to determine and rely on the socket being properly writeable to Logstash without resorting to time period.  If you've got a way, please do create a PR.

