let familyData = null;

async function loadData() {

  const response =
    await fetch(
      "generated/family.json"
    );

  if (!response.ok) {

    throw new Error(
      `Failed to load family.json: ${response.status}`
    );

  }

  familyData =
    await response.json();

  generateStats(
    familyData
  );

  initializeTree(
    familyData
  );

  initializeSearch();

}

document.addEventListener(
  "DOMContentLoaded",
  loadData
);

document
  .getElementById(
    "themeToggle"
  )
  .addEventListener(
    "click",
    () => {

      document.body
        .classList
        .toggle("dark");

    }
  );