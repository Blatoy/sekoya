const xmlConverter = require("xml-js");

/**
 * The extension of the file that can be loaded using this parser
 */
module.exports.FILE_EXTENSIONS = ["xml"];


function getXMLRecursively(block, depth = 0) {
  {
    let blockData = "";

    if (depth + 1 < config.topLevelBlocksContainer.length) {
      blockData += "<" + config.topLevelBlocksContainer[depth + 1] + ">";
    }

    if (block.commented) {
      blockData += "<!--";
    }

    if (blockLoader.getDefinitionByName(block.name).useNameAttributeAsTagName) {
      blockData += "<" + block.name + ' id="' + block.name + '">';
    } else {
      blockData += "<" + block.type + ' id="' + block.name + '">';
    }

    for (let type in block.attributes) {
      for (let attribute in block.attributes[type]) {
        blockData += '<' + type + ' id="' + block.attributes[type][attribute].name + '">' + encodeXML(block.attributes[type][attribute].value) + '</' + type + '>';
      }
      if (config.minimizedAttributeName !== "") {
        if (block.minimized) {
          blockData += '<string id="' + config.minimizedAttributeName + '">yes</string>';
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

    if (blockLoader.getDefinitionByName(block.name).useNameAttributeAsTagName) {
      blockData += "</" + block.name + '>';
    } else {
      blockData += "</" + block.type + '>';
    }

    if (block.commented) {
      blockData += "-->";
    }

    if (depth + 1 < config.topLevelBlocksContainer.length) {
      blockData += "</" + config.topLevelBlocksContainer[depth + 1] + ">";
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

/**
 * Receives an object containing all blocks and their respective data, must convert it to a string that will be written in a file
 * TODO: Block object desc
 */
module.exports.convertToString = (blocks, blocksDefinitionConfig) => {
  let xmlData = '<?xml version="1.0" ?>';

  if (config.topLevelBlocksContainer.length > 0) {
    xmlData += "<" + config.topLevelBlocksContainer[0] + ">";
  }

  for (let i = 0; i < tab.blocks.length; ++i) {
    xmlData += getXMLRecursively(tab.blocks[i]);
  }

  if (config.topLevelBlocksContainer.length > 0) {
    xmlData += "</" + config.topLevelBlocksContainer[0] + ">";
  }

  return "";
};

/**
 * Receives a string in the format specified in the toString function, must recreate the object that was received in the toString function
 * TODO: Block object desc
 */
module.exports.parse = (str) => {
  return {};
};
