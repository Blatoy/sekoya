class Tab {
  constructor(name, blocks = [], fileLocation = "", selected = false) {
    this.tabHistory = {redo: [], undo: []};
    this.name = name;
    this.blocks = blocks;
    this.fileLocation = fileLocation;
    this.selected = selected;
    this.saved = true;
  }

  setSaved(saved) {
    this.saved = saved;
  }

  isSaved() {
    return this.saved;
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setHistory(history) {
    this.tabHistory.redo = history.redo;
    this.tabHistory.undo = history.undo;
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
