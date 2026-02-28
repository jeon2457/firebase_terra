import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        const webhookUrl = process.env.KAKAO_WEBHOOK_URL;

        if (!webhookUrl) {
            console.warn('KAKAO_WEBHOOK_URL is not configured. Notification skipped.');
            return NextResponse.json({ success: true, warning: 'Webhook URL not configured' });
        }

        // Generic webhook call (e.g., for Discord, Slack, or a custom Kakao bot)
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: message,
                // Some webhooks expect 'content' or other fields
                content: message,
            }),
        });

        if (response.ok) {
            return NextResponse.json({ success: true });
        } else {
            const errorText = await response.text();
            console.error('Kakao Webhook Error:', errorText);
            return NextResponse.json({ success: false, error: 'Failed to send webhook' }, { status: 500 });
        }
    } catch (error) {
        console.error('Kakao API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
