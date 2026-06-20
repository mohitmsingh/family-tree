function initializeSearch() {

  const input =
    document.getElementById(
      "searchInput"
    );

  input.addEventListener(
    "input",
    function() {

      const term =
        this.value
          .trim()
          .toLowerCase();

      d3.selectAll(
        ".person-image"
      )
      .classed(
        "search-match-image",
        false
      );

      d3.selectAll(
        ".spouse-image"
      )
      .classed(
        "search-match-image",
        false
      );

      if (!term) {

        return;

      }

      d3.selectAll(
        ".person-node"
      )
      .each(function() {

        const node =
          d3.select(this);

        const text =
          node.text()
            .toLowerCase();

        if (
          text.includes(term)
        ) {

          node
            .selectAll(
              "image"
            )
            .classed(
              "search-match-image",
              true
            );

        }

      });

    }
  );

}