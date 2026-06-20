import json
import yaml

from collections import defaultdict
from datetime import datetime
from datetime import date
from datetime import UTC


# --------------------------------------------------
# LOAD YAML
# --------------------------------------------------

with open(
    "data/family.yaml",
    "r",
    encoding="utf-8"
) as f:

    data = yaml.safe_load(f)


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

today = date.today()


def calculate_age(dob_str):

    dob = datetime.strptime(
        dob_str,
        "%Y-%m-%d"
    ).date()

    age = (
        today.year
        - dob.year
        - (
            (today.month, today.day)
            < (dob.month, dob.day)
        )
    )

    return age


# --------------------------------------------------
# ENRICH PEOPLE
# --------------------------------------------------

for person in data["people"]:

    person["age"] = calculate_age(
        person["dob"]
    )

    if not person.get("photo"):

        person["photo"] = (
            "female.svg"
            if person["gender"] == "female"
            else "male.svg"
        )


# --------------------------------------------------
# BUILD GENERATION MAP
# --------------------------------------------------

parents = defaultdict(list)

for rel in data["relationships"]:

    if rel["type"] == "parent":

        parents[
            rel["child"]
        ].append(
            rel["parent"]
        )


all_people_ids = {
    p["id"]
    for p in data["people"]
}

all_children_ids = {
    rel["child"]
    for rel in data["relationships"]
    if rel["type"] == "parent"
}

root_people = list(
    all_people_ids -
    all_children_ids
)

generation_cache = {}


def generation(person_id):

    if person_id in generation_cache:

        return generation_cache[
            person_id
        ]

    if person_id in root_people:

        generation_cache[
            person_id
        ] = 1

        return 1

    parent_generation = max(

        generation(parent)

        for parent in parents[
            person_id
        ]

    )

    generation_cache[
        person_id
    ] = (
        parent_generation + 1
    )

    return (
        parent_generation + 1
    )


for person in data["people"]:

    person["generation"] = generation(
        person["id"]
    )

# --------------------------------------------------
# UPCOMING BIRTHDAYS (NEXT 90 DAYS)
# --------------------------------------------------

upcoming_birthdays = []

for person in data["people"]:

    dob = datetime.strptime(
        person["dob"],
        "%Y-%m-%d"
    ).date()

    next_birthday = date(
        today.year,
        dob.month,
        dob.day
    )

    if next_birthday < today:

        next_birthday = date(
            today.year + 1,
            dob.month,
            dob.day
        )

    days_left = (
        next_birthday - today
    ).days

    # Only birthdays in next 90 days
    if days_left <= 90:

        upcoming_birthdays.append({

            "name":
                person["name"],

            "birthday":
                next_birthday.strftime(
                    "%d %b %Y"
                ),

            "days_until_birthday":
                days_left,

            "turning_age":
                person["age"] + 1

        })

upcoming_birthdays.sort(
    key=lambda x:
        x["days_until_birthday"]
)

# --------------------------------------------------
# STATISTICS
# --------------------------------------------------

male_count = sum(

    1

    for person in data["people"]

    if person["gender"] == "male"

)

female_count = sum(

    1

    for person in data["people"]

    if person["gender"] == "female"

)

average_age = round(

    sum(
        p["age"]
        for p in data["people"]
    )

    / len(data["people"])

)

oldest_member = max(

    data["people"],

    key=lambda p:
        p["age"]

)

youngest_member = min(

    data["people"],

    key=lambda p:
        p["age"]

)

total_generations = max(

    p["generation"]

    for p in data["people"]

)

cities = sorted(

    set(

        p.get(
            "current_city",
            ""
        )

        for p in data["people"]

        if p.get(
            "current_city"
        )

    )

)

stats = {

    "total_members":
        len(data["people"]),

    "male_count":
        male_count,

    "female_count":
        female_count,

    "average_age":
        average_age,

    "oldest_member":
        oldest_member["name"],

    "youngest_member":
        youngest_member["name"],

    "total_generations":
        total_generations,

    "cities":
        cities,

    "city_count":
        len(cities),

    "upcoming_birthdays":
        upcoming_birthdays

}

# --------------------------------------------------
# FIND ROOT ANCESTORS
# --------------------------------------------------

root_ancestors = []

for person in data["people"]:

    if person["id"] in root_people:

        root_ancestors.append({

            "id":
                person["id"],

            "name":
                person["name"]

        })


# --------------------------------------------------
# OUTPUT JSON
# --------------------------------------------------

output = {

    "generated_at":
        datetime.now(UTC).isoformat(),

    "stats":
        stats,

    "root_ancestors":
        root_ancestors,

    "people":
        data["people"],

    "relationships":
        data["relationships"]

}


with open(
    "generated/family.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        output,
        f,
        indent=2,
        ensure_ascii=False
    )


print(
    "Successfully generated:"
)

print(
    "generated/family.json"
)

print(
    f"Members: {stats['total_members']}"
)

print(
    f"Generations: {stats['total_generations']}"
)

print(
    f"Cities: {stats['city_count']}"
)