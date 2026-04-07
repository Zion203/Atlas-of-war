import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import type { War } from '@/lib/types';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'war_database.json');

async function readDB(): Promise<War[]> {
  const raw = await readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId, 10);
    const wars = await readDB();
    const war = wars.find((w) => w.id === id);

    if (!war) {
      return NextResponse.json({ error: 'War not found' }, { status: 404 });
    }

    return NextResponse.json(war);
  } catch {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}
