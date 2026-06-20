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

      spouseMap[r.person1] = r.person2;
      spouseMap[r.person2] = r.person1;
    }

    if (r.type === "parent") {

      parentLinks.push(r);
    }

  });

  const childrenMap = {};

  parentLinks.forEach(link => {

    if (!childrenMap[link.parent]) {

      childrenMap[link.parent] = [];
    }

    childrenMap[link.parent]
      .push(link.child);

  });

  const allChildren =
    new Set(
      parentLinks.map(
        r => r.child
      )
    );

  const roots =
    data.people.filter(
      p => !allChildren.has(p.id)
    );

  if (!roots.length) {

    console.error(
      "No root ancestor found"
    );

    return;
  }

  function buildNode(personId) {

    const person =
      people[personId];

    const children =
      childrenMap[personId] || [];

    return {

      ...person,

      children:
        children.map(
          buildNode
        )

    };
  }

  const rootData =
    buildNode(
      roots[0].id
    );

  const root =
    d3.hierarchy(rootData);

  const treeLayout =
    d3.tree()
      .nodeSize([180, 180]);

  treeLayout(root);

  const svg =
    d3.select("#treeSvg");

  const group =
    d3.select("#treeGroup");

  group.selectAll("*").remove();

  const zoom =
    d3.zoom()
      .scaleExtent([0.25, 5])
      .on(
        "zoom",
        event =>
          group.attr(
            "transform",
            event.transform
          )
      );

  svg.call(zoom);

  group
    .selectAll(".tree-link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "tree-link")
    .attr(
      "d",
      d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
    );

  const nodes =
    group
      .selectAll(".person-node")
      .data(root.descendants())
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

  nodes
    .append("image")
    .attr(
      "href",
      d =>
        `../photos/${d.data.photo}`
    )
    .attr("x", -40)
    .attr("y", -40)
    .attr("width", 80)
    .attr("height", 80)
    .attr(
      "class",
      "person-image"
    )
    .on(
      "mousemove",
      (event,d) =>
        showTooltip(
          event,
          d.data
        )
    )
    .on(
      "mouseout",
      hideTooltip
    );

  nodes
    .append("text")
    .attr(
      "class",
      "person-name"
    )
    .attr("y", 65)
    .text(
      d => d.data.name
    );

  drawSpouseLines(
    root,
    spouseMap,
    group
  );
}

function drawSpouseLines(
  root,
  spouseMap,
  group
) {

  const nodes =
    root.descendants();

  const nodeMap = {};

  nodes.forEach(node => {

    nodeMap[node.data.id] =
      node;

  });

  const drawn =
    new Set();

  Object.entries(
    spouseMap
  ).forEach(
    ([person, spouse]) => {

      const key =
        [person, spouse]
          .sort()
          .join("-");

      if (drawn.has(key))
        return;

      drawn.add(key);

      const p1 =
        nodeMap[person];

      const p2 =
        nodeMap[spouse];

      if (!p1 || !p2)
        return;

      group
        .append("line")
        .attr(
          "x1",
          p1.x
        )
        .attr(
          "y1",
          p1.y
        )
        .attr(
          "x2",
          p2.x
        )
        .attr(
          "y2",
          p2.y
        )
        .attr(
          "stroke",
          "#e74c3c"
        )
        .attr(
          "stroke-width",
          3
        );

    }
  );
}