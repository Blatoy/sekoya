const config = require(basePath + "/config/general.json");
const fs = require("fs");

const CSS_THEME_FILES = ["main", "editor", "welcome"];

function loadJSONStyle(fileName) {
  let object = require(basePath + "/src/style/common/" + fileName + ".json");
  if (fs.existsSync(basePath + "/src/style/themes/" + config.theme + "/" + fileName + ".json")) {
    overrideObjectProperties(object, require(basePath + "/src/style/themes/" + config.theme + "/" + fileName + ".json"));
  }
  return object;
}

function overrideObjectProperties(baseObject, newProperties) {
  for (let k in baseObject) {
    if (newProperties[k] !== undefined) {
      if (typeof baseObject[k] === "object") {
        overrideObjectProperties(baseObject[k], newProperties[k]);
      } else {
        baseObject[k] = newProperties[k];
      }
    }
  }
}

// Based on https://stackoverflow.com/questions/574944/how-to-load-up-css-files-using-javascript
// Adds all styles to the current HTML page
module.exports.addCSSToCurrentPage = () => {
  if (config.theme != "default") {
    for (let i = 0; i < CSS_THEME_FILES.length; ++i) {
      let head = document.getElementsByTagName("head")[0];
      let link = document.createElement("link");
      // link.id = "css-" + CSS_THEME_FILES[i];
      link.rel = "stylesheet";
      link.type = "text/css";
      link.medial = "all";
      link.href = basePath + "/src/style/themes/" + config.theme + "/" + CSS_THEME_FILES[i] + ".css";
      head.appendChild(link);
    }
  }
}

module.exports.blocksStyle = loadJSONStyle("block-style");
module.exports.linkStyles = loadJSONStyle("link-style");
