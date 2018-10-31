const dialog = require('electron').remote.dialog;
const fs = require("fs");
const path = require("path");
const remote = require('electron').remote;


// TODO:
// - Display open dialog
// - Read file
// - Parse file using a parser (on "runtime" using extension? / using config? / asking user?)
// - Create new tab and add blocks from the file parser objejct 

/*

let validLinkTypes = [];
for (let i = 0; i < config.connectionsTypes.length; ++i) {
  validLinkTypes.push(config.connectionsTypes[i].name);
}
*/
function createBlockRecursively(element, parentBlock, linkToParentType) {
  let isCommented = false;
  if (element.type === "comment") {
    try {
      let JSONData = xmlConverter.xml2js(element.comment, {
        compact: false
      });
      // Assume that's it's one of our comment. TODO: Better check to prevent loading invalid stuff
      // This also only one block and its children to be commented
      element = JSONData.elements[0];
      isCommented = true;
    } catch (e) {
      // There's not much we can do if we can't parse it
      return false;
    }
  }

  let blockName = element.attributes ? (element.attributes.id || element.name) : element.name;
  let newBlock = new Block(blockLoader.getDefinitionByName(blockName), parentBlock, linkToParentType);

  newBlock.commented = isCommented;

  if (element.elements) {
    for (let i = 0; i < element.elements.length; ++i) {
      let childElement = element.elements[i];
      let childName = childElement.attributes ? (childElement.attributes.id || childElement.name) : childElement.name;

      // This is a link to a child
      if (validLinkTypes.includes(childName)) {
        for (let j = 0; j < childElement.elements.length; ++j) {
          createBlockRecursively(childElement.elements[j], newBlock, childName);
        }
      } else {
        if (config.minimizedAttributeName !== "" && childName !== config.minimizedAttributeName) {
          // This is an attribute of newBlock
          if (!newBlock.attributes[childElement.name]) {
            newBlock.attributes[childElement.name] = {};
          }

          let value = childElement.elements ? childElement.elements[0].text : undefined;
          if (value !== undefined) {
            if (!newBlock.attributes[childElement.name][childElement.attributes.id]) {
              newBlock.attributes[childElement.name][childElement.attributes.id] = {
                name: childName,
                value: value
              };
            } else {
              newBlock.attributes[childElement.name][childElement.attributes.id].value = value;
            }
          }
        } else {
          if (childName === config.minimizedAttributeName) {
            newBlock.minimized = true;
          }
        }
      }
    }
  }
}



function open(file) {
  fs.readFile(file, 'utf-8', function(err, xml) {
    let JSONData = xmlConverter.xml2js(xml, {
      compact: false
    });
    if (JSONData.elements) {
      // Make sure we don't have 2 tabs with the same file / location
      // Note: we don't check that sooner because readFile is async and we don't want to change tab before all the blocks
      // have been added
      if (!tabManager.handleNewTab(path.basename(file), path.dirname(file) + path.sep)) {
        return false;
      }

      let elements = cleanTopLevelContainers(JSONData.elements, config.topLevelBlocksContainer.length);

      for (let i = 0; i < elements.length; ++i) {
        createBlockRecursively(elements[i], rootBlock, "normal");
      }

      // For some reason block height is tied to the rendered because of comments so auto layout doesn't
      // exactly take everything into account .........................
      rootBlock.autoLayout(true);
      tabManager.getCurrentTab().setSaved(true);

      setTimeout(() => {
        rootBlock.autoLayout(true);
        tabManager.getCurrentTab().setSaved(true);
        tabManager.notifyTabDisplayer();
      }, 1);
    }
  });
}
module.exports.open = open;

module.exports.openWithDialog = () => {
  if (!canOpenDialog) {
    return false;
  }

  canOpenDialog = false;
  let defaultPath = tabManager.getCurrentTab().fileLocation;
  if (!defaultPath) {
    defaultPath = config.defaultOpenFileLocation;
  }

  dialog.showOpenDialog(remote.getCurrentWindow(), {
    defaultPath: defaultPath,
    properties: ['openFile', 'multiSelections'],
    filters: [{
      name: "XML file",
      extensions: ["xml"]
    }]
  }, function(files) {
    canOpenDialog = true;
    if (files !== undefined) {
      for (let i = 0; i < files.length; ++i) {
        open(files[i]);
      }
    }
  });
  return true;
};

function encodeXML(str = "") {
  if (!str) str = "";

  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
