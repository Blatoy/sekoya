/*const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");
const blockLoader = require(basePath + "/src/scripts/editor/menu-block-loader.js");
const dataManager = require(basePath + "/src/scripts/editor/data-manager.js");
const mainUpdater = require(basePath + "/src/scripts/editor/main-updater.js");
const Block = require(basePath + "/src/scripts/editor/block.js");
const canvasStyle = require(basePath + '/src/scripts/utils/theme-loader.js').canvasStyle;

const SEARCH_TYPES = {
  BLOCKS: 0,
  ACTIONS: 1,
  LINKED_BLOCKS: 2,
  LINKED_ELSE_BLOCKS: 3
};


let type = SEARCH_TYPES.BLOCKS;









function executeSelectedAction(index = -1) {
  if (index == -1) {
    index = selectedIndex;
  }

  let results = document.getElementsByClassName("quick-access-bar-result");
  let selectedItemValue = results[index].getAttribute("action");

  hideQuickBar();
  switch (type) {
    case SEARCH_TYPES.ACTIONS:
      actionHandler.executeAction(selectedItemValue);
      break;
    case SEARCH_TYPES.LINKED_ELSE_BLOCKS:
    case SEARCH_TYPES.LINKED_BLOCKS:
    case SEARCH_TYPES.BLOCKS:
      let selectedBlockProperties = blockLoader.getBlockDefinitionList()[selectedItemValue];
      let lastSelectedBlock = mainUpdater.getLastSelectedBlock();
      let newBlock = new Block(selectedBlockProperties.name, selectedBlockProperties.type, {
        x: canvasMousePos.x - canvasStyle.blocks.size.width / 2,
        y: canvasMousePos.y - canvasStyle.blocks.size.height / 2
      }, selectedBlockProperties.properties, "", [], false, true);

      if (type == SEARCH_TYPES.LINKED_BLOCKS) {
        newBlock.parent = lastSelectedBlock;
        if (lastSelectedBlock) {
          lastSelectedBlock.children.push(newBlock);
        }
        newBlock.parent.autoLayout();
        mainUpdater.setLastSelectedBlock(newBlock);
      } else {
        dataManager.addBlock(newBlock);
      }
      break;
  }
  return true;
}




init();*/
