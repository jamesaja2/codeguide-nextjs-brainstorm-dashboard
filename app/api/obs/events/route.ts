import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({
        type: 'system',
        message: 'Connected to live notification stream',
        timestamp: new Date().toISOString(),
      })}\n\n`;

      controller.enqueue(encoder.encode(data));

      // Simulate some notifications for demo purposes
      const sendNotification = () => {
        const notifications = [
          {
            type: 'trade',
            message: 'Team Alpha just bought 50 shares of TECH Corp',
          },
          {
            type: 'leaderboard',
            message: 'New leader on the leaderboard! Team Beta takes first place',
          },
          {
            type: 'system',
            message: 'Market update: All prices have been refreshed',
          },
          {
            type: 'trade',
            message: 'Team Gamma sold their position in FIN Bank',
          },
        ];

        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        const data = `data: ${JSON.stringify({
          ...randomNotification,
          timestamp: new Date().toISOString(),
        })}\n\n`;

        controller.enqueue(encoder.encode(data));
      };

      // Send a notification every 10 seconds for demo
      const notificationInterval = setInterval(sendNotification, 10000);

      // Keep the connection alive with a heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        const heartbeat = `: heartbeat\n\n`;
        controller.enqueue(encoder.encode(heartbeat));
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(notificationInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}