const fse = require('fs-extra');
const fs = require("fs");
const { resolve, join } = require("path");

const { log } = require("../actions/console");
const { fancyTime } = require("../actions/time");
const rimraf = require('rimraf');

const { glob } = require("glob");

const merge = async (patch, base) => {
    var t = Date.now()
    console.log();
    log("INFO", `Merging \`${patch}\` with \`${base}\`...`)

    console.log();

    const path = resolve(process.cwd(), base, patch, "**/*");

    glob(path, { mark: true}, async (err, res) => {
        if (err) {
            console.log('Error', err);
        } else {
            const directories = res.filter(i => !i.split("/")[i.split("/").length-1]);
            const files = res.filter(i => !i.endsWith("/"));

            for (const path of directories) {
                const rel = path.split(resolve(process.cwd(), base, patch))[1];
                const loc = join(process.cwd(), base, rel);

                fse.ensureDir(loc);
            }

            for (const path of files) {
                const rel = path.split(resolve(process.cwd(), base, patch))[1];
                const loc = join(process.cwd(), base, rel);

                fse.move(path, loc, { overwrite: true });
            }

            const dirFirst = directories.map(i => i.split(resolve(process.cwd(), base, patch))[1]).slice(0, 3);
            const fileFirst = files.map(i => i.split(resolve(process.cwd(), base, patch))[1]).slice(0, 3);

            console.log();
            log("SUCCESS", `Moved \`${dirFirst.join(", ")}\` and ${directories.length - 3} more...`)
            log("SUCCESS", `Moved \`${fileFirst.join(", ")}\` and ${files.length - 3} more...`)

            console.log();
            log("SUCCESS", `Moved \`${directories.length + files.length}\` items in \`${patch}\` to \`${base}\` in \`${fancyTime(Date.now() - t)}s\`.`, true, false);
            console.log();

            process.exit(0);
        }
    });
}

module.exports = { merge }