import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

// Keep a reference to the WebSocket server
let wss: WebSocketServer | null = null;

export async function GET(request: NextRequest) {
  // This is a placeholder - actual WebSocket handling is done below
  return new Response('WebSocket endpoint', { status: 200 });
}

// Handle WebSocket upgrade request
export async function WebSocketHandler(request: NextRequest, socket: any, head: Buffer) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');

      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to OBS WebSocket server',
        timestamp: new Date().toISOString(),
      }));

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send periodic updates
      const updateInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          }));
        } else {
          clearInterval(updateInterval);
        }
      }, 30000);
    });

    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  // Handle the upgrade request
  wss.handleUpgrade(socket, head, (ws: WebSocket) => {
    wss!.emit('connection', ws, socket);
  });
}

function handleWebSocketMessage(ws: WebSocket, message: any) {
  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString(),
      }));
      break;

    case 'subscribe':
      // Handle subscription to specific events
      ws.send(JSON.stringify({
        type: 'subscribed',
        channel: message.channel,
        timestamp: new Date().toISOString(),
      }));
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

// Function to broadcast messages to all connected clients
export function broadcastToClients(message: any) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
        }));
      }
    });
  }
}

// Example functions to send notifications
export const sendBellNotification = (action: 'start_day' | 'end_day') => {
  broadcastToClients({
    type: 'bell',
    action,
    message: action === 'start_day' ? '🔔 Trading day started!' : '🔔 Trading day ended!',
  });
};

export const sendLeaderboardUpdate = (leaderboard: any[]) => {
  broadcastToClients({
    type: 'leaderboard_update',
    message: 'Leaderboard has been updated',
    leaderboard,
  });
};

export const sendTradeNotification = (trade: any) => {
  broadcastToClients({
    type: 'trade_notification',
    message: `${trade.teamName} just ${trade.type} ${trade.quantity} shares of ${trade.stockSymbol}`,
    trade,
  });
};