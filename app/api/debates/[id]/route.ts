import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debate = Database.getDebate(id);
    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }
    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error fetching debate:', error);
    return NextResponse.json({ error: 'Failed to fetch debate' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { voterId, vote } = body;

    if (!voterId || !vote || !['yes', 'no'].includes(vote)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields: voterId, vote (yes/no)' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const success = Database.voteDebate(id, voterId, vote);
    if (success) {
      const updatedDebate = Database.getDebate(id);
      return NextResponse.json(updatedDebate);
    } else {
      return NextResponse.json({ error: 'Failed to vote or already voted' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error voting on debate:', error);
    return NextResponse.json({ error: 'Failed to vote on debate' }, { status: 500 });
  }
}
