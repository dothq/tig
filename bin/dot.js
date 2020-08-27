#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');

const { get } = require('../commands/get');
const { update } = require('../commands/update');
const { merge } = require('../commands/merge');

const { log } = require("../actions/console");

const chalk = require("chalk");
const fs = require("fs");
const { resolve } = require("path");

program.version(require("../package.json").version);

// process.on('unhandledRejection', (reason, p) => {
// 	// i'm lazy
// 	return;
// });

program
	.command('get <tag> [manifestOverride]')
	.description('get a project by its tag name')
	.action(async (tag, manifestOverride) => get(tag, manifestOverride));

program
	.command('update')
	.description('clear the manifests cache if they are misbehaving')
	.action(async () => update());

program
	.command('postget-merge <patch> <base>')
	.description("don't run this command unless you know what you're doing")
	.action(async (patch, base) => merge(patch, base));

program
	.command('tags [manifestOverride]')
	.description('lists all tags')
	.action((manifestOverride) => {
		const home = require('os').homedir();
		const cache = resolve(home, ".cache");

		var t = Date.now();

		log("INFO", `Fetching manifests from \`https://api.github.com/repos/${manifestOverride ? manifestOverride : "dothq/dot"}/contents/manifests\`...`, true)

		axios.get(`https://api.github.com/repos/${manifestOverride ? manifestOverride : "dothq/dot"}/contents/manifests`)
			.then(res => {
				log("INFO", `Loaded \`${res.data.length}\` manifest${res.data.length == 1 ? "" : "s"} in \`${Date.now() - t}ms\``, true, true)

				console.log("\n\n  Available manifests")

				res.data.forEach(manifest => {
					let cachedIndicator = "";

					const tag = manifest.name.split(".")[0];

					if(fs.existsSync(resolve(cache, "dot")) && fs.existsSync(resolve(cache, "dot", tag))) cachedIndicator = "cached"

					console.log(`   - ${tag} ${chalk.gray(cachedIndicator)}`)
				})

				console.log("")

				process.exit(0);
			}).catch(e => {
				if(!e.response) return console.error("\n" + e)

				log("ERROR", `Failed ${JSON.stringify(e.response.data)}.`, true)
				if(e.response.data.message == "Not Found") {
					log("ERROR", "You could try adding a manifest override argument to |dot tags|.", false, true)
				}
			})
	});

program.parse(process.argv);