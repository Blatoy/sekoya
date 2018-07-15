const Block = require(basePath + '/src/scripts/editor/block.js');
const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");

const root = new Block("root", "root", {x: 15, y: 15}, "root", {});
let blocks = [root];

module.exports.addBlock = (block) => {
  blocks.push(block);
};

module.exports.getBlocks = () => {
  return blocks;
}
/*

let tmpBlock = new Block("branch", "conditions", {x: 15, y : 150}, "normal");
tmpBlock.children.push(new Block("lockPlayerInputSpecificButtons", "actions", {x: 300, y : 0}, "normal", {}, [], tmpBlock));
tmpBlock.children.push(new Block("branch", "conditions", {x: 300, y : 0}, "normal", {}, [], tmpBlock));

blocks.push(tmpBlock);
*/
