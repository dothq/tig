const fse = require('fs-extra');
const fs = require("fs");
const { resolve } = require("path");

const { log } = require("../actions/console");
const { fancyTime } = require("../actions/time");
const rimraf = require('rimraf');

const merge = async (patch, base) => {
    var t = Date.now()
    console.log();
    log("INFO", `Merging \`${patch}\` with \`${base}\`...`)

    var fl = fs.readdirSync(resolve(process.cwd(), base, patch)).length;

    console.log();

    fs.readdirSync(resolve(process.cwd(), base, patch)).forEach(file => {
        log("PROCESS", `Moved \`${file}\`.`)
        fse.moveSync(resolve(process.cwd(), base, patch, file), resolve(process.cwd(), base, file), { overwrite: true })
    });

    await rimraf.sync(resolve(process.cwd(), base, patch))

    console.log();
    log("SUCCESS", `Moved \`${fl}\` files in \`${patch}\` to \`${base}\` in \`${fancyTime(Date.now() - t)}s\`.`, true, false);
    console.log();

    process.exit(0);
}

module.exports = { merge }