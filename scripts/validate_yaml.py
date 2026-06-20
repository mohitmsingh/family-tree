import csv
from datetime import datetime


REQUIRED_COLUMNS = {
    "id",
    "name",
    "dob",
    "gender",
    "birth_place",
    "current_city",
    "photo"
}

VALID_GENDERS = {
    "male",
    "female"
}


people = {}
person_ids = set()


# --------------------------------------------------
# VALIDATE PEOPLE.CSV
# --------------------------------------------------

with open(
    "data/people.csv",
    newline="",
    encoding="utf-8"
) as f:

    reader = csv.DictReader(f)

    columns = set(
        reader.fieldnames or []
    )

    missing_columns = (
        REQUIRED_COLUMNS
        - columns
    )

    if missing_columns:

        raise ValueError(
            f"people.csv missing columns: "
            f"{sorted(missing_columns)}"
        )

    for row_num, person in enumerate(
        reader,
        start=2
    ):

        person_id = person["id"].strip()

        if not person_id:

            raise ValueError(
                f"Row {row_num}: empty id"
            )

        if person_id in person_ids:

            raise ValueError(
                f"Duplicate id: {person_id}"
            )

        person_ids.add(
            person_id
        )

        if not person["name"].strip():

            raise ValueError(
                f"{person_id}: missing name"
            )

        gender = (
            person["gender"]
            .strip()
            .lower()
        )

        if gender not in VALID_GENDERS:

            raise ValueError(
                f"{person_id}: invalid gender "
                f"'{gender}'"
            )

        try:

            datetime.strptime(
                person["dob"],
                "%Y-%m-%d"
            )

        except ValueError:

            raise ValueError(
                f"{person_id}: invalid DOB "
                f"'{person['dob']}' "
                f"(expected YYYY-MM-DD)"
            )

        people[person_id] = person


# --------------------------------------------------
# VALIDATE FAMILIES.CSV
# --------------------------------------------------

family_count = 0

with open(
    "data/families.csv",
    newline="",
    encoding="utf-8"
) as f:

    reader = csv.DictReader(f)

    expected_columns = {
        "parent1",
        "parent2",
        "children"
    }

    columns = set(
        reader.fieldnames or []
    )

    missing_columns = (
        expected_columns
        - columns
    )

    if missing_columns:

        raise ValueError(
            f"families.csv missing columns: "
            f"{sorted(missing_columns)}"
        )

    for row_num, family in enumerate(
        reader,
        start=2
    ):

        family_count += 1

        parent1 = (
            family["parent1"]
            .strip()
        )

        parent2 = (
            family["parent2"]
            .strip()
        )

        if parent1 not in people:

            raise ValueError(
                f"Row {row_num}: "
                f"unknown parent1 "
                f"{parent1}"
            )

        if parent2 not in people:

            raise ValueError(
                f"Row {row_num}: "
                f"unknown parent2 "
                f"{parent2}"
            )

        children = [

            child.strip()

            for child in
            family["children"].split("|")

            if child.strip()

        ]

        if not children:

            raise ValueError(
                f"Row {row_num}: "
                f"family has no children"
            )

        for child in children:

            if child not in people:

                raise ValueError(
                    f"Row {row_num}: "
                    f"unknown child "
                    f"{child}"
                )

            if child == parent1:

                raise ValueError(
                    f"{child} cannot be "
                    f"their own parent"
                )

            if child == parent2:

                raise ValueError(
                    f"{child} cannot be "
                    f"their own parent"
                )


# --------------------------------------------------
# SUCCESS
# --------------------------------------------------

print(
    f"Validation successful "
    f"({len(people)} people, "
    f"{family_count} families)"
)