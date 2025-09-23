import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/database';
import { Debate } from '../../../lib/types';

export async function GET() {
  try {
    const activeDebates = Database.getActiveDebates();
    return NextResponse.json(activeDebates);
  } catch (error) {
    console.error('Error fetching debates:', error);
    return NextResponse.json({ error: 'Failed to fetch debates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, durationHours = 24, createdBy } = body;

    if (!title || !description || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, createdBy' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const debate: Debate = {
      id: `debate_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      createdBy,
      createdAt: now,
      endsAt: now + (durationHours * 60 * 60 * 1000),
      status: 'active',
      votes: {
        yes: 0,
        no: 0,
        voters: []
      }
    };

    const success = Database.createDebate(debate);
    if (success) {
      return NextResponse.json(debate, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create debate' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating debate:', error);
    return NextResponse.json({ error: 'Failed to create debate' }, { status: 500 });
  }
}
