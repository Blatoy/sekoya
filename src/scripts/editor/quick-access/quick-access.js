const quickAccessDisplay = require("./quick-access-display.js");

let selectedIndex = 0;
let sourceArray = [],
  onResultSelected = () => {},
  caption = "";

function attachType(caption_, sourceArray_, onResultSelected_) {
  sourceArray = sourceArray_;
  onResultSelected = onResultSelected_;
  caption = caption_;
}

function compareByScore(a, b) {
  if (a.score > b.score) {
    return -1;
  } else if (a.score === b.score) {
    if (a.displayName.length > b.displayName.length) {
      return 1;
    } else {
      return -1;
    }
  } else {
    return 1;
  }
}

// results: [{displayName: ..., score: 3, characterMatchIndexes: []}]
function getResultArray(search) {
  let results = [];
  for (let i = 0; i < sourceArray.length; ++i) {
    let result = getSearchScoreAndCharactersMatchIndexes(search, sourceArray[i].displayName);
    results.push({
      displayName: sourceArray[i].displayName,
      actionName: sourceArray[i].actionName,
      score: result.score,
      characterMatchIndexes: result.characterMatchIndexes
    });
  }
  results.sort(compareByScore);
  return results;
}

function switchSelectedResult(direction) {
  return quickAccessDisplay.switchSelectedResult(direction);
}

function executeSelectedAction(displayName = false) {
  let selectedAction = displayName || quickAccessDisplay.getSelectedResultAction();
  if (!selectedAction) {
    return false;
  } else {
    hide();
    onResultSelected(selectedAction);
    return true;
  }
}

function hide() {
  quickAccessDisplay.hide();
}

function display() {
  let actionSuccessful = quickAccessDisplay.show(caption);
  quickAccessDisplay.displaySearchResults(getResultArray(""));
  return actionSuccessful;
}

function getSearchScoreAndCharactersMatchIndexes(search, text) {
  let score = 0,
    lastCharacterMatchIndex = 0;
  let characterMatchIndexes = [];

  // Make it easier to find stuff
  /*search = search.toLowerCase();
  text = text.toLowerCase();*/

  // Highest priority is set for exact match
  if (search == text) {
    return {
      score: Infinity,
      characterMatchIndexes: [...Array(text.length).keys()] // Generate an array containing [1, 2, 3, ..., text.length - 1]
    };
  } else if (text.includes(search)) {
    // Bonus points if the text is included, no matter the position
    score++;
  }

  // TODO: Check if it feels better with spaces,
  // search = search.replace(/\s/, "");

  for (let i = 0; i < search.length; ++i) {
    let found = false;

    for (let j = lastCharacterMatchIndex; j < text.length; ++j) {
      if (search[i].toLowerCase() === text[j].toLowerCase()) {
        // Found a match
        score++;
        found = true;
        characterMatchIndexes.push(j);

        // Like in mario party, we give bonus score
        // First letter match / 2 contiguous letters
        if (j == 0 || j == lastCharacterMatchIndex || (j > 1 && text[j - 1] === " ") || text[j] === text[j].toUpperCase()) {
          score++;
        }

        lastCharacterMatchIndex = j + 1;
        break;
      }
    }
    if (!found) {
      score--;
    }
  }

  return {
    score: score,
    characterMatchIndexes: characterMatchIndexes
  };
}

module.exports.display = display;
module.exports.hide = hide;
module.exports.attachType = attachType;
module.exports.getResultArray = getResultArray;
module.exports.switchSelectedResult = switchSelectedResult;
module.exports.executeSelectedAction = executeSelectedAction;