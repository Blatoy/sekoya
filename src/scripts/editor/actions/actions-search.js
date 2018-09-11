// TODO: Create a class instead of coding everything in here
module.exports.registerActions = () => {
  let divSearchContainer = document.getElementById("search-container");
  let inputSearch = document.getElementById("search-block-text");
  let searchIndex = 0;
  let searchResults = [];

  actionHandler.addAction({
    name: "search: display",
    action: () => {
      divSearchContainer.style.display = "block";
      inputSearch.focus();
      inputSearch.select();

      inputSearch.oninput = () => {
        let allBlocks = rootBlock.getChildrenRecursively();
        let searchedValue = inputSearch.value.toLowerCase();
        searchResults = [];

        // I'm open for cool search, but searching for nothing is useless
        if (searchedValue.length > 0) {
          for (let i = 0; i < allBlocks.length; ++i) {
            // TODO: Cool search maybe?
            let foundInAttributes = false;
            for (let type in allBlocks[i].attributes) {
              for (let attributeName in allBlocks[i].attributes[type]) {
                if (allBlocks[i].attributes[type][attributeName].value.toLowerCase().includes(searchedValue)) {
                  foundInAttributes = true;
                  break;
                }
              }
              if (foundInAttributes) {
                break;
              }
            }
            if (allBlocks[i].name.toLowerCase().includes(searchedValue) || foundInAttributes) {
              searchResults.push(allBlocks[i]);
              allBlocks[i].searchSelected = true;
            } else {
              allBlocks[i].searchSelected = false;
            }
          }
        }

        searchIndex = 0;
        document.getElementById("search-result-current").textContent = 1;
        document.getElementById("search-result-total").textContent = searchResults.length;

        if (searchResults.length > 0) {
          document.getElementById("search-result").style.display = "block";
          document.getElementById("no-search-result").style.display = "none";
          searchResults[0].setSelected(true);
        } else {
          document.getElementById("search-result").style.display = "none";
          document.getElementById("no-search-result").style.display = "block";
        }
      };
    },
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "search: hide",
    action: () => {
      let allBlocks = rootBlock.getChildrenRecursively();
      allBlocks.forEach((block) => {
        block.searchSelected = false;
      });

      searchResults = [];
      inputSearch.value = "";
      document.getElementById("search-result").style.display = "none";
      document.getElementById("no-search-result").style.display = "block";
      divSearchContainer.style.display = "none";
    },
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "search: next result",
    action: () => {
      if (searchResults.length > 0) {
        searchIndex++;
        if (searchIndex >= searchResults.length) {
          searchIndex = 0;
        }

        searchResults[searchIndex].setSelected(true);
        document.getElementById("search-result-current").textContent = searchIndex + 1;
      }
    },
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "search: previous result",
    action: () => {
      if (searchResults.length > 0) {
        searchIndex--;
        if (searchIndex < 0) {
          searchIndex = searchResults.length - 1;
        }

        searchResults[searchIndex].setSelected(true);
        document.getElementById("search-result-current").textContent = searchIndex + 1;
      }
    },
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });
};
