Raw conflict datasets go in [data/raw](C:/Users/jesud/OneDrive/Desktop/personal/war/data/raw). Generated import outputs can go in [data/generated](C:/Users/jesud/OneDrive/Desktop/personal/war/data/generated).

Supported sources:
- `UCDP` CSV or JSON array exports
- `COW` CSV or JSON array exports

Run the importer from the repo root:

```bash
npm run import:war -- --source ucdp --input data/raw/ucdp.csv --output data/generated/ucdp-war.json
```

Merge imported records with the current archive:

```bash
npm run import:war -- --source ucdp --input data/raw/ucdp.csv --merge-existing --output src/data/war_database.merged.json
```

Notes:
- The importer uses [public/countries.geojson](C:/Users/jesud/OneDrive/Desktop/personal/war/public/countries.geojson) to resolve ISO-A3 codes and create simple map arcs.
- It leaves `outcome` blank unless the source includes one.
- It generates fallback descriptions because official datasets usually do not include editorial summaries.
