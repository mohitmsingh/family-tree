function showTooltip(
  event,
  person
) {

  const tooltip =
    document.getElementById(
      "tooltip"
    );

  tooltip.innerHTML = `

    <strong>
      ${person.name}
    </strong>

    <hr>

    🎂 DOB:
    ${person.dob}
    <br>

    🎈 Age:
    ${person.age}
    <br>

    👤 Gender:
    ${person.gender}
    <br>

    🏠 Birth Place:
    ${person.birth_place}
    <br>

    📍 Current City:
    ${person.current_city}

  `;

  tooltip.style.left =
    `${event.pageX + 15}px`;

  tooltip.style.top =
    `${event.pageY + 15}px`;

  tooltip.style.display =
    "block";

}

function hideTooltip() {

  document
    .getElementById(
      "tooltip"
    )
    .style.display =
      "none";

}