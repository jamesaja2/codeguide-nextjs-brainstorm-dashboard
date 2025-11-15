import { NextRequest, NextResponse } from 'next/server';
import { broadcastToClients, sendBellNotification } from '../websocket/route';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (!['start_day', 'end_day'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start_day" or "end_day"' },
        { status: 400 }
      );
    }

    // Send bell notification via WebSocket
    sendBellNotification(action);

    // Also broadcast via SSE for redundancy
    const sseMessage = {
      type: 'bell',
      action,
      message: action === 'start_day'
        ? '🔔 Trading day has started!'
        : '🔔 Trading day has ended!',
      timestamp: new Date().toISOString(),
    };

    // Store the message for SSE clients
    // In a real implementation, you might store this in Redis or a database
    // for distribution across multiple server instances

    return NextResponse.json({
      success: true,
      message: `${action} bell signal sent successfully`,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending bell signal:', error);
    return NextResponse.json(
      { error: 'Failed to send bell signal' },
      { status: 500 }
    );
  }
}