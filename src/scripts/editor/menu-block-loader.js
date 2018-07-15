const xml2js = require("xml2js");
const fs = require("fs");
const config = require(basePath + '/config/general.json');
const dataManager = require(basePath + '/src/scripts/editor/data-manager.js');
const Block = require(basePath + '/src/scripts/editor/block.js');
const canvasStyle = require(basePath + '/src/scripts/utils/theme-loader.js').canvasStyle;

let blockDefinitionList = {};

module.exports.load = function() {
  // Get file specified in the settings
  fs.readFile(basePath + '/block-definitions/' + config.blockDefinitionFile, 'utf-8', function(err, xml) {
    xml2js.parseString(xml, function(err, result) {
      // Light frormat check
      if (result.blockdefinitions) {
        for (let blockGroupKey in result.blockdefinitions) {
          if (blockGroupKey == "predefined_values") {
            continue;
          }

          // Block categories
          let blockTitleSpan = document.createElement("span");

          blockTitleSpan.classList.add("block-header");
          blockTitleSpan.textContent = blockGroupKey[0].toUpperCase() + blockGroupKey.slice(1);

          document.getElementById("block-list").appendChild(blockTitleSpan);

          // List all blocks
          // blockdefinitions > actions > 0 > action > array > $.name
          for (let k in result.blockdefinitions[blockGroupKey]) { // 0
            for (let l in result.blockdefinitions[blockGroupKey][k]) { // "action"
              for (let blockKey in result.blockdefinitions[blockGroupKey][k][l]) {
                let blockName = result.blockdefinitions[blockGroupKey][k][l][blockKey]["$"].name;
                let blockProperties = [];
                for (let m in result.blockdefinitions[blockGroupKey][k][l][blockKey]) {
                  if (m == "$") continue;
                  blockProperties.push(result.blockdefinitions[blockGroupKey][k][l][blockKey][m]);
                }

                blockDefinitionList[blockName] = {
                  name: blockName,
                  properties: blockProperties,
                  type: blockGroupKey
                };

                let blockNameElement = document.createElement("span");

                blockNameElement.classList.add("block");
                blockNameElement.textContent = blockName;

                blockNameElement.onmousedown = () => {
                  dataManager.addBlock(new Block(blockName, blockGroupKey, {
                    x: canvasMousePos.x - canvasStyle.blocks.size.width / 2,
                    y: canvasMousePos.y - canvasStyle.blocks.size.height / 2
                  }, blockProperties.slice(), "", [], false, true));
                };

                blockNameElement.setAttribute("name", blockName);
                document.getElementById("block-list").appendChild(blockNameElement);
              }
            }
          }
        }
      }
    });
  });
}
