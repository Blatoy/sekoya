let Block = require(basePath + '/src/scripts/editor/block.js');
let blocks = [new Block("root", "root", {x: 15, y: 15}, {}, [
  new Block("lockPLayerInputSpecificButtons", "actions", {x: 320, y: 0}),
  new Block("isSkillOnButtonAvailable", "conditions", {x: 320, y: 70}, {}, [
    new Block("buyUpgrade", "actions", {x: 320, y: 0}),
    new Block("log", "actions", {x: 320, y: 70})
  ]),
])];

module.exports.getBlocks = function() {
  return blocks;
}
