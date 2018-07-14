const CSS_THEME_FILES = ["main", "editor", "welcome"];
const config = require(basePath + '/config/general.json');
const fs = require('fs');

// Based on https://stackoverflow.com/questions/574944/how-to-load-up-css-files-using-javascript
if (config.theme != "default") {
  for (let i = 0; i < CSS_THEME_FILES.length; ++i) {
    let head = document.getElementsByTagName('head')[0];
    let link = document.createElement('link');
    // link.id = "css-" + CSS_THEME_FILES[i];
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.medial = 'all';
    link.href = basePath + "/src/style/themes/" + config.theme + "/" + CSS_THEME_FILES[i] + ".css";
    head.appendChild(link);
  }
}

let blockStyle = {};

if (fs.existsSync(basePath + "/src/style/themes/" + config.theme + "/blocks-style.json")) {
  blockStyle = require(basePath + "/src/style/themes/" + config.theme + "/blocks-style.json");
} else {
  blockStyle = require(basePath + "/src/style/common/blocks-style.json");
}

module.exports.blockStyle = blockStyle;
