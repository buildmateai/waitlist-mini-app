import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/database';
import { Debate } from '../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';
    
    let debates;
    if (includeAll) {
      debates = Database.getDebates();
    } else {
      debates = Database.getActiveDebates();
    }
    
    return NextResponse.json(debates);
  } catch (error) {
    console.error('Error fetching debates:', error);
    return NextResponse.json({ error: 'Failed to fetch debates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, durationHours = 24, createdBy, option1, option2 } = body;

    if (!title || !description || !createdBy || !option1 || !option2) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, createdBy, option1, option2' },
        { status: 400 }
      );
    }

    // Check if user has an active debate
    if (Database.hasUserActiveDebate(createdBy)) {
      return NextResponse.json(
        { error: 'User already has an active debate. Please wait for it to end before creating a new one.' },
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
      votingOptions: {
        option1,
        option2
      },
      votes: Object.assign({}, {
        voters: [],
        [option1]: 0,
        [option2]: 0
      }),
      chat: []
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
