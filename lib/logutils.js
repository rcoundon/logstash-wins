/**
 * Returns a string for use in HTML Basic Authentication APIs
 * @param {string} username 
 * @param {string} password 
 * @param {string} company 
 */

function getBasicAuthString(username, password, company) {
    if(!username || !password){
        throw new Error(`At least username and password must be specified`);
    }

    if(arguments.length === 3){
        let restAuth = username + '@' + company + ':' + password;
        let buf = Buffer.alloc(restAuth.length);
        buf.fill(restAuth);
        let basicAuthString = 'Basic ' + buf.toString('base64'); 
        return basicAuthString;   
    }    
    else if(arguments.length === 2){
        let restAuth = username + ':' + password;
        let buf = Buffer.alloc(restAuth.length);
        buf.fill(restAuth);
        let basicAuthString = 'Basic ' + buf.toString('base64'); 
        return basicAuthString;   
    }
    else{
        throw new Error(`No auth string to return args.length: ${arguments.length}`);
    }
}
module.exports.getBasicAuthString = getBasicAuthString;
