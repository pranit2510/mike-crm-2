import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { quote } = await req.json();
  if (!quote || !quote.client_email) {
    return NextResponse.json({ error: 'Missing quote or client email' }, { status: 400 });
  }
  try {
    await resend.emails.send({
      from: 'VoltFlow <noreply@voltflow.com>',
      to: quote.client_email,
      subject: `Your Quote from VoltFlow` ,
      html: `<h1>Quote #${quote.id}</h1>
             <p>Dear ${quote.client_name || 'Customer'},</p>
             <p>Here is your quote: <strong>$${quote.amount}</strong></p>
             <p>Notes: ${quote.notes || 'N/A'}</p>
             <p>Thank you for choosing VoltFlow!</p>`
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 