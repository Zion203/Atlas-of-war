import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DEFAULT_OUTPUT = path.join(ROOT, 'src', 'data', 'war_database.imported.json');
const GEOJSON_PATH = path.join(ROOT, 'public', 'countries.geojson');
const EXISTING_DB_PATH = path.join(ROOT, 'src', 'data', 'war_database.json');

const TYPE_VALUES = new Set(['world', 'civil', 'colonial', 'regional']);

const SOURCE_CONFIG = {
  ucdp: {
    minId: 10000,
    era: 'modern',
  },
  cow: {
    minId: 20000,
  },
};

const COUNTRY_ALIASES = {
  usa: 'USA',
  'united states': 'USA',
  'united states of america': 'USA',
  uk: 'GBR',
  'united kingdom': 'GBR',
  britain: 'GBR',
  'great britain': 'GBR',
  england: 'GBR',
  france: 'FRA',
  russia: 'RUS',
  'russian federation': 'RUS',
  'russian empire': 'RUS',
  sovietunion: 'RUS',
  ussr: 'RUS',
  southkorea: 'KOR',
  'south korea': 'KOR',
  northkorea: 'PRK',
  'north korea': 'PRK',
  vietnam: 'VNM',
  southvietnam: 'VNM',
  northvietnam: 'VNM',
  laos: 'LAO',
  syria: 'SYR',
  iran: 'IRN',
  iraq: 'IRQ',
  turkey: 'TUR',
  'ottoman empire': 'TUR',
  palestine: 'PSE',
  israel: 'ISR',
  yemen: 'YEM',
  congo: 'COD',
  'dr congo': 'COD',
  'democratic republic of the congo': 'COD',
  'republic of the congo': 'COG',
  bolivia: 'BOL',
  venezuela: 'VEN',
  tanzania: 'TZA',
  moldova: 'MDA',
  'czech republic': 'CZE',
  czechia: 'CZE',
  'boer republics': 'ZAF',
  burma: 'MMR',
  myanmar: 'MMR',
  swaziland: 'SWZ',
  eswatini: 'SWZ',
};

function pickValidIso(...values) {
  for (const value of values) {
    const iso = String(value ?? '').trim();
    if (iso && iso !== '-99') return iso;
  }
  return null;
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) continue;

    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }

  return args;
}

function printUsage() {
  console.log(`
Usage:
  node scripts/import-war-data.mjs --source <ucdp|cow> --input <path> [options]

Options:
  --output <path>          Output JSON file. Default: src/data/war_database.imported.json
  --existing <path>        Existing War[] JSON to merge against. Default: src/data/war_database.json
  --merge-existing         Merge imported records with the existing database
  --replace-output         Overwrite the output file even if it already exists

Examples:
  node scripts/import-war-data.mjs --source ucdp --input data/raw/ucdp.csv
  node scripts/import-war-data.mjs --source cow --input data/raw/cow.csv --merge-existing --output src/data/war_database.merged.json
`.trim());
}

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeCountryKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\./g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '');
}

function toNumber(value, fallback = 0) {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  const cleaned = raw.replace(/,/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      current = '';
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  if (rows.length === 0) return [];

  const [headerRow, ...bodyRows] = rows;
  const headers = headerRow.map(normalizeKey);

  return bodyRows.map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });
    return record;
  });
}

function pick(record, aliases, fallback = '') {
  for (const alias of aliases) {
    if (record[alias] !== undefined && String(record[alias]).trim() !== '') {
      return record[alias];
    }
  }
  return fallback;
}

function splitActors(value) {
  return unique(
    String(value ?? '')
      .split(/[,/;|]+/g)
      .map((part) => part.trim())
      .filter((part) => part && !/^-\d+$/.test(part))
      .filter(Boolean)
  );
}

