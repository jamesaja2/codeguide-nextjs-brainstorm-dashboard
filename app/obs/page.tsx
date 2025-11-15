'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Wifi, WifiOff, Clock, Bell, Trophy, TrendingUp } from 'lucide-react';

interface Notification {
  id: string;
  type: 'trade' | 'leaderboard' | 'system' | 'bell';
  message: string;
  timestamp: Date;
  data?: any;
}

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  portfolioValue: string;
  gains: string;
  trades: number;
}

export default function OBSOverlay() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isDayActive, setIsDayActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Clock update
  useEffect(() => {
    const updateClock = () => {
      const time = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(`${time} (UTC+7)`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // SSE Connection for live notifications
  useEffect(() => {
    const eventSource = new EventSource('/api/obs/events');

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Connected to notification stream');
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error('Error connecting to notification stream');
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        notification.timestamp = new Date();
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications

        // Handle special notification types
        if (notification.type === 'bell') {
          if (notification.data?.action === 'start_day') {
            setIsDayActive(true);
          } else if (notification.data?.action === 'end_day') {
            setIsDayActive(false);
          }
        }

        if (notification.type === 'leaderboard') {
          setLeaderboard(notification.data?.leaderboard || []);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // WebSocket connection for real-time signals
  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(process.env.NODE_ENV === 'production'
          ? `wss://${window.location.host}/api/obs/websocket`
          : `ws://${window.location.host}/api/obs/websocket`
        );

        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...');
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'day_started':
        setIsDayActive(true);
        break;
      case 'day_ended':
        setIsDayActive(false);
        break;
      case 'bell_rung':
        // Play bell sound or visual notification
        break;
      case 'leaderboard_update':
        setLeaderboard(data.leaderboard || []);
        break;
    }
  };

  const sendBellSignal = async (action: 'start_day' | 'end_day') => {
    try {
      const response = await fetch('/api/obs/bell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        console.log(`${action} signal sent successfully`);
      }
    } catch (error) {
      console.error('Error sending bell signal:', error);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatGains = (gains: string) => {
    const num = parseFloat(gains);
    return num >= 0 ? `+$${num.toFixed(0)}` : `-$${Math.abs(num).toFixed(0)}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'leaderboard': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'system': return <Bell className="h-4 w-4 text-gray-500" />;
      case 'bell': return <Bell className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      {/* Header with Clock */}
      <div className="mb-6">
        <Card className="bg-black/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {isConnected ? (
                    <Wifi className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <Badge variant={isDayActive ? 'default' : 'secondary'}>
                  {isDayActive ? 'Trading Day Active' : 'Trading Day Closed'}
                </Badge>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-mono text-lg">{currentTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-black/50 backdrop-blur-sm border-gray-700 h-full">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Live Notifications</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No notifications yet. Trading activity will appear here.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-white/5 rounded-lg p-3 border border-gray-600"
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel & Leaderboard */}
        <div className="space-y-6">
          {/* Control Panel */}
          <Card className="bg-black/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Control Panel</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => sendBellSignal('start_day')}
                  className="w-full"
                  variant="default"
                  disabled={isDayActive}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Trading Day
                </Button>
                <Button
                  onClick={() => sendBellSignal('end_day')}
                  className="w-full"
                  variant="destructive"
                  disabled={!isDayActive}
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Trading Day
                </Button>
                <Button
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="w-full"
                  variant="outline"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          {showLeaderboard && (
            <Card className="bg-black/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Live Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No data available yet
                    </p>
                  ) : (
                    leaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`p-2 rounded-lg ${
                          entry.rank === 1
                            ? 'bg-yellow-500/20 border border-yellow-500/50'
                            : entry.rank === 2
                            ? 'bg-gray-400/20 border border-gray-400/50'
                            : entry.rank === 3
                            ? 'bg-orange-600/20 border border-orange-600/50'
                            : 'bg-white/5 border border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg">#{entry.rank}</span>
                            <div>
                              <p className="font-medium text-sm">{entry.teamName}</p>
                              <p className="text-xs text-gray-400">
                                {entry.trades} trades
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {formatCurrency(entry.portfolioValue)}
                            </p>
                            <p className={`text-xs ${
                              parseFloat(entry.gains) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatGains(entry.gains)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}