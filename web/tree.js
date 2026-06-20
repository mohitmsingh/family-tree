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

  // --------------------------
  // One parent per child
  // --------------------------

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

  const allChildren =
    new Set(
      parentLinks.map(
        r => r.child
      )
    );

  const roots =
    data.people.filter(
      p =>
        !allChildren.has(
          p.id
        )
    );

  const svg =
    d3.select("#treeSvg");

  const group =
    d3.select("#treeGroup");

  group.selectAll("*")
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
            260,
            220
          ]);

      treeLayout(root);

      const xOffset =
        index * 1200;

      root.descendants()
        .forEach(node => {

          node.x +=
            xOffset;

        });

      // ------------------
      // Parent links
      // ------------------

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

          // ------------------
          // Person Image
          // ------------------

          g.append(
            "image"
          )
            .attr(
              "href",
              `../photos/${d.data.photo}`
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

          // ------------------
          // Person Name
          // ------------------

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

          // ------------------
          // Spouse
          // ------------------

          const spouseId =
            spouseMap[
              d.data.id
            ];

          if (
            !spouseId
          ) {

            return;

          }

          const spouse =
            people[
              spouseId
            ];

          // marriage line

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
              80
            )
            .attr(
              "y2",
              0
            );

          // spouse image

          g.append(
            "image"
          )
            .attr(
              "href",
              `../photos/${spouse.photo}`
            )
            .attr(
              "x",
              80
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

          // spouse name

          g.append(
            "text"
          )
            .attr(
              "class",
              "spouse-name"
            )
            .attr(
              "x",
              110
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