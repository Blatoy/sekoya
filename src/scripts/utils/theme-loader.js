const fs = require("fs");

const CSS_THEME_FILES = ["main", "editor", "welcome"];

const THEME_FOLDER_PATH = basePath + "/style/themes/" + config.theme + "/";
const DEFAULT_THEME_PATH = basePath + "/style/default/";

// TODO: Check at the external location as well

function loadJSONStyle(fileName) {
  let object = require(DEFAULT_THEME_PATH + fileName + ".json");
  if (fs.existsSync(THEME_FOLDER_PATH + fileName + ".json")) {
    overrideObjectProperties(object, require(THEME_FOLDER_PATH + fileName + ".json"));
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
      link.href = THEME_FOLDER_PATH + CSS_THEME_FILES[i] + ".css";
      head.appendChild(link);
    }
  }
}

module.exports.blocksStyle = loadJSONStyle("block-style");
module.exports.linkStyles = loadJSONStyle("link-style");
module.exports.editorStyle = loadJSONStyle("editor-style");
