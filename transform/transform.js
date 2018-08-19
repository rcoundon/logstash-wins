const { format } = require('winston');

const defaultFormat = format((info, opts) => {
    if(typeof info.message != 'object'){
        info.message = {
            message: info.message
        }
    }
    return info;
});

module.exports = defaultFormat;