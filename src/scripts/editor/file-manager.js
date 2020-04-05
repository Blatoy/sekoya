const {
  dialog
} = require('electron').remote;
const fs = require("fs");
const xmlConverter = require("xml-js");
const path = require("path");
const remote = require('electron').remote;

let canOpenDialog = true;

function saveAs(tab, callback = () => {}) {
  dialog.showSaveDialog(remote.getCurrentWindow(), {
    title: "Save as...",
    defaultPath: tab.getFileLocation(),
    filters: [{
      name: "",
      extensions: ['xml']
    }]
  }, (location) => {
    if (location) {
      tab.fileLocation = path.dirname(location) + path.sep;
      tab.name = path.basename(location);

      save(tab, location, callback);
    }
  });
}

function save(tab, path = false, callback = () => {}) {
  fs.lstat(path, (err, stats) => {
    if (!stats && tab.fileLocation === "") {
      saveAs(tab, callback);
    } else {
      let xmlData = '<?xml version="1.0" ?>';

      if (rootBlock.blockDefinition.config.topLevelBlocksContainer.length > 0) {
        xmlData += "<" + rootBlock.blockDefinition.config.topLevelBlocksContainer[0] + ">";
      }

      for (let i = 0; i < tab.blocks.length; ++i) {
        xmlData += getXMLRecursively(tab.blocks[i]);
      }

      if (rootBlock.blockDefinition.config.topLevelBlocksContainer.length > 0) {
        xmlData += "</" + rootBlock.blockDefinition.config.topLevelBlocksContainer[0] + ">";
      }

      // console.log(xmlData);
      fs.writeFile(path, xmlData, function() {
        tab.setSaved(true);
        tabManager.notifyTabDisplayer();
        callback();
      });
    }
  });
}

function getXMLRecursively(block, depth = 0) {
  {
    let blockData = "";

    if (depth + 1 < rootBlock.blockDefinition.config.topLevelBlocksContainer.length) {
      blockData += "<" + rootBlock.blockDefinition.config.topLevelBlocksContainer[depth + 1] + ">";
    }

    if (block.commented) {
      blockData += "<!--";
    }

    if (blockLoader.findBlockInDefinition(rootBlock.blockDefinition, block.name).useNameAttributeAsTagName) {
      blockData += "<" + block.name + ' id="' + block.name + '">';
    } else {
      blockData += "<" + block.type + ' id="' + block.name + '">';
    }

    for (let type in block.attributes) {
      for (let attribute in block.attributes[type]) {
        blockData += '<' + type + ' id="' + block.attributes[type][attribute].name + '">' + encodeXML(block.attributes[type][attribute].value) + '</' + type + '>';
      }
      if (rootBlock.blockDefinition.config.minimizedAttributeName !== "") {
        if (block.minimized) {
          blockData += '<string id="' + rootBlock.blockDefinition.config.minimizedAttributeName + '">yes</string>';
        }
      }
    }
    if (block.children.length > 0) {
      let previousLinkToParentType = block.children[0].linkToParentType;
      blockData += "<" + previousLinkToParentType + ">";

      for (let i = 0; i < block.children.length; ++i) {
        if (previousLinkToParentType != block.children[i].linkToParentType) {
          blockData += "</" + previousLinkToParentType + ">";

          previousLinkToParentType = block.children[i].linkToParentType;
          blockData += "<" + block.children[i].linkToParentType + ">";
        }

        blockData += getXMLRecursively(block.children[i], depth + 1);
      }
      blockData += "</" + previousLinkToParentType + ">";
    }

    if (blockLoader.findBlockInDefinition(rootBlock.blockDefinition, block.name).useNameAttributeAsTagName) {
      blockData += "</" + block.name + '>';
    } else {
      blockData += "</" + block.type + '>';
    }

    if (block.commented) {
      blockData += "-->";
    }

    if (depth + 1 < rootBlock.blockDefinition.config.topLevelBlocksContainer.length) {
      blockData += "</" + rootBlock.blockDefinition.config.topLevelBlocksContainer[depth + 1] + ">";
    }

    return blockData;
  }
}

function cleanTopLevelContainers(elements, targetDepth, depth = 1) {
  let elementsClean = [];

  for (let i = 0; i < elements.length; ++i) {
    if (depth >= targetDepth) {
      for (let j = 0; j < elements[i].elements.length; ++j) {
        elementsClean.push(elements[i].elements[j]);
      }
    } else {
      elementsClean.push.apply(elementsClean, cleanTopLevelContainers(elements[i].elements, targetDepth, depth + 1));
    }
  }

  return elementsClean;
}


let validLinkTypes = [];

function createBlockRecursively(element, parentBlock, linkToParentType) {
  if (validLinkTypes.length === 0) {
    for (let i = 0; i < rootBlock.blockDefinition.config.connectionsTypes.length; ++i) {
      validLinkTypes.push(rootBlock.blockDefinition.config.connectionsTypes[i].name);
    }
  }

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
  let newBlock = new Block(blockLoader.findBlockInDefinition(rootBlock.blockDefinition, blockName), parentBlock, linkToParentType);
  /*
  constructor(blockDefinition, parent = false, linkToParentType = false, children = [], position = {
    x: 0,
    y: 0
  }) {
    */
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
        if (rootBlock.blockDefinition.config.minimizedAttributeName !== "" && childName !== rootBlock.blockDefinition.config.minimizedAttributeName) {
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
          if (childName === rootBlock.blockDefinition.config.minimizedAttributeName) {
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

      //console.log(rootBlock.blockDefinition);
      let elements = cleanTopLevelContainers(JSONData.elements, rootBlock.blockDefinition.config.topLevelBlocksContainer.length);

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

module.exports.save = save;
module.exports.saveAs = saveAs;