const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");
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

let accessBarBackground = document.getElementById("quick-access-bar-background");
let accessBarInput = document.getElementById("quick-access-bar-input");
let accessBarResults = document.getElementById("quick-access-bar-results");
let accessBarTitle = document.getElementById("quick-access-bar-caption");
let accessBarVisible = false;
let type = SEARCH_TYPES.BLOCKS;
let selectedIndex = 0;

function compareByScore(a, b) {
  if (a.searchResult.score > b.searchResult.score) {
    return -1;
  } else {
    return 1;
  }
}

function init() {
  accessBarInput.oninput = (e) => {
    setResultListContent(accessBarInput.value);
  };

  accessBarBackground.onclick = (event) => {
    if (event.target == accessBarBackground) {
      hideQuickBar();
    }
  };
}

function displayQuickBar(searchType) {
  if (accessBarVisible) {
    return false;
  } else {
    accessBarVisible = true;
    accessBarBackground.style.display = "block";
    accessBarResults.innerHTML = "";
    accessBarInput.value = "";
    accessBarInput.focus();
    let title = "";

    switch (type) {
      case SEARCH_TYPES.BLOCKS:
        title = "Add block";
        break;
      case SEARCH_TYPES.ACTIONS:
        title = "Quick action";
        break;
      case SEARCH_TYPES.LINKED_BLOCKS:
        title = "Add linked block";
        break;
      case SEARCH_TYPES.LINKED_ELSE_BLOCKS:
        title = "Add linked else block";
        break;
    }

    accessBarTitle.textContent = title;

    setResultListContent("");
    return true;
  }
}

function handleSelectedResult(index = 0) {
  selectedIndex += index;
  let results = document.getElementsByClassName("quick-access-bar-result");
  if (selectedIndex < 0) {
    selectedIndex = 0;
  } else if (selectedIndex > results.length - 1) {
    selectedIndex = results.length - 1;
  }

  for (let i = 0; i < results.length; ++i) {
    results[i].classList.remove("selected");
    if (i == selectedIndex) {
      results[i].classList.add("selected");
      if (results[i].offsetTop > results[i].parentElement.clientHeight || i == 0) {
        results[i].parentElement.scrollTo(0, results[i].offsetTop - results[i].parentElement.clientHeight);
      }
    }
  }
}

function hideQuickBar() {
  if (accessBarVisible) {
    accessBarVisible = false;
    accessBarBackground.style.display = "none";
    return true;
  } else {
    return false;
  }
}

function getSearchScoreAndMatchIndexes(search, text) {
  let score = 0;
  let lastMatchIndex = 0;
  let matchIndexes = [];

  search = search.toLowerCase();
  text = text.toLowerCase();

  if (search == text) {
    return {
      score: Infinity,
      indexes: [...Array(text.length).keys()]
    };
  }

  search = search.replace(/\s/, "");

  for (let i = 0; i < search.length; ++i) {
    let found = false;
    for (let j = lastMatchIndex; j < text.length; ++j) {
      if (search[i] == text[j]) {
        score++;
        // Increase if the first letter match
        if (j == 0) {
          score++;
        }

        // Increase score if 2 letters are contiguous
        if (j == lastMatchIndex) {
          score++;
        }

        matchIndexes.push(j);
        lastMatchIndex = j + 1;
        found = true;
        break;
      }
    }
    if (!found) {
      return {
        score: 0,
        indexes: []
      };
    }
  }

  return {
    score: score / text.length,
    indexes: matchIndexes
  };
}

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

function setResultListContent(search) {
  // Clear current serach
  let results = [];
  selectedIndex = 0;
  accessBarResults.innerHTML = "";
  accessBarResults.scrollTo(0, 0);

  switch (type) {
    case SEARCH_TYPES.ACTIONS:
      let actions = actionHandler.getActions();

      for (let key in actions) {
        results.push({
          text: key,
          searchResult: getSearchScoreAndMatchIndexes(search, key)
        });
      }
      break;
    case SEARCH_TYPES.LINKED_ELSE_BLOCKS:
    case SEARCH_TYPES.LINKED_BLOCKS:
    case SEARCH_TYPES.BLOCKS:
      let blockDefinitionList = blockLoader.getBlockDefinitionList();

      for (let key in blockDefinitionList) {
        results.push({
          text: key,
          searchResult: getSearchScoreAndMatchIndexes(search, blockDefinitionList[key].name)
        });
      }
      break;
  }

  results.sort(compareByScore);

  for (let i = 0; i < results.length; ++i) {
    let result = results[i];
    let resultContainer = document.createElement("div");
    resultContainer.classList.add("quick-access-bar-result");
    if (i == 0) {
      resultContainer.classList.add("selected");
    }
    resultContainer.onclick = () => {
      executeSelectedAction(i);
    };

    resultContainer.setAttribute("action", result.text);

    for (let j = 0; j < result.text.length; ++j) {
      let letter = result.text[j];
      if (result.searchResult.indexes.includes(j)) {
        let characterMatchSpan = document.createElement("span");
        characterMatchSpan.classList.add("quick-access-bar-result-character-match");
        characterMatchSpan.textContent = letter;
        resultContainer.append(characterMatchSpan);
      } else {
        resultContainer.append(letter);
      }
    }
    accessBarResults.append(resultContainer);
  }
}

actionHandler.addAction("quick access bar add block", () => {
  type = SEARCH_TYPES.BLOCKS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar add linked block", () => {
  type = SEARCH_TYPES.LINKED_BLOCKS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar add linked else block", () => {
  type = SEARCH_TYPES.LINKED_ELSE_BLOCKS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar previous result", () => {
  return handleSelectedResult(-1);
});

actionHandler.addAction("quick access bar next result", () => {
  return handleSelectedResult(1);
});

actionHandler.addAction("quick access bar display", () => {
  type = SEARCH_TYPES.ACTIONS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar select action", () => {
  if (!accessBarVisible) return false;
  return executeSelectedAction();
}, 1000);

actionHandler.addAction("quick access bar hide", () => {
  return hideQuickBar();
  //  closeTab(tabs.indexOf(getCurrentTab()));
}, 1000);

init();
