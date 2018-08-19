function nodeSocketSupportsReady(){
    let version = process.version;
    version = version.substring(1);
    let semVerSplit = version.split(".");
    let major = parseInt(semVerSplit[0]);
    if(major > 9){
        return true
    }
    else if(major < 9){
        return false;
    }
    else{
        let minor = parseInt(semVerSplit[1]);
        if(minor < 12){
            return false;
        }
        else if(minor >= 11){
            return true;
        }
    }
}
module.exports.nodeSocketSupportsReady = nodeSocketSupportsReady;