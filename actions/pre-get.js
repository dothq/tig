const fs = require("fs");
const { resolve } = require("path");

const { grabManifest } = require("./download-manifest");
const { runCppHook } = require("./cpp-hook");
const { log } = require("./console");

const preGet = async (tag, manifestOverride) => {
    const { name, id, author, targets, builder } = await grabManifest(tag, manifestOverride);

    if(!name || !id || !author || !builder || !targets || !targets.base || !targets.patch) { 
      log("ERROR", `Failed to load build script \`${tag}\`. It seems to be malformed.`)
      process.exit(-1)
    }
  
    log("INFO", `Setting up \`${name} (${id})\` by \`${author}\`.`)
  
    try {
      fs.mkdirSync(resolve(process.cwd(), tag));
    } catch(e) {
      log("ERROR", e.message);
      process.exit(0)
    }
  
    runCppHook(targets.base, resolve(process.cwd(), tag))
}

module.exports = { preGet }