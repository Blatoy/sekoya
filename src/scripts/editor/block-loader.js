const xmlConverter = require("xml-js");
const fs = require("fs");
const path = require("path");

const LOCAL_BLOCKS_DEFINITIONS_PATH = basePath + "/blocks-definition";

let blocksDefinitionList = [];

function getBlocksDefinitionsList() {
  return new Promise((resolve, reject) => {
    // TODO: Concatenate this with the user located thingy
    fs.readdir(LOCAL_BLOCKS_DEFINITIONS_PATH, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.map((fileName) => {
          return LOCAL_BLOCKS_DEFINITIONS_PATH + path.sep + fileName;
        }));
      }
    });
  })
}

function getJSONFromFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, json) => {
      let result = false;

      if (err) {
        resolve(false);
      }

      try {
        result = JSON.parse(json);
      } catch (e) {
        console.log(e);
      }

      resolve(result);
    });
  });
}

function loadBlocksDefinitions() {
  return new Promise((resolve, reject) => {
    // Get definitions list
    getBlocksDefinitionsList().then((pathList) => {
      let blockDefinitionLoadingPromises = [];
      pathList.forEach((blocksDefinitionFolderPath) => {
        let blockDefinition = {
          predefinedValues: {},
          blocks: {},
          config: {},
          style: {},
          help: {}
        };

        blockDefinitionLoadingPromises.push(new Promise((resolve, reject) => {
          // Config and help
          let loadingConfigPromise = getJSONFromFile(blocksDefinitionFolderPath + path.sep + "config.json");
          let loadingHelpPromise = getJSONFromFile(blocksDefinitionFolderPath + path.sep + "help.json");
          let loadingStylePromise = getJSONFromFile(blocksDefinitionFolderPath + path.sep + "style.json");

          Promise.all([loadingConfigPromise, loadingHelpPromise, loadingStylePromise]).then((values) => {
            blockDefinition.config = values[0];
            blockDefinition.help = values[1];
            blockDefinition.help = values[2];

            if (blockDefinition.config !== false) {

              // Load predefined values and blocks
              fs.readFile(blocksDefinitionFolderPath + path.sep + "blocks-definition.xml", 'utf-8', (err, xml) => {
                if (err) {
                  console.log("Couldn't load block-definition.xml");
                  // TODO: Display file error to user
                }
                let blockDefintionObject = {};

                try {
                  blockDefintionObject = xmlConverter.xml2js(xml, {
                    compact: false
                  });

                  // Check if the file is matching what we are looking for
                  if (blockDefintionObject.elements.length === 1 && blockDefintionObject.elements[0].name == "blockdefinitions") {
                    let elements = blockDefintionObject.elements[0].elements;
                    elements.forEach((element) => {
                      // Predefined value object
                      if (element.name === blockDefinition.config.predefinedValuesTagName) {
                        blockDefinition.predefinedValues[element.attributes.id] = element.elements.map((element) => {
                          return element.elements[0].text
                        });
                      } else {
                        // Current block definition
                        let blockType = element.name;
                        blockDefinition.blocks[blockType] = {};

                        element.elements.forEach((element) => {
                          // element: {name: "condition", attributes: {name: "blockName", …}, elements: Array(3)}
                          let blockName = element.attributes.name;

                          // TODO: Change this to just a list of property since it's easier to do with the new xml2js lib
                          let propertiesGroupedByType = {};
                          if (element.elements) {
                            element.elements.forEach((element) => {

                              if (propertiesGroupedByType[element.name] === undefined) {
                                propertiesGroupedByType[element.name] = [];
                              }

                              let propertyAttributes = {};
                              propertyAttributes.name = element.attributes.name;

                              if (element.attributes.values) {
                                propertyAttributes.values = element.attributes.values;
                              }

                              if (element.attributes.defaultvalue) {
                                propertyAttributes.defaultvalue = element.attributes.defaultvalue;
                              }

                              propertiesGroupedByType[element.name].push(propertyAttributes);
                            });
                          }

                          blockDefinition.blocks[blockType][blockName] = {
                            name: blockName,
                            displayName: element.attributes.displayName ? element.attributes.displayName : blockName,
                            hidden: element.attributes.hidden ? true : false,
                            useNameAttributeAsTagName: element.attributes.useNameAttributeAsTagName === "1" ? true : false,
                            blockPropertiesGroupedByType: propertiesGroupedByType,
                            type: element.attributes.useNameAttributeAsTagName === "1" ? blockName : blockType,
                            preventInteraction: element.attributes.preventInteraction ? true : false
                          };
                        });
                      }
                    });
                    blocksDefinitionList
                    resolve(blocksDefinitionList);
                  } else {
                    console.error("Invalid block-definition format.")
                  }
                } catch (e) {
                  // TODO: Display file error to user
                  console.error(e);
                  console.error("Couldn't parse block-definition.xml");
                }
              });
            } else {
              // TODO: Display config error
              console.error("Couldn't load config");
            }
          });
        }));
        blocksDefinitionList.push(blockDefinition);
      });

      Promise.all(blockDefinitionLoadingPromises).then(() => {
        console.log("Loaded all block");
        resolve(blocksDefinitionList);
      });
    });
  });
}

module.exports.loadBlocksDefinitions = loadBlocksDefinitions;

module.exports.getBlocksDefinitionsList = () => {
  return blocksDefinitionList;
};


/*const xml2js = require("xml2js");
const fs = require("fs");

const blockDefinitions = {};
const predefinedValues = {};

module.exports.getPredefinedValues = () => {
  return predefinedValues;
};

module.exports.getDefinitionByName = (name) => {
  name = name.toLowerCase();
  for(let type in blockDefinitions) {
    for(let blockName in blockDefinitions[type]) {
      if(blockName.toLowerCase() === name || (blockDefinitions[type][blockName].useNameAttributeAsTagName && blockDefinitions[type][blockName].type.toLowerCase() === name)) {
        return blockDefinitions[type][blockName];
      }
    }
  }
  return false;
};

module.exports.getBlockDefinitions = () => {
  return blockDefinitions;
};

module.exports.loadBlockDefinitions = (onLoaded) => {
  // TODO: Handle properly if it doesn't exists
  fs.readFile(basePath + '/block-definitions/' + config.blockDefinitionFile, 'utf-8', function(err, xml) {
    xml2js.parseString(xml, function(err, result) {

      // TODO: Handle properly if invalid format
      if (result.blockdefinitions) {
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
    });
    onLoaded();
  });
};*/
