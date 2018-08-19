const { format } = require('winston');

const defaultFormat = format((info, opts) => {
    // Format the data so that the log entry can be a simple string or an object.
    // this allows the client to be able to do 
    // logger.debug("just a string!")
    // and
    // logger.debug({something: "super", anotherThing: "thanks for asking"})
    if(typeof info.message != 'object'){
        info.message = {
            message: info.message
        }
    }
    return info;
});

module.exports = defaultFormat;