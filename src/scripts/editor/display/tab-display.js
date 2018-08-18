const divTabList = document.getElementById("tab-list");

function refreshView(tabs, selectTab, closeTab, renameTab) {
  // Remove all tabs
  divTabList.innerHTML = "";

  for (let i = 0; i < tabs.length; ++i) {
    let spanTabElement = document.createElement("span");
    spanTabElement.classList.add("tab-element");

    if (tabs[i].isSelected()) {
      spanTabElement.classList.add("tab-selected");
      document.title = "Sekoya - " + tabs[i].getFileLocation();
    }

    if (!tabs[i].isSaved()) {
      spanTabElement.classList.add("tab-unsaved");
    }

    spanTabElement.textContent = tabs[i].getName();

    spanTabElement.onmouseup = (e) => {
      if (!spanTabElement.getAttribute("renaming")) {
        switch (e.which) {
          case 1:
            selectTab(i);
            break;
          case 2:
            closeTab(i);
            break;
          case 3:
            // TODO: Open tab context menu instead
            let inputName = document.createElement("input");
            inputName.value = tabs[i].getName();
            inputName.classList.add("tab-input");
            inputName.setAttribute("type", "text");

            spanTabElement.innerHTML = "";
            spanTabElement.appendChild(inputName);

            inputName.focus();
            inputName.select();

            inputName.onkeydown = (e) => {
              switch (e.code) {
                case "Enter":
                case "Tab":
                  // Confirm editing
                  renameTab(i, inputName.value);
                  break;
                case "Escape":
                  // Cancel editing
                  inputName.value = tabs[i].getName();
                  // on blur will take care of the rest
                  inputName.blur();
                  break;
              }
            };

            spanTabElement.setAttribute("renaming", true);

            inputName.onblur = () => {
              renameTab(i, inputName.value);
            };

            break;
        }
      }
    };
    divTabList.appendChild(spanTabElement);
  }
}

module.exports.refreshView = refreshView;
