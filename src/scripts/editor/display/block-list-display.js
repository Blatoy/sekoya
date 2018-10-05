let currentBlockDefinition = "";

module.exports.setLeftMenuBlocks = (definitionName) => {
  if (definitionName === currentBlockDefinition) {
    return false;
  }

  let divBlockList = document.getElementById("block-list");
  divBlockList.innerHTML = "<span class=\"block-title\">Blocks</span>";

  let blockDefinitions = false;

  blockLoader.getBlocksDefinitionsList().forEach((blockDefinition) => {
    if (blockDefinition.name === definitionName) {
      blockDefinitions = blockDefinition.blocks;
    }
  });;

  if (!blockDefinitions) {
    let spanError = document.createElement("span");
    let spanErrorInfo = document.createElement("span");
    spanError.classList.add("block-header");
    spanError.innerHTML = "<br>Cannot load block definition file \"" + definitionName + "\".<br><br>Please check the the config";

    divBlockList.appendChild(spanError);
    divBlockList.appendChild(spanErrorInfo);
    return false;
  }

  for (let blockCategory in blockDefinitions) {
    let spanBlockCategory = document.createElement("span");
    let divBlockCategoryList = document.createElement("div");

    divBlockCategoryList.classList.add("block-category-list");
    spanBlockCategory.classList.add("block-header");
    spanBlockCategory.textContent = blockCategory[0].toUpperCase() + blockCategory.slice(1);
    divBlockList.appendChild(spanBlockCategory);

    for (let blockName in blockDefinitions[blockCategory]) {
      if (blockDefinitions[blockCategory][blockName].hidden) {
        continue;
      }

      let spanBlock = document.createElement("span");
      spanBlock.classList.add("block");
      if (blockDefinitions[blockCategory][blockName].displayName) {
        spanBlock.textContent = blockDefinitions[blockCategory][blockName].displayName;
      } else {
        spanBlock.textContent = blockDefinitions[blockCategory][blockName].name;
      }

      spanBlock.onmousedown = () => {
        let newBlock = new Block(blockDefinitions[blockCategory][blockName], false, false, []);
        newBlock.position.x = global.mouse.cameraX - newBlock.size.width / 2;
        newBlock.position.y = global.mouse.cameraY - newBlock.size.height / 2;
        newBlock.isNewDraggedBlock = true;

        actionHandler.trigger("blocks: add block", {
          block: newBlock
        });
      };

      divBlockCategoryList.appendChild(spanBlock);
    }
    divBlockList.appendChild(divBlockCategoryList);
  }
};