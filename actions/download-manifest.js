const { resolve } = require("path");
const axios = require("axios");
const fs = require("fs");

const { log } = require("./console");

const downloadManifest = (repo, name) => {
    return new Promise((resolve, reject) => {
      axios.get(`https://raw.githubusercontent.com/${repo ? repo : "dothq/dot"}/master/manifests/${name}.json`)
        .then(res => resolve(res.data))
    })
}

const grabManifest = async (tag, manifestOverride) => {
    var manifest = {}

    const home = require('os').homedir();
    const cache = resolve(home, ".cache");
  
    if(!fs.existsSync(resolve(cache, "dot", tag))) {
      log("PROCESS", `Downloading \`${tag}\` manifest...`)
  
      manifest = await downloadManifest(manifestOverride, tag);
  
      log("SUCCESS", `Downloaded \`${tag}\` manifest.`)
  
      manifest.trusted = true;
  
      fs.writeFileSync(resolve(cache, "dot", tag), JSON.stringify(manifest, 2), "utf-8")
    } else {
      manifest = JSON.parse(fs.readFileSync(resolve(cache, "dot", tag)))
    }

    return manifest;
}

module.exports = { grabManifest }