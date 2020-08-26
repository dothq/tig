const { resolve } = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const { exec, execFile } = require("child_process");
const spawnAsync = require("@expo/spawn-async");

const { runShell } = require("./run-shell")
const { log } = require("./console");
const { fancyTime } = require("./time");
const { spawn } = require("child_process");

const cppSleep = () => {
    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

const runCppHook = async (target, targetName, location) => {
    console.log();
    log("INFO", `Cloning \`${targetName} (${target.name})\`, this may take a while...`)

    await cppSleep().catch(e => e);

    var t = Date.now();

    return new Promise(async (fullfill, reject) => {
        const { type, name, http, repository } = target;

        const runner = type == "mercurial" ? "hg" : type;

        let heartbeat = setInterval(() => {
            log("PROCESS", `Target \`${targetName} (${name})\` is still being cloned... [${fancyTime(Date.now() - t)}s]`, true, true)

            process.title = `${targetName} (${name}) - ${fancyTime(Date.now() - t)}s`
        }, 100);

        const cmd = `${runner} clone ${http} ${location} -b ${repository.branch}`

        let child = exec(cmd, (err, stdout, stderr) => {
            if(err || stderr) {
                console.log("\n" + (err || stderr))
                return process.exit(0);
            }
        })

        child.on('close', function(code) {
            fullfill(true)

            log("SUCCESS", `Cloned \`${targetName} (${name})\` in \`${fancyTime(Date.now() - t)}s\`.`, true, true)

            console.log();
            clearInterval(heartbeat)
        });
            
    });
}

module.exports = { runCppHook }