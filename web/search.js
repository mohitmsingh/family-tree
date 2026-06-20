function initializeSearch() {

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  searchInput.addEventListener(
    "input",
    function() {

      const term =
        this.value
          .trim()
          .toLowerCase();

      d3.selectAll(".person-image")
        .classed(
          "search-match-image",
          false
        );

      if (!term) {
        return;
      }

      d3.selectAll(".person-node")
        .each(function(d) {

          const personName =
            d.data.name
              .toLowerCase();

          if (
            personName.includes(term)
          ) {

            d3.select(this)
              .select("image")
              .classed(
                "search-match-image",
                true
              );

            this.parentNode
              .appendChild(this);
          }

        });

    }
  );
}