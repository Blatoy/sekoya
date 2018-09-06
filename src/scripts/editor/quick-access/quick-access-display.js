const quickAccess = require("./quick-access.js");

let elementBackground = document.getElementById("quick-access-bar-background");
let elementInput = document.getElementById("quick-access-bar-input");
let elementResults = document.getElementById("quick-access-bar-results");
let elementCaption = document.getElementById("quick-access-bar-caption");
let visible = false;
let selectedIndex = 0;
let resultCount = 0;

function addEvents() {
  elementInput.oninput = (e) => {
    displaySearchResults(quickAccess.getResultArray(elementInput.value));
  };

  elementBackground.onclick = (event) => {
    if (event.target == elementBackground) {
      hide();
    }
  };
}

function hide() {
  if (visible && global.dialogOpen) {
    global.dialogOpen = false;
    visible = false;
    elementBackground.style.display = "none";
    return true;
  } else {
    return false;
  }
}

function show(caption) {
  if (visible || global.dialogOpen) {
    return false;
  } else {
    setCaption(caption);
    global.dialogOpen = true;
    visible = true;
    elementBackground.style.display = "block";
    elementInput.value = "";
    elementInput.focus();
    elementResults.innerHTML = "";
    return true;
  }
}

function setCaption(name) {
  elementCaption.textContent = name;
}

function switchSelectedResult(direction) {
  if (!visible) {
    return false;
  }

  selectedIndex += direction;

  if (selectedIndex < 0) selectedIndex = 0;
  if (selectedIndex >= resultCount) selectedIndex = resultCount - 1;

  setSelectedResult(selectedIndex);
  return true;
}

function setSelectedResult(index) {
  let elementResultsChildren = elementResults.childNodes;
  selectedIndex = index;

  for (let i = 0; i < elementResultsChildren.length; ++i) {
    let childElement = elementResultsChildren[i];
    if (i == index) {
      childElement.classList.add("selected");

      if (childElement.offsetTop > elementResults.clientHeight) {
        elementResults.scrollTo(0, childElement.offsetTop - elementResults.clientHeight);
      } else {
        elementResults.scrollTo(0, 0);
      }
    } else {
      childElement.classList.remove("selected");
    }
  }
}

function getSelectedResultAction() {
  if (!visible) {
    return false;
  } else {
    let elementsResults = elementResults.childNodes;

    for (let i = 0; i < elementsResults.length; ++i) {
      let childElement = elementsResults[i];
      if (childElement.classList.contains("selected")) {
        return childElement.getAttribute("action");
      }
    }
  }
}

// results: [{actionName: ..., score: 3, characterMatchIndexes: []}]
function displaySearchResults(results) {
  elementResults.innerHTML = "";
  elementResults.scrollTo(0, 0);
  resultCount = results.length;
  selectedIndex = 0;

  for (let i = 0; i < results.length; ++i) {
    let result = results[i];

    let divResult = document.createElement("div");
    divResult.classList.add("quick-access-bar-result");

    if (i == 0) {
      divResult.classList.add("selected");
    }

    divResult.onclick = () => {
      quickAccess.executeSelectedAction(result.actionName);
    };

    divResult.setAttribute("action", result.actionName);

    for (let j = 0; j < result.displayName.length; ++j) {
      let letter = result.displayName[j];

      if (result.characterMatchIndexes.includes(j)) {
        let spanCharacterMatch = document.createElement("span");
        spanCharacterMatch.classList.add("quick-access-bar-result-character-match");
        spanCharacterMatch.textContent = letter;
        divResult.append(spanCharacterMatch);
      } else {
        divResult.append(letter);
      }
    }

    let accelerator = actionHandler.getActionAccelerator(result.actionName, true);
    if(accelerator != "") {
      divResult.innerHTML =divResult.innerHTML + ("<span class='quick-access-shortcut shortcut-background'>" + accelerator +"</span>")
    }

    elementResults.append(divResult);
  }
}

module.exports.hide = hide;
module.exports.show = show;
module.exports.addEvents = addEvents;
module.exports.setCaption = setCaption;
module.exports.switchSelectedResult = switchSelectedResult;
module.exports.setSelectedResult = setSelectedResult;
module.exports.getSelectedResultAction = getSelectedResultAction;
module.exports.displaySearchResults = displaySearchResults;
