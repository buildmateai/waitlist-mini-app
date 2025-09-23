import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = Database.getChatMessages(id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { author, message } = body;

    console.log('Chat POST request:', { body, params });

    if (!author || !message) {
      console.log('Missing fields:', { author: !!author, message: !!message });
      return NextResponse.json(
        { error: 'Missing required fields: author, message' },
        { status: 400 }
      );
    }

    const { id } = await params;
    console.log('Adding chat message to debate:', id);
    
    const success = Database.addChatMessage(id, author, message);
    console.log('Chat message added successfully:', success);
    
    if (success) {
      const updatedMessages = Database.getChatMessages(id);
      console.log('Returning updated messages:', updatedMessages.length);
      return NextResponse.json(updatedMessages);
    } else {
      console.log('Failed to add chat message');
      return NextResponse.json({ error: 'Failed to add chat message' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding chat message:', error);
    return NextResponse.json({ error: 'Failed to add chat message' }, { status: 500 });
  }
}