async function buildCountryIndex() {
  const raw = await fs.readFile(GEOJSON_PATH, 'utf8');
  const geo = JSON.parse(raw);
  const byName = new Map();
  const isoMeta = new Map();

  for (const feature of geo.features ?? []) {
    const props = feature.properties ?? {};
    const iso = pickValidIso(
      props.ISO_A3,
      props.ISO_A3_EH,
      props.ADM0_A3,
      props.ADM0_A3_US,
      props.WB_A3
    );
    if (!iso) continue;

    const names = [
      props.NAME,
      props.NAME_LONG,
      props.ADMIN,
      props.FORMAL_EN,
      props.NAME_SORT,
      props.NAME_EN,
      props.BRK_NAME,
      props.ABBREV,
      props.NAME_CIAWF,
      props.POSTAL,
    ].filter(Boolean);

    isoMeta.set(iso, {
      iso,
      continent: props.CONTINENT || '',
      lat: Number(props.LABEL_Y),
      lng: Number(props.LABEL_X),
    });

    for (const name of names) {
      byName.set(normalizeCountryKey(name), iso);
    }
  }

  for (const [alias, iso] of Object.entries(COUNTRY_ALIASES)) {
    byName.set(normalizeCountryKey(alias), iso);
  }

  return { byName, isoMeta };
}

function resolveCountry(value, countryIndex) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  if (/^[A-Z]{3}$/.test(raw) && countryIndex.isoMeta.has(raw)) {
    return raw;
  }

  const normalized = normalizeCountryKey(raw);
  return countryIndex.byName.get(normalized) ?? null;
}

function collectCountries(values, countryIndex) {
  const countries = [];

  for (const value of values) {
    for (const token of splitActors(value)) {
      const iso = resolveCountry(token, countryIndex);
      if (iso) countries.push(iso);
    }
  }

  return unique(countries);
}

function deriveEra(year) {
  if (year < 500) return 'ancient';
  if (year < 1500) return 'medieval';
  if (year < 1800) return 'colonial';
  return 'modern';
}

function classifyScope(countries, countryIndex) {
  const continents = unique(
    countries
      .map((iso) => countryIndex.isoMeta.get(iso)?.continent)
      .filter(Boolean)
  );

  if (countries.length >= 8 || (countries.length >= 6 && continents.length >= 2)) {
    return 'world';
  }
  return 'regional';
}

function createArcs(countries, label, countryIndex, belligerents = null) {
  const allyCountries = belligerents
    ? collectCountries(belligerents.allies, countryIndex)
    : [];
  const adversaryCountries = belligerents
    ? collectCountries(belligerents.adversaries, countryIndex)
    : [];

  const originIso = allyCountries[0] || countries[0];
  const targets = adversaryCountries.length > 0
    ? adversaryCountries
    : countries.slice(1);

  const origin = countryIndex.isoMeta.get(originIso);
  if (!origin) return [];

  return targets
    .map((iso) => {
      const target = countryIndex.isoMeta.get(iso);
      if (!target) return null;
      return {
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: target.lat,
        endLng: target.lng,
        label,
      };
    })
    .filter(Boolean);
}

function validateWarShape(war) {
  if (!war.name) return false;
  if (!Number.isFinite(war.startYear) || !Number.isFinite(war.endYear)) return false;
  if (war.startYear > war.endYear) return false;
  if (!TYPE_VALUES.has(war.type)) return false;
  return true;
}

function buildDescription(name, type, allies, adversaries) {
  const left = allies.slice(0, 3).join(', ');
  const right = adversaries.slice(0, 3).join(', ');

  if (left && right) {
    return `${name} was a ${type} conflict fought between ${left} and ${right}.`;
  }

  return `${name} was a ${type} conflict.`;
}

function normalizeBelligerents(alliesValue, adversariesValue) {
  return {
    allies: splitActors(alliesValue),
    adversaries: splitActors(adversariesValue),
  };
}

function buildUcdpName(sample) {
  const territory = String(pick(sample, ['territory_name'], '')).trim();
  const location = String(pick(sample, ['location'], '')).trim();
  const sideA = String(pick(sample, ['side_a', 'sidea', 'side_a_name'], '')).trim();
  const sideB = String(pick(sample, ['side_b', 'sideb', 'side_b_name'], '')).trim();

  if (territory && sideA && sideB) return `${territory}: ${sideA} vs ${sideB}`;
  if (location && sideA && sideB) return `${location}: ${sideA} vs ${sideB}`;
  if (territory) return territory;
  if (location) return location;
  if (sideA && sideB) return `${sideA} vs ${sideB}`;
  return '';
}

