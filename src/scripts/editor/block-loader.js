const xmlConverter = require("xml-js");
const fs = require("fs");
const path = require("path");

const LOCAL_BLOCKS_DEFINITIONS_PATH = basePath + "/blocks-definitions";

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
          help: {},
          name: path.basename(blocksDefinitionFolderPath)
        };

        blockDefinitionLoadingPromises.push(new Promise((resolve, reject) => {
          // Config and help
          let loadingConfigPromise = getJSONFromFile(blocksDefinitionFolderPath + path.sep + "config.json");
          let loadingHelpPromise = getJSONFromFile(blocksDefinitionFolderPath + path.sep + "help.json");
          let loadingStylePromise = getJSONFromFile(blocksDefinitionFolderPath + path.sep + "style.json");

          Promise.all([loadingConfigPromise, loadingHelpPromise, loadingStylePromise]).then((values) => {
            blockDefinition.config = values[0];
            blockDefinition.help = values[1];
            blockDefinition.style = values[2];

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
                            type: blockType,
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
