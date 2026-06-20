function generateStats(data) {

  const stats = data.stats;

  document.getElementById(
    "totalMembers"
  ).textContent =
    stats.total_members;

  document.getElementById(
    "maleMembers"
  ).textContent =
    stats.male_count;

  document.getElementById(
    "femaleMembers"
  ).textContent =
    stats.female_count;

  document.getElementById(
    "avgAge"
  ).textContent =
    stats.average_age;

  createAdditionalStats(
    stats
  );

  createBirthdayWidget(
    stats.upcoming_birthdays
  );
}

function createAdditionalStats(
  stats
) {

  const container =
    document.getElementById(
      "statsContainer"
    );

  const cards = [

    {
      icon: "🌳",
      label: "Generations",
      value: stats.total_generations
    },

    {
      icon: "🏙️",
      label: "Cities",
      value: stats.city_count
    },

    {
      icon: "👴",
      label: "Oldest",
      value: stats.oldest_member
    },

    {
      icon: "👶",
      label: "Youngest",
      value: stats.youngest_member
    }

  ];

  cards.forEach(card => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "stat-card";

    div.innerHTML = `

      <div class="stat-value">
        ${card.icon}
      </div>

      <div class="stat-secondary">
        ${card.value}
      </div>

      <div class="stat-label">
        ${card.label}
      </div>

    `;

    container.appendChild(
      div
    );

  });

}

function createBirthdayWidget(
  birthdays
) {

  const birthdayContainer =
    document.getElementById(
      "birthdayContainer"
    );

  birthdayContainer.innerHTML = "";

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "birthday-container";

  let html = `

    <h3>
      🎂 Upcoming Birthdays (Next 90 Days)
    </h3>

  `;

  if (
    !birthdays ||
    birthdays.length === 0
  ) {

    html += `

      <div class="birthday-item">

        No birthdays in the next 90 days

      </div>

    `;

  } else {

    birthdays.forEach(person => {

      const daysLabel =
        person.days_until_birthday === 0
          ? "🎉 Today"
          : `${person.days_until_birthday} days`;

      html += `

        <div class="birthday-item">

          <div>

            <div class="birthday-name">
              ${person.name}
            </div>

            <div class="birthday-date">
              ${person.birthday}
            </div>

            <div class="birthday-age">
              Turning ${person.turning_age}
            </div>

          </div>

          <div class="birthday-days">
            ${daysLabel}
          </div>

        </div>

      `;

    });

  }

  card.innerHTML = html;

  birthdayContainer.appendChild(
    card
  );
}