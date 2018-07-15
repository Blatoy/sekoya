let Block = require(basePath + '/src/scripts/editor/block.js');
let root = new Block("root", "root", {x: 15, y: 15}, "root", {});

// Test
root.children.push(new Block("lockPlayerInputSpecificButtons", "actions", {x: 300, y : 0}, "normal", {}, [], root));
root.children.push(new Block("branch", "conditions", {x: 300, y : 60}, "normal", {}, [], root));

let blocks = [root];
blocks.push(new Block("branch", "conditions", {x: 15, y : 150}, "normal", {}, [
  new Block("lockPlayerInputSpecificButtons", "actions", {x: 300, y : 0}, "normal")
]));

module.exports.getBlocks = function() {
  return blocks;
}
