import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { War } from '@/lib/types';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'war_database.json');

async function readDB(): Promise<War[]> {
  const raw = await readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDB(wars: War[]): Promise<void> {
  await writeFile(DB_PATH, JSON.stringify(wars, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const wars = await readDB();
    const summary = wars.map(w => ({
      id: w.id,
      name: w.name,
      startYear: w.startYear,
      endYear: w.endYear,
      type: w.type,
      era: w.era,
      countries: w.countries,
      casualties: w.casualties,
      arcs: w.arcs
    }));
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newWar: War = await req.json();
    const wars = await readDB();
    const maxId = wars.reduce((max, w) => Math.max(max, w.id), 0);
    newWar.id = maxId + 1;
    wars.push(newWar);
    await writeDB(wars);
    return NextResponse.json(newWar, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add war' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updated: War = await req.json();
    const wars = await readDB();
    const idx = wars.findIndex((w) => w.id === updated.id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    wars[idx] = updated;
    await writeDB(wars);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update war' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const wars = await readDB();
    const filtered = wars.filter((w) => w.id !== id);
    if (filtered.length === wars.length)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await writeDB(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete war' }, { status: 500 });
  }
}
