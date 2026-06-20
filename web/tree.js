function initializeTree(data) {

  const people =
    Object.fromEntries(
      data.people.map(
        p => [p.id, p]
      )
    );

  const spouseMap = {};
  const parentLinks = [];

  data.relationships.forEach(r => {

    if (r.type === "spouse") {

      spouseMap[r.person1] =
        r.person2;

      spouseMap[r.person2] =
        r.person1;

    }

    if (r.type === "parent") {

      parentLinks.push(r);

    }

  });

  // -----------------------------------
  // Assign each child to only one parent
  // (required for D3 tree hierarchy)
  // -----------------------------------

  const childrenMap = {};
  const assignedChildren =
    new Set();

  parentLinks.forEach(link => {

    if (
      assignedChildren.has(
        link.child
      )
    ) {

      return;

    }

    assignedChildren.add(
      link.child
    );

    if (
      !childrenMap[
        link.parent
      ]
    ) {

      childrenMap[
        link.parent
      ] = [];

    }

    childrenMap[
      link.parent
    ].push(
      link.child
    );

  });

  // -----------------------------------
  // USE ROOTS FROM GENERATED JSON
  // -----------------------------------

  const roots =
    data.root_ancestors.map(
      root =>
        people[root.id]
    );

  const svg =
    d3.select("#treeSvg");

  const group =
    d3.select("#treeGroup");

  group
    .selectAll("*")
    .remove();

  const zoom =
    d3.zoom()
      .scaleExtent([
        0.25,
        5
      ])
      .on(
        "zoom",
        event =>
          group.attr(
            "transform",
            event.transform
          )
      );

  svg.call(zoom);

  function buildNode(
    personId
  ) {

    return {

      ...people[
        personId
      ],

      children:
        (
          childrenMap[
            personId
          ] || []
        ).map(
          buildNode
        )

    };

  }

  // -----------------------------------
  // Prevent duplicate spouse rendering
  // -----------------------------------

  const renderedSpouses =
    new Set();

  roots.forEach(
    (
      rootPerson,
      index
    ) => {

      const root =
        d3.hierarchy(
          buildNode(
            rootPerson.id
          )
        );

      const treeLayout =
        d3.tree()
          .nodeSize([
            280,
            220
          ]);

      treeLayout(root);

      const xOffset =
        index * 1400;

      root
        .descendants()
        .forEach(node => {

          node.x +=
            xOffset;

        });

      // ---------------------------
      // Parent-child links
      // ---------------------------

      group
        .selectAll(
          `.tree-link-${index}`
        )
        .data(
          root.links()
        )
        .enter()
        .append("path")
        .attr(
          "class",
          "tree-link"
        )
        .attr(
          "d",
          d3.linkVertical()
            .x(
              d => d.x
            )
            .y(
              d => d.y
            )
        );

      // ---------------------------
      // Nodes
      // ---------------------------

      const nodes =
        group
          .selectAll(
            `.person-node-${index}`
          )
          .data(
            root.descendants()
          )
          .enter()
          .append("g")
          .attr(
            "class",
            "person-node"
          )
          .attr(
            "transform",
            d =>
              `translate(${d.x},${d.y})`
          );

      nodes.each(
        function(d) {

          const g =
            d3.select(
              this
            );

          // ---------------------------
          // Person image
          // ---------------------------

          g.append(
            "image"
          )
            .attr(
              "href",
              `${BASE_PATH}/photos/${d.data.photo}`
            )
            .attr(
              "x",
              -40
            )
            .attr(
              "y",
              -40
            )
            .attr(
              "width",
              80
            )
            .attr(
              "height",
              80
            )
            .attr(
              "class",
              "person-image"
            )
            .on(
              "mousemove",
              event =>
                showTooltip(
                  event,
                  d.data
                )
            )
            .on(
              "mouseout",
              hideTooltip
            );

          // ---------------------------
          // Person name
          // ---------------------------

          g.append(
            "text"
          )
            .attr(
              "class",
              "person-name"
            )
            .attr(
              "y",
              65
            )
            .text(
              d.data.name
            );

          // ---------------------------
          // Spouse
          // ---------------------------

          const spouseId =
            spouseMap[
              d.data.id
            ];

          if (
            !spouseId
          ) {

            return;

          }

          const pairKey =
            [
              d.data.id,
              spouseId
            ]
              .sort()
              .join("-");

          if (
            renderedSpouses.has(
              pairKey
            )
          ) {

            return;

          }

          renderedSpouses.add(
            pairKey
          );

          const spouse =
            people[
              spouseId
            ];

          if (
            !spouse
          ) {

            return;

          }

          // ---------------------------
          // Marriage line
          // ---------------------------

          g.append(
            "line"
          )
            .attr(
              "class",
              "spouse-line"
            )
            .attr(
              "x1",
              40
            )
            .attr(
              "y1",
              0
            )
            .attr(
              "x2",
              90
            )
            .attr(
              "y2",
              0
            );

          // ---------------------------
          // Spouse image
          // ---------------------------

          g.append(
            "image"
          )
            .attr(
              "href",
              `${BASE_PATH}/photos/${spouse.photo}`
            )
            .attr(
              "x",
              90
            )
            .attr(
              "y",
              -30
            )
            .attr(
              "width",
              60
            )
            .attr(
              "height",
              60
            )
            .attr(
              "class",
              "spouse-image"
            )
            .on(
              "mousemove",
              event =>
                showTooltip(
                  event,
                  spouse
                )
            )
            .on(
              "mouseout",
              hideTooltip
            );

          // ---------------------------
          // Spouse name
          // ---------------------------

          g.append(
            "text"
          )
            .attr(
              "class",
              "spouse-name"
            )
            .attr(
              "x",
              120
            )
            .attr(
              "y",
              50
            )
            .text(
              spouse.name
            );

        }
      );

    }
  );

  // -----------------------------------
  // Initial zoom
  // -----------------------------------

  svg.call(
    zoom.transform,
    d3.zoomIdentity
      .translate(
        250,
        120
      )
      .scale(
        0.8
      )
  );

}