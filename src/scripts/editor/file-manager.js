const {
  dialog
} = require('electron').remote;
const fs = require("fs");
const xml2js = require("xml2js");
const path = require("path");
let canOpenDialog = true;

module.exports.openWithDialog = () => {
  if (!canOpenDialog) {
    return false;
  }

  canOpenDialog = false;

  dialog.showOpenDialog({
    defaultPath: config.defaultOpenFileLocation,
    properties: ['openFile', 'multiSelections'],
    filters: [{name: "XML file", extensions: ["xml"]}]
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

let validLinkTypes = {
  "normal": 1,
  "else": 1,
  "orblock": 1,
  "or": 1
};

function addBlockRecursively(xml, parentBlock) {
  //  console.log(xml);
  for (let attributeOrLinkToParentType in xml) {
    if (attributeOrLinkToParentType === "$") {
      continue;
    }

    for (let i = 0; i < xml[attributeOrLinkToParentType].length; ++i) {
      // Sooooo, here we have to separate linking type and attributes
      if (validLinkTypes[attributeOrLinkToParentType]) {
        for (let j in xml[attributeOrLinkToParentType][i]) {
          for (let k = 0; k < xml[attributeOrLinkToParentType][i][j].length; ++k) {
            if (xml[attributeOrLinkToParentType][i][j][k].$) {
              let blockName = xml[attributeOrLinkToParentType][i][j][k].$.id;
              let parent = new Block(blockLoader.getDefinitionByName(blockName), parentBlock, attributeOrLinkToParentType);

              xml[attributeOrLinkToParentType][i][j][k]
              addBlockRecursively(xml[attributeOrLinkToParentType][i][j][k], parent)
            } else {
              // orblock / andblock / ??? handling
              let blockName = j;

              let parent = new Block(blockLoader.getDefinitionByName(blockName), parentBlock, attributeOrLinkToParentType);
              addBlockRecursively(xml[attributeOrLinkToParentType][i][j][k], parent);
            }

          }
        }
      } else {
        if (!parentBlock.attributes[attributeOrLinkToParentType]) {
          parentBlock.attributes[attributeOrLinkToParentType] = {};
        }
        // console.log(xml[attributeOrLinkToParentType][i]);
        if (parentBlock.attributes[attributeOrLinkToParentType][xml[attributeOrLinkToParentType][i].$.id] === undefined) {
          parentBlock.attributes[attributeOrLinkToParentType][xml[attributeOrLinkToParentType][i].$.id] = {
            name: xml[attributeOrLinkToParentType][i].$.id,
          };
          parentBlock.attributeCount++;
        }
        //console.log(xml[attributeOrLinkToParentType][i]);
        parentBlock.attributes[attributeOrLinkToParentType][xml[attributeOrLinkToParentType][i].$.id].value = xml[attributeOrLinkToParentType][i]._ || "";
        /*  console.log(parentBlock.attributes[attributeOrLinkToParentType]);
          console.log(xml[attributeOrLinkToParentType][i].$.id);
          parentBlock.attributes[attributeOrLinkToParentType][xml[attributeOrLinkToParentType][i].$.id] = {

          };
          xml[attributeOrLinkToParentType][i].$._;*/
        //  console.log("ATTRIBUTE: ", attributeOrLinkToParentType, xml[attributeOrLinkToParentType][i]);
        // Attribute
      }
    }
  }
}

function open(file) {
  fs.readFile(file, 'utf-8', function(err, xml) {
    xml2js.parseString(xml, function(err, result) {
      // Make sure we don't have 2 tabs with the same file / location
      // Note: we don't check that sooner because readFile is async and we don't want to change tab before all the blocks
      // have been added
      if (!tabManager.handleNewTab(path.basename(file), path.dirname(file) + path.sep)) {
        return false;
      }

      let hiddenRoot = result.enemy;
      for (let i = 0; i < hiddenRoot.behaviour.length; ++i) {
        for (let blockType in hiddenRoot.behaviour[i]) {
          for (let j = 0; j < hiddenRoot.behaviour[i][blockType].length; ++j) {
            let blockName = hiddenRoot.behaviour[i][blockType][j].$.id;
            let parent = new Block(blockLoader.getDefinitionByName(blockName || blockType));

            addBlockRecursively(hiddenRoot.behaviour[i][blockType][j], parent);
          }
        }
      }
    })
  });
}
// TODO: Handle properly if invalid format
/*  if (result.blockdefinitions) {
    for (let blockCategory in result.blockdefinitions) {
      if (blockCategory == "predefined_values") {
        for(let i = 0; i < result.blockdefinitions[blockCategory].length; ++i) {
          predefinedValues[result.blockdefinitions[blockCategory][i].$.id] = result.blockdefinitions[blockCategory][i].value;
        }
      } else {
        blockDefinitions[blockCategory] = {};
        // [0] is there because there can only be one blockType
        for(let blockType in result.blockdefinitions[blockCategory][0]) {
          for(let j = 0; j < result.blockdefinitions[blockCategory][0][blockType].length; ++j) {
            let xmlBlock = result.blockdefinitions[blockCategory][0][blockType][j];

            let blockName = xmlBlock["$"].name;
            let displayName = xmlBlock["$"].displayName;
            let useNameAttributeAsTagName = xmlBlock["$"].useNameAttributeAsTagName === undefined ? false : true;
            let preventInteraction = xmlBlock["$"].preventInteraction === undefined ? false : true;
            let hidden = xmlBlock["$"].hidden === undefined ? false : true;
            let blockPropertiesGroupedByType = {};

            for(let propertyType in xmlBlock) {
              if(propertyType != "$") {
                blockPropertiesGroupedByType[propertyType] = [];
                // Append all properties by removing all the zork that is generated by xml2json
                for(let i = 0; i < xmlBlock[propertyType].length; ++i) {
                  // This mainly removes the $ because it's just annoying
                  // i'm annoyed
                  // this is annoying and unreadable
                  blockPropertiesGroupedByType[propertyType].push(xmlBlock[propertyType][i]["$"]);
                }
              }
            }

            blockDefinitions[blockCategory][blockName] = {
              name: blockName,
              displayName: displayName,
              hidden: hidden,
              useNameAttributeAsTagName: useNameAttributeAsTagName,
              blockPropertiesGroupedByType: blockPropertiesGroupedByType,
              type: blockType,
              preventInteraction: preventInteraction
            };
          }
        }
      }
    }
  }
}*/