function transformUcdp(rows, countryIndex) {
  const byConflict = new Map();

  for (const row of rows) {
    const id = String(pick(row, ['conflict_id', 'conflictid'], '')).trim();
    const name = String(pick(row, ['conflict_name', 'name'], '')).trim();
    const key = id || name;
    if (!key) continue;

    if (!byConflict.has(key)) byConflict.set(key, []);
    byConflict.get(key).push(row);
  }

  const records = [];

  for (const [key, group] of byConflict.entries()) {
    const sample = group[0];
    const name = String(pick(sample, ['conflict_name', 'name'], '')).trim() || buildUcdpName(sample);
    const years = group.map((row) => toNumber(pick(row, ['year'], 0), 0)).filter(Boolean);
    const typeCode = String(pick(sample, ['type_of_conflict', 'conflict_type'], '')).trim();
    const belligerents = normalizeBelligerents(
      pick(sample, ['side_a', 'sidea', 'side_a_name'], ''),
      pick(sample, ['side_b', 'sideb', 'side_b_name'], '')
    );

    const countries = collectCountries(
      group.flatMap((row) => [
        pick(row, ['side_a', 'sidea', 'side_a_name'], ''),
        pick(row, ['side_b', 'sideb', 'side_b_name'], ''),
        pick(row, ['location', 'where_prec', 'territory_name'], ''),
      ]),
      countryIndex
    );

    let type = 'regional';
    if (typeCode === '1') type = 'colonial';
    else if (typeCode === '2') type = classifyScope(countries, countryIndex);
    else if (typeCode === '3' || typeCode === '4') type = 'civil';

    const casualties = group.reduce((sum, row) => {
      const best = toNumber(pick(row, ['best', 'deaths_best', 'bd_best'], 0), 0);
      return sum + best;
    }, 0);

    const normalized = {
      id: 0,
      name: name || `UCDP Conflict ${key}`,
      startYear: Math.min(...years),
      endYear: Math.max(...years),
      type,
      era: SOURCE_CONFIG.ucdp.era,
      countries,
      casualties,
      description: buildDescription(
        name || `UCDP Conflict ${key}`,
        type,
        belligerents.allies,
        belligerents.adversaries
      ),
      belligerents,
      outcome: '',
      arcs: createArcs(countries, name || `UCDP Conflict ${key}`, countryIndex, belligerents),
    };

    if (validateWarShape(normalized)) {
      records.push({
        source: 'ucdp',
        sourceId: key,
        sourceVersion: '25.1',
        rawType: typeCode,
        rawPayload: group,
        normalized,
      });
    }
  }

  return records;
}

function transformCow(rows, countryIndex) {
  if (rows.length === 0) return [];

  const firstRow = rows[0];

  if ('side' in firstRow && 'statename' in firstRow) {
    return transformCowInterState(rows, countryIndex);
  }

  if ('sidea' in firstRow && 'sideb' in firstRow && 'ccode1' in firstRow) {
    return transformCowExtraState(rows, countryIndex);
  }

  if ('sidea' in firstRow && 'sideb' in firstRow && 'ccodea' in firstRow) {
    return transformCowIntraState(rows, countryIndex);
  }

  return transformCowIntraState(rows, countryIndex);
}

