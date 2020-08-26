const rimraf = require("rimraf")
const fs = require("fs");
const { resolve } = require("path");

const { log } = require("../actions/console");

const update = async () => {
    const home = require('os').homedir();
    const cache = resolve(home, ".cache");

    if(!fs.existsSync(resolve(cache, "dot"))) {
        log("ERROR", `No cache folder could be found, either this is your first time running \`dot\` or you've recently cleared the cache folder.`)
        process.exit(0);
    }

    const size = fs.readdirSync(resolve(cache, "dot")).length

    await rimraf.sync(resolve(cache, "dot"));

    log("SUCCESS", `Cleared \`${size}\` build scripts from cache. You will need to retrust scripts which you run after this command.`)
}

module.exports = { update }