import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { quoteId, clientEmail } = await request.json();

    if (!quoteId || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteId, clientEmail' },
        { status: 400 }
      );
    }

    // TODO: Implement actual email sending logic
    // For now, just return success
    console.log(`Sending quote ${quoteId} to ${clientEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Quote email sent successfully'
    });
  } catch (error) {
    console.error('Error sending quote email:', error);
    return NextResponse.json(
      { error: 'Failed to send quote email' },
      { status: 500 }
    );
  }
} 