function transformCowIntraState(rows, countryIndex) {
  const records = [];

  for (const row of rows) {
    const name = String(pick(row, ['war_name', 'name'], '')).trim();
    const sourceId = String(pick(row, ['war_number', 'war_id', 'warnum'], '')).trim() || name;
    if (!sourceId) continue;

    const startYear = toNumber(pick(row, ['start_year', 'styear', 'begyear1', 'startyr1'], 0), 0);
    const endYear = toNumber(pick(row, ['end_year', 'endyear', 'endyear1', 'endyr1'], startYear), startYear);
    const rawType = String(pick(row, ['war_type', 'type', 'wartype'], '')).trim().toLowerCase();

    let type = 'regional';
    if (rawType.includes('intra')) type = 'civil';
    else if (rawType.includes('extra')) type = 'colonial';
    else if (rawType.includes('inter')) {
      const countriesPreview = collectCountries(
        [
          pick(row, ['side_a_states', 'side_a_names', 'sidea', 'participants'], ''),
          pick(row, ['side_b_states', 'side_b_names', 'sideb', 'participants'], ''),
        ],
        countryIndex
      );
      type = classifyScope(countriesPreview, countryIndex);
    }

    const belligerents = normalizeBelligerents(
      pick(row, ['side_a_states', 'side_a_names', 'sidea'], ''),
      pick(row, ['side_b_states', 'side_b_names', 'sideb'], '')
    );

    const countries = collectCountries(
      [
        pick(row, ['side_a_states', 'side_a_names', 'sidea', 'participants'], ''),
        pick(row, ['side_b_states', 'side_b_names', 'sideb', 'participants'], ''),
      ],
      countryIndex
    );

    const normalized = {
      id: 0,
      name: name || String(pick(row, ['warname'], '')).trim() || `COW War ${sourceId}`,
      startYear,
      endYear,
      type,
      era: deriveEra(startYear),
      countries,
      casualties: toNumber(pick(row, ['battle_deaths', 'fatalities', 'deaths', 'totalbdeaths'], 0), 0),
      description: buildDescription(
        name || String(pick(row, ['warname'], '')).trim() || `COW War ${sourceId}`,
        type,
        belligerents.allies,
        belligerents.adversaries
      ),
      belligerents,
      outcome: String(pick(row, ['outcome', 'war_outcome'], '')).trim(),
      arcs: createArcs(countries, name || String(pick(row, ['warname'], '')).trim() || `COW War ${sourceId}`, countryIndex, belligerents),
    };

    if (validateWarShape(normalized)) {
      records.push({
        source: 'cow',
        sourceId,
        sourceVersion: 'current',
        rawType,
        rawPayload: row,
        normalized,
      });
    }
  }

  return records;
}

function transformCowInterState(rows, countryIndex) {
  const byWar = new Map();

  for (const row of rows) {
    const key = String(pick(row, ['warnum', 'war_number'], '')).trim();
    if (!key) continue;
    if (!byWar.has(key)) byWar.set(key, []);
    byWar.get(key).push(row);
  }

  const records = [];

  for (const [sourceId, group] of byWar.entries()) {
    const sample = group[0];
    const name = String(pick(sample, ['warname', 'war_name', 'name'], '')).trim() || `COW War ${sourceId}`;
    const startYear = Math.min(...group.map((row) => toNumber(pick(row, ['startyear1', 'start_year'], 0), 0)).filter(Boolean));
    const endYear = Math.max(...group.map((row) => toNumber(pick(row, ['endyear1', 'end_year'], 0), 0)).filter(Boolean));

    const allies = group
      .filter((row) => String(pick(row, ['side'], '')).trim() === '1')
      .map((row) => String(pick(row, ['statename', 'sidea'], '')).trim())
      .filter(Boolean);

    const adversaries = group
      .filter((row) => String(pick(row, ['side'], '')).trim() === '2')
      .map((row) => String(pick(row, ['statename', 'sideb'], '')).trim())
      .filter(Boolean);

    const belligerents = {
      allies: unique(allies),
      adversaries: unique(adversaries),
    };

    const countries = collectCountries(
      [...belligerents.allies, ...belligerents.adversaries],
      countryIndex
    );

    const normalized = {
      id: 0,
      name,
      startYear,
      endYear,
      type: classifyScope(countries, countryIndex),
      era: deriveEra(startYear),
      countries,
      casualties: group.reduce((sum, row) => sum + toNumber(pick(row, ['batdeath', 'battle_deaths'], 0), 0), 0),
      description: buildDescription(name, classifyScope(countries, countryIndex), belligerents.allies, belligerents.adversaries),
      belligerents,
      outcome: String(pick(sample, ['outcome', 'war_outcome'], '')).trim(),
      arcs: createArcs(countries, name, countryIndex, belligerents),
    };

    if (validateWarShape(normalized)) {
      records.push({
        source: 'cow',
        sourceId,
        sourceVersion: String(pick(sample, ['version'], 'current')).trim() || 'current',
        rawType: 'inter-state',
        rawPayload: group,
        normalized,
      });
    }
  }

  return records;
}

