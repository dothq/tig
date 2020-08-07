#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');

const fs = require("fs");
const http = require('isomorphic-git/http/node')
const path = require("path");
const axios = require('axios');

const commandExists = require('command-exists').sync;

const git = require('isomorphic-git')
const hg = require("hg");

program.version('1.0.0');

const log = (chan, pl, upPrev, nl) => {
    const channels = {
        ERROR: chalk.red.bold,
        WARN: chalk.yellow.bold,
        INFO: chalk.blue.bold,
        SUCCESS: chalk.green.bold,
        PROCESS: chalk.magenta.bold,
        HELPER: chalk.cyan.bold
    }

    if(upPrev) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${channels[chan](chan)} ` + pl);
    } else {
      console.log(`${nl ? "\n" : ""}${channels[chan](chan)}`, pl) 
    }
}

const fancyTime = (duration) => {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

program
  .command('fetch <hgProject> <gitProject>')
  .description('fetch a project')
  .action((hgProject, gitProject, sw) => {
    const t = Date.now();

    log("INFO", `Checking if Mercurial is installed on your system...`, true)
    const mercurialInstalled = commandExists("hg");

    log("INFO", `Checking if Git is installed on your system...`, true)
    const gitInstalled = commandExists("git");

    if(!mercurialInstalled) {
      log("ERROR", `For \`tig\` to work, you will need to install Mercurial.`)

      var platform = require("os").platform

      const hash = platform == "win32" ? "#Windows" : platform == "darwin" ? "#Mac_OS_X" : ""

      return log("ERROR", `Mercurial can be installed for your \`${require("os").platform}\` machine by following the instructions at https://www.mercurial-scm.org/wiki/Download${hash}.`)
    }

    if(!gitInstalled) {
      log("ERROR", `For \`tig\` to work, you will need to install Git.`)

      const platform = require("os").platform

      const path = platform == "win32" ? "win" : platform == "darwin" ? "mac" : "linux"

      return log("ERROR", `Git can be installed for your \`${require("os").platform}\` machine by downloading Git at https://git-scm.com/download/${path}.`)
    }

    if(!hgProject.startsWith("http") || !hgProject.startsWith("https")) hgProject = `https://` + hgProject;

    const repo = hgProject.split("://")[1].split("/");
    repo.shift()

    log("HELPER", `Preparing \`${repo.join("/")}\` for mercurial clone at server \`${hgProject.split("://")[1].split("/").shift()}\`.`, false, true)

    const projectName = repo.join("/").split("/").pop();

    if(!gitProject.startsWith("http") || !gitProject.startsWith("https")) gitProject = `https://` + gitProject;

    const gitRepo = gitProject.split("://")[1].split("/");
    gitRepo.shift()

    const dir = path.join(process.cwd(), projectName)

    if(!done) {
      log("PROCESS", `Starting clone of mercurial repository \`${repo.join("/")}\` located at \`${hgProject.split("://")[1].split("/").shift()}\`, this may take a while...`, false, false)
    }

    var int = setInterval(() => {
      log("INFO", `[${fancyTime(Date.now() - t)}] Tig is still cloning...`, true)
    }, 1000)

    var failed = false;
    var done = false;

    hg.clone(hgProject, dir, (e, out) => {      
      if(e) {
        done = true;
        failed = true;

        log("ERROR", e.message, false, true)

        return clearInterval(int)
      }

      if(!failed && out) {
        done = true;
        log("SUCCESS", `Cloned mercurial repository \`${repo.join("/")}\` in \`${fancyTime(Date.now() - t)}s\``, true, true)
        return clearInterval(int)
      }
    });

  });

program.parse(process.argv)