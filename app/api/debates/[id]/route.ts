import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching debate with ID:', id);
    
    const debate = Database.getDebate(id);
    console.log('Found debate:', debate ? 'Yes' : 'No');
    
    if (!debate) {
      console.log('Debate not found for ID:', id);
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }
    
    console.log('Returning debate:', debate.title);
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
    const { voterId, option } = body;

    console.log('Vote POST request:', { body, params });

    if (!voterId || !option) {
      console.log('Missing fields:', { voterId: !!voterId, option: !!option });
      return NextResponse.json(
        { error: 'Missing required fields: voterId, option' },
        { status: 400 }
      );
    }

    const { id } = await params;
    console.log('Voting on debate:', id, 'option:', option, 'voter:', voterId);
    
    const success = Database.voteDebate(id, voterId, option);
    console.log('Vote successful:', success);
    
    if (success) {
      const updatedDebate = Database.getDebate(id);
      console.log('Returning updated debate:', updatedDebate?.title);
      return NextResponse.json(updatedDebate);
    } else {
      console.log('Vote failed - user already voted or debate not active');
      return NextResponse.json({ error: 'Failed to vote or already voted' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error voting on debate:', error);
    return NextResponse.json({ error: 'Failed to vote on debate' }, { status: 500 });
  }
}