function transformCowExtraState(rows, countryIndex) {
  const byWar = new Map();

  for (const row of rows) {
    const key = String(pick(row, ['warnum', 'war_number'], '')).trim();
    if (!key) continue;
    if (!byWar.has(key)) byWar.set(key, []);
    byWar.get(key).push(row);
  }

  const records = [];

  for (const [sourceId, group] of byWar.entries()) {
    const sample = group[0];
    const name = String(pick(sample, ['warname', 'war_name', 'name'], '')).trim() || `COW War ${sourceId}`;
    const startYear = Math.min(...group.map((row) => toNumber(pick(row, ['startyear1', 'start_year'], 0), 0)).filter(Boolean));
    const endYear = Math.max(...group.map((row) => toNumber(pick(row, ['endyear1', 'end_year'], 0), 0)).filter(Boolean));

    const allies = unique(
      group.flatMap((row) => splitActors(pick(row, ['sidea', 'statename'], '')))
    );
    const adversaries = unique(
      group.flatMap((row) => splitActors(pick(row, ['sideb'], '')))
    );

    const belligerents = { allies, adversaries };
    const countries = collectCountries([...allies, ...adversaries], countryIndex);

    const normalized = {
      id: 0,
      name,
      startYear,
      endYear,
      type: 'colonial',
      era: deriveEra(startYear),
      countries,
      casualties: group.reduce((sum, row) => sum + toNumber(pick(row, ['batdeath', 'battle_deaths'], 0), 0), 0),
      description: buildDescription(name, 'colonial', allies, adversaries),
      belligerents,
      outcome: String(pick(sample, ['outcome', 'war_outcome'], '')).trim(),
      arcs: createArcs(countries, name, countryIndex, belligerents),
    };

    if (validateWarShape(normalized)) {
      records.push({
        source: 'cow',
        sourceId,
        sourceVersion: String(pick(sample, ['version'], 'current')).trim() || 'current',
        rawType: 'extra-state',
        rawPayload: group,
        normalized,
      });
    }
  }

  return records;
}

function dedupeWars(wars) {
  const seen = new Set();
  return wars.filter((war) => {
    const key = `${normalizeKey(war.name)}:${war.startYear}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function assignIds(imported, existing, source) {
  const existingIds = existing.map((war) => war.id).filter(Number.isFinite);
  let nextId = Math.max(SOURCE_CONFIG[source].minId, ...existingIds, 0) + 1;

  for (const record of imported) {
    record.normalized.id = nextId;
    nextId += 1;
  }

  return imported;
}

async function readInputRecords(inputPath) {
  const text = await fs.readFile(inputPath, 'utf8');
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.json') {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON input must be an array of records.');
    }
    return parsed.map((item) => {
      const normalized = {};
      for (const [key, value] of Object.entries(item)) {
        normalized[normalizeKey(key)] = value;
      }
      return normalized;
    });
  }

  return parseCsv(text);
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = String(args.source ?? '').toLowerCase();

  if (!source || !args.input || !(source in SOURCE_CONFIG)) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const inputPath = path.resolve(ROOT, String(args.input));
  const outputPath = path.resolve(ROOT, String(args.output ?? DEFAULT_OUTPUT));
  const existingPath = path.resolve(ROOT, String(args.existing ?? EXISTING_DB_PATH));

  if ((await fileExists(outputPath)) && !args['replace-output']) {
    throw new Error(`Output file already exists: ${outputPath}. Pass --replace-output to overwrite.`);
  }

  const countryIndex = await buildCountryIndex();
  const rawRows = await readInputRecords(inputPath);
  const existingWars = (await fileExists(existingPath))
    ? JSON.parse(await fs.readFile(existingPath, 'utf8'))
    : [];

  const transformed = source === 'ucdp'
    ? transformUcdp(rawRows, countryIndex)
    : transformCow(rawRows, countryIndex);

  const importedWars = assignIds(transformed, existingWars, source).map((record) => record.normalized);
  const dedupedImported = dedupeWars(importedWars);
  const outputWars = args['merge-existing']
    ? dedupeWars([...existingWars, ...dedupedImported])
    : dedupedImported;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(outputWars, null, 2)}\n`, 'utf8');

  console.log(`Imported ${dedupedImported.length} wars from ${source.toUpperCase()}.`);
  console.log(`Wrote ${outputWars.length} wars to ${path.relative(ROOT, outputPath)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
