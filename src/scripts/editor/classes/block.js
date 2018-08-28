// TODO: Add memoization to improve performances

// Note: do not confuse the "displayed" root that is specific to awesomenauts block definition and
// the hidden root that all blocks must be attached to
let root;
let selectedBlock;

let copiedBlocks = [];

let mouseOverAnyBlock = false;
let leftClickReleased = true;
let selectingBlocks = false;
let blockLinkingInProgress = false;

let mouseClickPositionRelativeToBlock = {
  x: 0,
  y: 0
};

let mouseClickPosition = {
  x: 0,
  y: 0
};

function compare(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

function getLinkStyleProperty(type, property) {
  if (STYLE.LINKS[type] && STYLE.LINKS[type][property] !== undefined) {
    return STYLE.LINKS[type][property];
  } else {
    return STYLE.LINKS["all"][property];
  }
}

function getBlockStyleProperty(type, property) {
  if (STYLE.BLOCKS[type] && STYLE.BLOCKS[type][property] !== undefined) {
    return STYLE.BLOCKS[type][property];
  } else {
    return STYLE.BLOCKS["all"][property];
  }
}

class Block {
  constructor(blockDefinition, parent = false, linkToParentType = false, children = [], position = {
    x: 0,
    y: 0
  }) {

    this.name = blockDefinition.name;
    this.type = blockDefinition.type;
    this.attributes = {};
    this.attributeCount = 0;
    this.minimized = false;

    this.propertyDialogDisplayed = true;

    this.children = children;
    this.parent = parent;
    this.isRoot = blockDefinition.isRoot || false;

    this.isNewDraggedBlock = false;
    this.mouseOver = false;
    this.selected = false;
    this.selectedForGroupAction = false;
    this.dragged = false;

    this.linkingInProgress = false;
    this.linkingLinkTypeIndex = 0;
    this.linkToParentType = "";
    this.linkToParentProperties = {};
    this.startLinkingLinkAllowed = true;

    this.position = position;
    this.blockMovedPosition = {x: this.position.x, y: this.position.y};

    this.size = getBlockStyleProperty(this.type, "size");
    this.commentHeight = 0;

    this.style = {
      attributeColor: getBlockStyleProperty(this.type, "attributeColor"),
      color: getBlockStyleProperty(this.type, "color"),
      margin: getBlockStyleProperty(this.type, "margin"),
      font: getBlockStyleProperty(this.type, "font"),
      selected: getBlockStyleProperty(this.type, "selectedBorder"),
      blockBelowParentMargin: getBlockStyleProperty(this.type, "blockBelowParentMargin"),
      border: getBlockStyleProperty(this.type, "border"),
      comment: getBlockStyleProperty(this.type, "comment"),
      copySelectionColor: getBlockStyleProperty(this.type, "copySelectionColor"),
    };

    // Blocks cannot be orphan
    if (!parent && !blockDefinition.isRoot) {
      this.parent = root;
    }

    if (this.parent) {
      this.parent.addChild(this, linkToParentType);
    }

    // CLEANING: Check if it's truly necessary
    this.setLinkToParentType(linkToParentType);

    // Set everything to their default value and create the attribute object by copying everything
    for (let type in blockDefinition.blockPropertiesGroupedByType) {
      for (let i = 0; i < blockDefinition.blockPropertiesGroupedByType[type].length; ++i) {
        if (!this.attributes[type]) {
          this.attributes[type] = {};
        }

        let templateAttribute = blockDefinition.blockPropertiesGroupedByType[type][i];
        let defaultValue = templateAttribute.defaultvalue;

        if (!templateAttribute.defaultvalue) {
          if (config.defaultEmptyValues[type] !== undefined) {
            defaultValue = config.defaultEmptyValues[type];
          } else {
            defaultValue = "";
          }
        }

        let attribute = {
          value: defaultValue,
          defaultValue: templateAttribute.defaultvalue,
          name: templateAttribute.name,
          shortName: templateAttribute.shortName,
          predefinedValues: templateAttribute.values,
          multiSelect: templateAttribute.multiselect
        };

        this.attributeCount++;
        this.attributes[type][templateAttribute.name] = (attribute);
      }
    }

    // Eventually add a comment attribute
    if (config.commentAttributeName !== "") {
      if (this.attributes["string"] === undefined) {
        this.attributes["string"] = [];
      }

      this.attributeCount++;
      this.attributes["string"][config.commentAttributeName] = ({
        value: "",
        name: config.commentAttributeName
      });
    }
  }

  displayPropertyWindow() {
    this.propertyDialogDisplayed = true;
    global.dialogOpen = true;
    // Display background and handle closing
    let divBackground = document.getElementById("block-properties-background");
    divBackground.style.display = "block";
    divBackground.onclick = (event) => {
      if (event.target == divBackground) {
        actionHandler.trigger("blocks: close settings dialog and discard changes", false);
      }
    };

    // Settings caption
    let spanPropertiesCaption = document.getElementById("block-properties-caption");
    spanPropertiesCaption.textContent = "Block properties - " + this.name;

    // Properties container
    let divPropertiesInputList = document.getElementById("block-properties-inputs");
    divPropertiesInputList.innerHTML = "";

    let firstElementFocused = false;
    let hasComment = false,
      commentValue = "";
    let elementToFocus;

    for (let type in this.attributes) {
      for (let name in this.attributes[type]) {
        let attribute = this.attributes[type][name];

        // Add container and label
        let divPropertyContainer = document.createElement("div");
        divPropertyContainer.classList.add("property-container");

        let labelPropertyName = document.createElement("label");
        labelPropertyName.classList.add("property-label");
        labelPropertyName.textContent = name;

        divPropertyContainer.appendChild(labelPropertyName);

        let predefinedValues = blockLoader.getPredefinedValues()[attribute.predefinedValues];
        // The block has predefined values, it's either a select or checkboxes
        if (predefinedValues) {
          // Check boxes
          if (attribute.multiSelect) {
            let divCheckboxGroup = document.createElement("div");
            divCheckboxGroup.classList.add("checkbox-group");

            let selectedValues = attribute.value.split(config.multiSelectSeparator);

            // Makes sure we don't accidently delete any custom attributes that wouldn't be in the block definition
            for (let i = 0; i < selectedValues.length; ++i) {
              if (!predefinedValues.includes(selectedValues[i]) && selectedValues[i] !== "") {
                predefinedValues.push(predefinedValues[i]);
              }
            }

            for (let i = 0; i < predefinedValues.length; ++i) {
              let inputCheckBox = document.createElement("input");
              inputCheckBox.type = "checkbox";
              inputCheckBox.value = predefinedValues[i];
              inputCheckBox.id = "__" + i + "-" + predefinedValues[i];
              inputCheckBox.dataset.attributeType = type;
              inputCheckBox.dataset.attributeName = name;
              inputCheckBox.classList.add("property-checkbox")
              inputCheckBox.classList.add("__property-value-checkbox")

              if (selectedValues.includes(predefinedValues[i])) {
                inputCheckBox.checked = "checked";
              }

              let labelName = document.createElement("label");
              labelName.textContent = predefinedValues[i];
              labelName.htmlFor = inputCheckBox.id;

              if (i !== 0) {
                let newLine = document.createElement("br");
                divCheckboxGroup.appendChild(newLine);
              }

              if (!firstElementFocused) {
                elementToFocus = inputCheckBox;
                firstElementFocused = true;
              }

              divCheckboxGroup.appendChild(inputCheckBox);
              divCheckboxGroup.appendChild(labelName);
            }

            divPropertyContainer.appendChild(divCheckboxGroup);
          } else {
            // Select
            let select = document.createElement("select");
            let selectedElementFound = false; // Adds an option if the element isn't found to make sure we don't erase values
            select.classList.add("property-select");
            select.classList.add("__property-value")
            select.dataset.attributeType = type;
            select.dataset.attributeName = name;
            for (let i = 0; i < predefinedValues.length; ++i) {
              let option = document.createElement("option");
              option.textContent = predefinedValues[i];


              if (predefinedValues[i] === attribute.value) {
                option.selected = "selected";
                selectedElementFound = true;
              }

              select.appendChild(option);
            }

            if (!selectedElementFound && attribute.value !== "") {
              let option = document.createElement("option");
              option.textContent = attribute.value;
              option.value = attribute.value;
              option.selected = "selected";
              select.appendChild(option);
            }

            if (!firstElementFocused) {
              elementToFocus = select;
              firstElementFocused = true;
            }

            divPropertyContainer.appendChild(select);
          }
        } else {
          if (name === config.commentAttributeName) {
            hasComment = true;
            commentValue = attribute.value;
            continue;
          }
          // Normal input
          let inputText = document.createElement("input");
          inputText.type = "text";
          inputText.value = attribute.value;
          inputText.classList.add("property-input");
          inputText.classList.add("__property-value")
          inputText.dataset.attributeType = type;
          inputText.dataset.attributeName = name;

          if (!firstElementFocused) {
            elementToFocus = inputText;
            firstElementFocused = true;
          }

          divPropertyContainer.appendChild(inputText);
        }
        divPropertiesInputList.appendChild(divPropertyContainer);
        // This is a temp fix to prevent adding a space when focusing the input
        // using the "space" shortcut......
        setTimeout(() => {
          elementToFocus.focus();
        }, 5);
      }
    }

    if (hasComment) {
      let divPropertyContainer = document.createElement("div");
      divPropertyContainer.classList.add("property-container");

      let labelPropertyName = document.createElement("label");
      labelPropertyName.classList.add("property-label");
      labelPropertyName.textContent = config.commentAttributeName;

      divPropertyContainer.appendChild(labelPropertyName);

      let textareaComment = document.createElement("textarea");
      textareaComment.value = commentValue;
      textareaComment.classList.add("property-textarea");
      textareaComment.classList.add("__property-value")
      textareaComment.dataset.attributeType = "string";
      textareaComment.dataset.attributeName = config.commentAttributeName;

      divPropertyContainer.appendChild(textareaComment);
      divPropertiesInputList.appendChild(divPropertyContainer);

      if (!elementToFocus) {
        /// TODO:
        // FIX TAB REMOVING APP FOCUS
        // FIX LINK NOT WORKING (probably related to stuff with the changes in quick-access and action priority not acting when closed actually idk)
        //
        // This is a temp fix to prevent adding a space when focusing the input
        // using the "space" shortcut......
        setTimeout(() => {
          textareaComment.focus();
        }, 5);
      }
    }
  }

  closePropertyWindow(save = true) {
    if (save) {
      let propertyElementList = document.getElementsByClassName("__property-value");
      for (let i = 0; i < propertyElementList.length; ++i) {
        let propertyElement = propertyElementList[i];
        console.log(propertyElement.dataset.attributeName);
        this.attributes[propertyElement.dataset.attributeType][propertyElement.dataset.attributeName].value = propertyElement.value;
      }
      let propertyCheckboxList = document.getElementsByClassName("__property-value-checkbox");
      let checkedValues = [];
      let lastType = "",
        lastName = "";
      for (let i = 0; i < propertyCheckboxList.length; ++i) {
        let checkbox = propertyCheckboxList[i];
        if (lastName !== checkbox.dataset.attributeName) {
          if (lastName !== "") {
            this.attributes[lastType][lastName].value = checkedValues.join(config.multiSelectSeparator);
          }
          lastName = checkbox.dataset.attributeName;
          lastType = checkbox.dataset.attributeType;
        }
        if (checkbox.checked) {
          checkedValues.push(checkbox.value);
        }
      }
      if (lastName !== "") {
        this.attributes[lastType][lastName].value = checkedValues.join(config.multiSelectSeparator);
      }
    }

    this.propertyDialogDisplayed = false;
    global.dialogOpen = false;
    let divBackground = document.getElementById("block-properties-background");
    divBackground.style.display = "none";
  }

  // Returns true if linkType can be a child link of this block
  linkableTo(linkType) {
    if (config.connectionsTypes.length === 0) {
      return true;
    } else {
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (config.connectionsTypes[i].name === linkType) {
          return config.connectionsTypes[i].linkableTo.includes(this.type);
        }
      }
    }
    return false;
  }

  // Returns the Y position at which the block can be clicked, displayed and stuff, comments are
  // displayed ABOVE this value
  getYPosition() {
    return this.position.y + this.commentHeight;
  }

  getFullHeight() {
    let extraHeight = 0;

    // Attributes
    extraHeight += this.attributeCount * this.style.font.size;
    extraHeight += this.commentHeight;

    // Everything displayed below the parents count as the block's height
    this.children.forEach((child) => {
      if (getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
        extraHeight += child.getFullHeight();
      }
    });

    return this.size.height + this.style.margin.y + extraHeight;
  }

  getMaxRecursiveHeight(previousHeight = 0) {
    let childrenTotalHeight = 0;
    this.children.forEach((child) => {
      // This is already taken into account in the getFullHeight()
      if (!getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
        childrenTotalHeight += child.getMaxRecursiveHeight();
      }
    });
    return Math.max(childrenTotalHeight, this.getFullHeight());
  }

  // Changes the link linking this block to its parent
  // Note that a "false" link doesn't means there's no link
  setLinkToParentType(linkToParentType = false) {
    if (!linkToParentType) {
      // If not link specified, use the default one or false
      if (config.connectionsTypes[0]) {
        this.linkToParentType = config.connectionsTypes[0].name;
        this.linkToParentProperties = config.connectionsTypes[0];
      } else {
        this.linkToParentType = false;
      }
    } else {
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (config.connectionsTypes[i].name === linkToParentType) {
          this.linkToParentProperties = config.connectionsTypes[i];
          break;
        }
      }
      this.linkToParentType = linkToParentType;
    }
  }

  changeParent(newParent, linkToParentType = false, insertionIndex = -1) {
    if (newParent === this || (newParent === this.parent && this.linkToParentType === linkToParentType) || !newParent) {
      return false;
    }

    if (this.parent === newParent) {
      this.setLinkToParentType(linkToParentType);
      return true;
    }

    // Removes from current parent
    this.parent.children.splice(this.parent.children.indexOf(this), 1);

    this.parent = newParent;
    if (insertionIndex === -1) {
      newParent.children.push(this);
    } else {
      console.log("Inserting " + this.name + "at index", insertionIndex);
      newParent.children.splice(insertionIndex, 0, this);
    }


    this.setLinkToParentType(linkToParentType);
    return true;
  }

  // Should not really be used except in the constructor
  // Use changeParent instead! This will duplicate block and add sadness if used badly
  addChild(child, linkToParentType = false, insertionIndex = -1) {
    child.parent = this;
    if (insertionIndex === -1) {
      this.children.push(child);
    } else {
      this.children.splice(insertionIndex, 0, child);
    }

    if (this.isRoot && this.children.length === 1) {
      child.setSelected(true);
    }
  }

  getSibling(direction) {
    if (this.parent) {
      let blockIndex = this.parent.children.indexOf(this);
      if (this.parent.children[blockIndex + direction] !== undefined) {
        return this.parent.children[blockIndex + direction];
      } else {
        return false;
      }
    }
  }

  // Removes the block and all children
  deleteRecursive() {
    // root cannot be deleted
    if (this.parent) {
      this.isDeleted = true; // Used by undo add block to track what wants to be done
      if (this.selected) {
        let nextSibling = this.getSibling(1);
        let previousSibling = this.getSibling(-1);

        if (nextSibling !== false) {
          nextSibling.setSelected(true);
        } else if (previousSibling !== false) {
          previousSibling.setSelected(true);
        } else {
          this.parent.setSelected(true);
        }
      }

      return this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }
  }

  // Delete the block and attach the orphan to root
  delete() {
    if (this.isRoot) return false; // no

    while (this.children.length > 0) {
      this.children[0].changeParent(rootBlock);
    }

    // Note: delete recusive only delete this block since we removed all children
    this.deleteRecursive();
  }

  sortChildrenByYPosition() {
    this.children.sort((a, b) => {
      let sortOrderA = parseInt(a.linkToParentProperties.sortOrder);
      let sortOrderB = parseInt(b.linkToParentProperties.sortOrder);

      if (sortOrderA === sortOrderB) {
        return compare(a.position.y, b.position.y);
      } else {
        return compare(sortOrderA, sortOrderB);
      }
    });
    /*  this.children.sort(positionYComparator);
      this.children = stable(this.children, linkToParentComparator);*/
  }

  autoLayout(ignoreUndoStack = false) {
    if (this.isRoot) {
      const rootPosition = getBlockStyleProperty("all", "rootPosition");
      this.position.x = rootPosition.x - this.style.margin.x;
      this.position.y = rootPosition.y;
    }

    let totalRecursiveHeightCount = 0;
    let belowParentHeight = this.style.blockBelowParentMargin.y;
    let previousBlock = false;
    let previousIsBelowParent = false;

    this.children.forEach((child) => {
      let targetPosition = {x: 0, y: 0};
      if (getLinkStyleProperty(child.linkToParentType, "displayBelowParent") === true) {
        targetPosition = {
          x: this.position.x + this.style.blockBelowParentMargin.x,
          y: belowParentHeight + this.getYPosition()
        };
        belowParentHeight += child.getFullHeight();
      } else {
        if (previousBlock) {
          totalRecursiveHeightCount += previousBlock.getMaxRecursiveHeight();
        }

        targetPosition = {
          x: this.style.margin.x + this.position.x,
          y: totalRecursiveHeightCount + this.position.y
        };

        previousBlock = child;
      }

      actionHandler.trigger("blocks: move block", {
        block: child,
        oldPosition: {
          x: child.position.x,
          y: child.position.y
        },
        newPosition: {
          x: targetPosition.x,
          y: targetPosition.y
        }
      }, ignoreUndoStack, false, true);

      child.autoLayout(ignoreUndoStack);
    });
  }

  isPositionOver(x, y) {
    return y > this.position.y && y < this.position.y + this.size.height + this.commentHeight && x > this.position.x &&
      x < this.position.x + this.size.width;
  }

  setSelected(moveCamera = false) {
    if (this.isRoot) {
      if (this.children[1]) {
        if (selectedBlock) {
          selectedBlock.cancelBlockLinking();
          selectedBlock.selected = false;
        }
        this.children[1].setSelected();
        return;
      } else {
        return false;
      }
    } else {
      if (selectedBlock) {
        selectedBlock.cancelBlockLinking();
        selectedBlock.selected = false;
      }

      if (moveCamera) {
        camera.centerOnSmooth(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2);
      }

      this.selected = true;
      selectedBlock = this;
    }
  }

  isTerminalNode() {
    // TODO: Check for stuff like orblock that also has terminal nodes
    // and implement htis in the linking part
    //  let isTerminalNode = true;
    if (config.connectionsTypes.length <= 0) {
      return false;
    } else {
      // Is terminal node because of childrenAreTerminalNodes ?
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (this.linkToParentType === config.connectionsTypes[i].name && config.connectionsTypes[i].childrenAreTerminalNodes) {
          return true;
        }
      }

      // Can this be linked to anything?
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (config.connectionsTypes[i].linkableTo.includes(this.type)) {
          return false;
        }
      }
      return true;
    }
  }

  switchLinkingLinkType() {
    if (!this.linkingInProgress || config.connectionsTypes.length <= 0) {
      return false;
    }

    do {
      this.linkingLinkTypeIndex++;
      if (this.linkingLinkTypeIndex >= config.connectionsTypes.length) {
        this.linkingLinkTypeIndex = 0;
      }

    } while (!config.connectionsTypes[this.linkingLinkTypeIndex].linkableTo.includes(this.type));
  }

  // ooof it's way too late i'm probaly doing zork
  getNearestBlock(direction, axis, targetBlock = false, initialBlock = false, results = {
    bestDistance: Infinity,
    bestBlock: false
  }) {
    if (!initialBlock) {
      initialBlock = rootBlock;
    }

    if (!targetBlock) {
      targetBlock = this;
    }

    let bestBlock = this;

    initialBlock.children.forEach((child) => {
      let vx = child.position.x - targetBlock.position.x;
      let vy = child.position.y - targetBlock.position.y;
      let dist = Math.sqrt(vx ** 2 + vy ** 2);
      // crappy workaround for or blocks (and now also for other stuff)
      if (vy === 0 || vx === 0) {
        dist /= 100;
      }
      if (axis === "y" && (direction * child.position.y > direction * targetBlock.position.y) ||
        axis === "x" && (direction * child.position.x > direction * targetBlock.position.x)) {
        if (dist < results.bestDistance && child !== targetBlock) {
          results.bestDistance = dist;
          results.bestBlock = child;
        }
      }
      child.getNearestBlock(direction, axis, targetBlock, child, results);
    });

    return results;
  }

  // Move to previous / next sibling
  moveSelectedUpDown(direction) {
    let closestBlock = this.getNearestBlock(direction, "y").bestBlock;
    if (closestBlock) {
      closestBlock.setSelected(true);
    }
  }

  // Move to parent / first child
  moveSelectedLeftRight(direction) {
    let closestBlock = this.getNearestBlock(direction, "x").bestBlock;
    if (closestBlock) {
      closestBlock.setSelected(true);
    }
  }

  setSelectedChild() {
    if (this.children.length > 0) {
      this.children[0].setSelected(true);
      return true;
    }

    return false;
  }

  setSelectedParent() {
    if (!this.parent.isRoot) {
      this.parent.setSelected(true);
      return true;
    }

    return false;
  }

  setSelectedNextSibling() {
    let indexInParentArray = this.parent.children.indexOf(this);

    if (indexInParentArray < this.parent.children.length - 1) {
      this.parent.children[indexInParentArray + 1].setSelected(true);
      return true;
    }

    return false;
  }

  setSelectedPreviousSibling() {
    let indexInParentArray = this.parent.children.indexOf(this);

    if (indexInParentArray > 0) {
      this.parent.children[indexInParentArray - 1].setSelected(true);
      return true;
    }

    return false;
  }

  setSelectedLastSibling() {
    this.parent.children[this.parent.children.length - 1].setSelected(true);
  }

  setSelectedFirstSibling() {
    this.parent.children[0].setSelected(true);
  }

  setChildrenPositionRelative() {
    let totalRecursiveHeightCount = 0;
    this.children.forEach((child, i) => {
      if (i > 0) {
        totalRecursiveHeightCount += this.children[i - 1].getMaxRecursiveHeight();
      }

      child.position.x = this.style.margin.x + this.position.x;
      child.position.y = totalRecursiveHeightCount + this.position.y;
      child.setChildrenPositionRelative();
    });
  }

  cancelBlockLinking() {
    blockLinkingInProgress = false;
    this.linkingInProgress = false;
    this.linkingLinkTypeIndex = 0;
  }

  isRecursiveChild(block) {
    if (this === block || this.parent === block) {
      return true;
    } else if (this.isRoot) {
      return false;
    } else {
      return this.parent.isRecursiveChild(block);
    }
  }

  getSelectedForGroupAction() {
    let blocks = [];
    this.children.forEach((child) => {
      let childSelectedBlocks = child.getSelectedForGroupAction();
      for (let i = 0; i < childSelectedBlocks.length; ++i) {
        blocks.push(childSelectedBlocks[i]);
      }
      if (child.selectedForGroupAction) {
        blocks.push(child);
      }
    });
    return blocks;
  }

  handleMouseInteraction() {
    this.mouseOver = false;
    if (!selectingBlocks) {
      // Skip blocks if something was found
      if (!mouseOverAnyBlock && (!selectedBlock.dragged || this.dragged)) {
        // Handle mouse over display
        if (this.isPositionOver(global.mouse.cameraX, global.mouse.cameraY) && !global.dialogOpen) {
          if (!this.isRoot) {
            this.mouseOver = true;
            mouseOverAnyBlock = true;

            if (global.metaKeys.ctrl && global.mouse.buttons[1]) {
              this.selectedForGroupAction = true;
            }

            if (!this.dragged && global.mouse.buttons[1]) {
              this.dragged = true;

              this.blockMovedPosition.x = this.position.x;
              this.blockMovedPosition.y = this.position.y;

              mouseClickPositionRelativeToBlock = {
                x: this.position.x - global.mouse.cameraX,
                y: this.position.y - global.mouse.cameraY
              };
            }

            if (selectedBlock.linkingInProgress && (global.mouse.buttons[1] || global.mouse.buttons[3]) && !this.linkingInProgress && !selectedBlock.isRecursiveChild(this)) {
              this.startLinkingLinkAllowed = false;
              let linkChanged = actionHandler.trigger("blocks: link block", {
                targetBlock: this,
                parentBlock: selectedBlock,
                linkType: config.connectionsTypes[selectedBlock.linkingLinkTypeIndex] ? config.connectionsTypes[selectedBlock.linkingLinkTypeIndex].name : false
              });

              if (!global.metaKeys.ctrl && linkChanged) {
                selectedBlock.cancelBlockLinking();
              }
            }

            if (global.mouse.buttons[1] && !this.selected) {
              if (!global.metaKeys.ctrl) {
                this.setSelected();
              }
            }

            if (global.mouse.buttons[3] && !blockLinkingInProgress && this.startLinkingLinkAllowed) {
              this.setSelected();
              if (!this.isTerminalNode()) {
                blockLinkingInProgress = true;
                this.linkingInProgress = true;
              }
            }
          }
        }
      }

      if (this.dragged && !global.mouse.buttons[1]) {
        this.dragged = false;

        if (this.isNewDraggedBlock) {
          this.isNewDraggedBlock = false;
          /*actionHandler.trigger("blocks: sort children using position - no undo", {
            parentBlock: this.parent
          });*/
        } else {
          actionHandler.trigger("blocks: move block", {
            block: this,
            oldPosition: {
              x: this.blockMovedPosition.x,
              y: this.blockMovedPosition.y
            },
            newPosition: {
              x: this.position.x,
              y: this.position.y
            }
          });
        }
        actionHandler.trigger("blocks: sort children using position", {
          parentBlock: this.parent
        });
      }

      if (!global.mouse.buttons[3]) {
        this.startLinkingLinkAllowed = true;
      }
    } else {
      let x1 = mouseClickPosition.x,
        x2 = global.mouse.cameraX;
      let y1 = mouseClickPosition.y,
        y2 = global.mouse.cameraY;

      if (x2 < x1)[x1, x2] = [x2, x1];
      if (y2 < y1)[y1, y2] = [y2, y1];

      if (this.position.x + this.size.width > x1 && this.getYPosition() + this.size.height > y1 &&
        this.position.x < x2 &&
        this.getYPosition() < y2
      ) {
        this.selectedForGroupAction = true;
      } else {
        this.selectedForGroupAction = false;
      }
    }

    this.children.forEach((child) => {
      child.handleMouseInteraction();
    });
  }

  update() {
    mouseOverAnyBlock = false;
    this.handleMouseInteraction();

    if (!global.mouse.buttons["1"]) {
      leftClickReleased = true;
    } else {
      if (leftClickReleased) {
        leftClickReleased = false;
        mouseClickPosition.x = global.mouse.cameraX;
        mouseClickPosition.y = global.mouse.cameraY;
      }
    }

    if (selectedBlock.dragged) {
      selectedBlock.position.x = mouseClickPositionRelativeToBlock.x + global.mouse.cameraX;
      selectedBlock.position.y = mouseClickPositionRelativeToBlock.y + global.mouse.cameraY;
    } else if (global.mouse.buttons["1"]) {
      //  if (global.mouse.cameraX != mouseClickPosition.x && global.mouse.cameraY != mouseClickPosition.y) {
      if (!global.metaKeys.ctrl) {
        selectingBlocks = true;
      }
      //  }
    } else {
      if (selectingBlocks) {
        selectingBlocks = false;
      }
    }

    // Prevent changing the moving canvas cursor
    if (!global.mouse.buttons["2"]) {
      if (mouseOverAnyBlock) {
        document.getElementById("main-canvas").style.cursor = "pointer";
      } else {
        document.getElementById("main-canvas").style.cursor = "default";
      }
    }
  }

  renderConnections(ctx) {
    if (this.linkingInProgress) {
      const linkingType = config.connectionsTypes[this.linkingLinkTypeIndex] ? config.connectionsTypes[this.linkingLinkTypeIndex].name : "all";
      const dashInterval = getLinkStyleProperty(linkingType, "dashInterval");
      const baseLinkLength = getLinkStyleProperty(linkingType, "baseLength");

      ctx.strokeStyle = getLinkStyleProperty(linkingType, "color");
      ctx.lineWidth = getLinkStyleProperty(linkingType, "lineWidth");

      if (dashInterval == 0) {
        ctx.setLineDash([]);
      } else {
        ctx.setLineDash([dashInterval]);
      }

      ctx.beginPath();

      // Move to block
      ctx.moveTo(this.position.x + this.size.width, this.getYPosition() + this.size.height * 0.5);

      // Draw an arrow at the end of the line
      let x = (this.position.x + this.size.width) - global.mouse.cameraX;
      let y = (this.getYPosition() + this.size.height * 0.5) - global.mouse.cameraY;
      let angle = Math.atan2(y, x);

      ctx.lineTo(global.mouse.cameraX, global.mouse.cameraY);
      ctx.lineTo(global.mouse.cameraX + 20 * Math.cos(angle - Math.PI / 5), global.mouse.cameraY + 20 * Math.sin(angle - Math.PI / 5));
      ctx.moveTo(global.mouse.cameraX, global.mouse.cameraY);
      ctx.lineTo(global.mouse.cameraX + 20 * Math.cos(angle + Math.PI / 5), global.mouse.cameraY + 20 * Math.sin(angle + Math.PI / 5));

      ctx.stroke();
    }

    // Render links
    this.children.forEach((child, i) => {
      // We don't want to draw the connection from the hidden root to its children, except for the first element
      if (!this.isRoot || i == 0) {
        const dashInterval = getLinkStyleProperty(child.linkToParentType, "dashInterval");
        const baseLinkLength = getLinkStyleProperty(child.linkToParentType, "baseLength");

        ctx.strokeStyle = getLinkStyleProperty(child.linkToParentType, "color");
        ctx.lineWidth = getLinkStyleProperty(child.linkToParentType, "lineWidth");

        if (dashInterval == 0) {
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([dashInterval]);
        }

        ctx.beginPath();
        // Blocks displayed below their parent are styled in another manner
        if (!getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
          camera.drawSegment(ctx, this.position.x + this.size.width, this.getYPosition() + this.size.height * 0.5,
            this.position.x + this.size.width + baseLinkLength, this.getYPosition() + this.size.height * 0.5);
          camera.drawSegment(ctx, this.position.x + this.size.width + baseLinkLength, this.getYPosition() + this.size.height * 0.5,
            this.position.x + this.size.width + baseLinkLength, child.getYPosition() + child.size.height * 0.5);
          camera.drawSegment(ctx, this.position.x + this.size.width + baseLinkLength, child.getYPosition() + child.size.height * 0.5,
            child.position.x, child.getYPosition() + child.size.height * 0.5);
        } else {
          camera.drawSegment(ctx, this.position.x, this.getYPosition() + this.size.height,
            this.position.x, child.getYPosition() + child.size.height * 0.5);
          camera.drawSegment(ctx, this.position.x, child.getYPosition() + child.size.height * 0.5,
            child.position.x, child.getYPosition() + child.size.height * 0.5);
        }

        ctx.stroke();
      }

      child.renderConnections(ctx);
    });
  }

  getCommentLines(ctx) {
    let lines = [];

    if (!this.attributes["string"] || !this.attributes["string"][config.commentAttributeName]) {
      return lines;
    } else {
      let words = this.attributes["string"][config.commentAttributeName].value.split(" ");

      let currentLine = "";
      for (let i = 0; i < words.length; ++i) {
        if (ctx.measureText(currentLine + words[i]).width >= this.size.width * this.style.comment.width - this.style.comment.padding.left * 2) {
          lines.push(currentLine);
          currentLine = words[i] + " ";
        } else {
          currentLine += words[i] + " ";
        }
      }

      lines.push(currentLine);

      // probably not the best place to put this...
      this.commentHeight = (lines.length + 1) * this.style.font.size;

      return lines;
    }
  }

  isInView() {
    let bounds = camera.getBounds();
    if (this.position.x > bounds.x + bounds.width || this.position.y > bounds.y + bounds.height) {
      return false;
    }

    if (this.position.x + this.size.width < bounds.x || this.position.y + this.getFullHeight() < bounds.y) {
      return false;
    }

    return true;
  }

  render(ctx) {
    if (!this.isRoot && this.isInView(camera)) {
      if (this.attributes["string"] && this.attributes["string"][config.commentAttributeName] && this.attributes["string"][config.commentAttributeName].value) {

        if (this.style.comment.border.thickness > 0) {
          ctx.fillStyle = this.style.comment.border.color;
          ctx.fillRect(this.position.x - this.style.comment.border.thickness, this.position.y - this.style.comment.border.thickness,
            this.size.width * this.style.comment.width + this.style.comment.border.thickness * 2, this.commentHeight + this.style.comment.border.thickness * 2);
        }
        ctx.font = this.style.font.size + "px " + this.style.font.family;
        ctx.textBaseline = "top";
        ctx.fillStyle = this.style.comment.backgroundColor;
        ctx.fillRect(this.position.x, this.position.y, this.size.width * this.style.comment.width, this.commentHeight);
        ctx.fillStyle = this.style.comment.textColor;

        let lines = this.getCommentLines(ctx);
        for (let i = 0; i < lines.length; ++i) {
          ctx.fillText(lines[i], this.position.x + this.style.comment.padding.left, this.position.y + i * this.style.font.size + this.style.comment.padding.top)
        }
      }

      // Render block
      if (this.style.border) {
        ctx.fillStyle = this.style.border.color;
        ctx.fillRect(this.position.x - this.style.border.thickness, this.getYPosition() - this.style.border.thickness,
          this.size.width + this.style.border.thickness * 2, this.size.height + this.style.border.thickness * 2);
      }

      ctx.fillStyle = this.style.color;
      ctx.fillRect(this.position.x, this.getYPosition() /** this.style.font.size*/ , this.size.width, this.size.height);

      // Selection border
      if (this.selected) {
        ctx.strokeStyle = this.style.color;
        ctx.setLineDash([this.style.selected.dashInterval]);
        ctx.lineDashOffset = tick / this.style.selected.speedDivider;
        ctx.lineWidth = this.style.selected.width;

        ctx.strokeRect(this.position.x - this.style.selected.padding,
          this.getYPosition() - this.style.selected.padding,
          this.size.width + this.style.selected.padding * 2,
          this.size.height + this.style.selected.padding * 2);

        ctx.lineDashOffset = 0;
      }

      // Text is white or black depending on the colour of the block
      const textColour = ((
          parseInt(ctx.fillStyle.slice(1, 3), 16) +
          parseInt(ctx.fillStyle.slice(3, 5), 16) +
          parseInt(ctx.fillStyle.slice(5, 7), 16)) /
        3) <= 128 ? "white" : "black";

      // Mouse over color
      if (this.mouseOver) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(this.position.x, this.getYPosition(), this.size.width, this.size.height);
      }

      if (this.selectedForGroupAction) {
        ctx.fillStyle = this.style.copySelectionColor;
        ctx.fillRect(this.position.x, this.getYPosition(), this.size.width, this.size.height);
      }

      ctx.fillStyle = textColour;

      // Text
      if (camera.getScaling() > 0.3) {
        ctx.font = this.style.font.size + "px " + this.style.font.family;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        ctx.fillText(this.name  + " - " + this.parent.children.indexOf(this)  /* + " - " + selectedBlock.isRecursiveChild(this)  + " - " + this.getMaxRecursiveHeight() + " (" + this.getFullHeight() + ")"*/ , this.position.x + this.size.width * 0.5, this.getYPosition() + this.size.height * 0.5);
      }


      // DEBUG: Display blocks real height
      /*ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.getFullHeight());
      ctx.strokeStyle = "blue";
      ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.getMaxRecursiveHeight());*/


      ctx.textAlign = "left";
      ctx.fillStyle = this.style.attributeColor;
      ctx.textBaseline = "top";

      let lineCounter = 0;
      // Render attributes
      for (let type in this.attributes) {
        for (let i in this.attributes[type]) {
          // Skip comment (TODO: Skip IsMinimized)
          if (this.attributes[type][i].name !== config.commentAttributeName) {
            // Draw rect instead of text when zoomed out too much to increase performances
            if (camera.getScaling() < 0.4) {
              ctx.fillRect(this.position.x, this.size.height + this.getYPosition() + this.style.font.size * lineCounter, this.attributes[type][i].name.length * 5, 2);
            } else {
              let value = this.attributes[type][i].value === undefined ? "" : this.attributes[type][i].value + "";
              ctx.fillText((this.attributes[type][i].shortName || this.attributes[type][i].name) + ": " + value.slice(0, 15), this.position.x, this.size.height + this.getYPosition() + this.style.font.size * lineCounter);
            }
            lineCounter++;
          }
        }
      }
    }

    this.children.forEach((child) => {
      child.render(ctx);
    });

    if (this.isRoot) {
      // Render block selection
      if (selectingBlocks) {
        ctx.fillStyle = this.style.copySelectionColor;
        ctx.fillRect(mouseClickPosition.x, mouseClickPosition.y, -mouseClickPosition.x + global.mouse.cameraX, -mouseClickPosition.y + global.mouse.cameraY);
      }
    }
  }
}

Block.getSelectedBlock = () => {
  return selectedBlock;
};

Block.getLinkStyleProperty = getLinkStyleProperty;

root = new Block({
  name: "root",
  type: "root",
  isRoot: true
}, false);

root.autoLayout(true);

selectedBlock = root;

module.exports.rootBlock = root;
module.exports.Block = Block;
