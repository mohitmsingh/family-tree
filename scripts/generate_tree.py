import csv
import json

from collections import defaultdict
from datetime import datetime
from datetime import date
from datetime import UTC


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

PEOPLE_CSV = "data/people.csv"
FAMILIES_CSV = "data/families.csv"
OUTPUT_JSON = "generated/family.json"

today = date.today()


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def calculate_age(dob_str):
    dob = datetime.strptime(
        dob_str,
        "%Y-%m-%d"
    ).date()

    return (
        today.year
        - dob.year
        - (
            (today.month, today.day)
            <
            (dob.month, dob.day)
        )
    )


# --------------------------------------------------
# LOAD PEOPLE
# --------------------------------------------------

people = []

with open(
    PEOPLE_CSV,
    newline="",
    encoding="utf-8"
) as f:

    reader = csv.DictReader(f)

    for person in reader:

        person["age"] = calculate_age(
            person["dob"]
        )

        if not person.get("photo"):

            person["photo"] = (
                "female.svg"
                if person["gender"].lower() == "female"
                else "male.svg"
            )

        people.append(person)


people_by_id = {
    person["id"]: person
    for person in people
}


# --------------------------------------------------
# LOAD FAMILIES
# --------------------------------------------------

families = []
relationships = []
spouses = []

with open(
    FAMILIES_CSV,
    newline="",
    encoding="utf-8"
) as f:

    reader = csv.DictReader(f)

    for family in reader:

        families.append(family)

        parent1 = family["parent1"].strip()
        parent2 = family["parent2"].strip()

        # spouse relationship

        spouses.append({
            "person1": parent1,
            "person2": parent2
        })

        relationships.append({
            "type": "spouse",
            "person1": parent1,
            "person2": parent2
        })

        # children

        children = [

            child.strip()

            for child in
            family["children"].split("|")

            if child.strip()

        ]

        for child in children:

            relationships.append({
                "type": "parent",
                "parent": parent1,
                "child": child
            })

            relationships.append({
                "type": "parent",
                "parent": parent2,
                "child": child
            })


# --------------------------------------------------
# ROOT DETECTION
# --------------------------------------------------

all_people_ids = {
    p["id"]
    for p in people
}

all_children_ids = {
    rel["child"]
    for rel in relationships
    if rel["type"] == "parent"
}

#
# Internal roots:
# Used for generation calculation
#
internal_root_people = list(
    all_people_ids - all_children_ids
)

#
# Display roots:
# Used only for D3 rendering
# Show only oldest male ancestors
#
display_root_people = [

    p["id"]

    for p in people

    if (
        p["gender"].lower() == "male"
        and
        p["id"] not in all_children_ids
    )

]


# --------------------------------------------------
# GENERATION MAP
# --------------------------------------------------

parents = defaultdict(list)

for rel in relationships:

    if rel["type"] == "parent":

        parents[
            rel["child"]
        ].append(
            rel["parent"]
        )


generation_cache = {}


def generation(person_id):

    if person_id in generation_cache:

        return generation_cache[
            person_id
        ]

    if person_id in internal_root_people:

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
    ] = parent_generation + 1

    return (
        parent_generation + 1
    )


for person in people:

    person["generation"] = generation(
        person["id"]
    )


# --------------------------------------------------
# UPCOMING BIRTHDAYS (NEXT 90 DAYS)
# --------------------------------------------------

upcoming_birthdays = []

for person in people:

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
# STATS
# --------------------------------------------------

male_count = sum(

    1

    for p in people

    if p["gender"].lower() == "male"

)

female_count = sum(

    1

    for p in people

    if p["gender"].lower() == "female"

)

average_age = round(

    sum(
        p["age"]
        for p in people
    )

    / len(people)

)

oldest_member = max(
    people,
    key=lambda p: p["age"]
)

youngest_member = min(
    people,
    key=lambda p: p["age"]
)

total_generations = max(
    p["generation"]
    for p in people
)

cities = sorted(

    set(

        p["current_city"]

        for p in people

        if p.get("current_city")

    )

)

stats = {

    "total_members":
        len(people),

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
# ROOT ANCESTORS
# --------------------------------------------------

root_ancestors = []

for person in people:

    if person["id"] in display_root_people:

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
        datetime.now(
            UTC
        ).isoformat(),

    "stats":
        stats,

    "root_ancestors":
        root_ancestors,

    "people":
        people,

    "relationships":
        relationships,

    "spouses":
        spouses

}

with open(
    OUTPUT_JSON,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        output,
        f,
        indent=2,
        ensure_ascii=False
    )


# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

print(
    "Successfully generated:"
)

print(
    OUTPUT_JSON
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

print(
    f"Root Ancestors: {len(root_ancestors)}"
)