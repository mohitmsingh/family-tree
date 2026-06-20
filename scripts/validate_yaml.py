import yaml

REQUIRED = {
    "id",
    "name",
    "dob",
    "gender"
}

VALID_GENDERS = {
    "male",
    "female"
}

with open(
    "data/family.yaml",
    "r",
    encoding="utf-8"
) as f:

    data = yaml.safe_load(f)

ids = set()

for person in data["people"]:

    missing = REQUIRED - set(person)

    if missing:

        raise ValueError(
            f"{person.get('id')} "
            f"missing {missing}"
        )

    if person["id"] in ids:

        raise ValueError(
            f"Duplicate id: {person['id']}"
        )

    ids.add(person["id"])

    if person["gender"] not in VALID_GENDERS:

        raise ValueError(
            f"Invalid gender "
            f"{person['gender']}"
        )

for rel in data["relationships"]:

    if rel["type"] == "parent":

        if rel["parent"] not in ids:

            raise ValueError(
                f"Unknown parent "
                f"{rel['parent']}"
            )

        if rel["child"] not in ids:

            raise ValueError(
                f"Unknown child "
                f"{rel['child']}"
            )

print("Validation successful")