# 🌳 Family Tree Generator

A GitHub Pages–hosted family tree powered by YAML.

## Features

- Traditional family tree layout
- Parent/child relationships
- Spouse relationships
- Hover tooltips
- Search
- Statistics
- Zoom & pan
- GitHub Pages deployment
- Default avatars

## Folder Structure

```text
data/
photos/
generated/
scripts/
web/
.github/
```

## Local Development

```bash
pip install pyyaml
python scripts/validate_csv.py
python scripts/generate_tree.py
```

Serve locally:

```bash
python -m http.server 8000
```

Visit:

```text
http://localhost:8000/web/
```