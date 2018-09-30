class Tab {
  constructor(name, blockDefinition, blocks = [], fileLocation = "", selected = false) {
    this.history = {redo: [], undo: []};
    this.name = name;
    this.blocks = blocks;
    this.selectedBlock = false;
    this.cameraState = {x: 0, y: 0, scaling: 1}
    this.blockDefinition = blockDefinition;
    this.fileLocation = fileLocation;
    this.selected = selected;
    this.saved = true;
  }

  setSaved(state) {
    this.saved = state;
  }

  isSaved() {
    return this.saved;
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setHistory(history) {
    this.history.redo = history.redo;
    this.history.undo = history.undo;
  }

  setName(name) {
    this.name = name;
  }

  isSelected() {
    return this.selected;
  }

  getName() {
    return this.name;
  }

  getFileLocation() {
    return this.fileLocation + this.name;
  }

  getBlocks() {
    return this.blocks;
  }
}

module.exports = Tab;
