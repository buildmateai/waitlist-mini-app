import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../../../../lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const body = await request.json();
    const { userId, reactionType } = body;

    if (!userId || !reactionType || !['upvote', 'downvote'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields: userId, reactionType (upvote/downvote)' },
        { status: 400 }
      );
    }

    const { id, messageId } = await params;
    
    console.log('Adding reaction:', { debateId: id, messageId, userId, reactionType });
    
    const success = Database.addReactionToMessage(id, messageId, userId, reactionType);
    
    if (success) {
      const updatedMessages = Database.getChatMessages(id);
      return NextResponse.json(updatedMessages);
    } else {
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}
