const fs = require("fs")
const os = require("os")

/**
 * Creates or updates /.env values.
 * 
 * @source https://stackoverflow.com/questions/64996008/update-attributes-in-env-file-in-node-js
 * 
 * @param {string} key
 * @param {string} value
 */
function setEnvValue(key, value) {

    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

/**
 * Potential function for future use.
 */
const htmlToNotion = () => {

}

module.exports = { setEnvValue }