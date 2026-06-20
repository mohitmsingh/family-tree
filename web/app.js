let familyData = null;

async function loadData() {

  const response =
    await fetch("../generated/family.json");

  familyData =
    await response.json();

  generateStats(familyData);

  initializeTree(familyData);

  initializeSearch();
}

document
  .addEventListener(
    "DOMContentLoaded",
    loadData
  );

document
  .getElementById("themeToggle")
  .addEventListener(
    "click",
    () => {

      document.body
        .classList
        .toggle("dark");

    }
  );