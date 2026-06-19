import React from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const AdminChats = () => {
  const chats = [
    { id: 'B102', user: 'Aryan Sharma', lastMsg: 'I wanted to know if...', time: '2m ago', unread: 2 },
    { id: 'B101', user: 'Priya Iyer', lastMsg: 'Thank you for the prompt response!', time: '1h ago', unread: 0 },
    { id: 'B100', user: 'Vikram Rao', lastMsg: 'Can I change the pickup time?', time: '5h ago', unread: 1 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-off-white">Live Chats</h1>
        <Badge variant="accent">Total Active: 3</Badge>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-off-white/40" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full pl-12 pr-4 py-3 bg-surface border border-off-white/10 rounded-xl text-off-white placeholder:text-off-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chats.map(chat => (
          <Card key={chat.id} className="p-4 cursor-pointer hover:bg-off-white/5 transition-colors border-off-white/10">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                  {chat.user[0]}
                </div>
                <div>
                  <p className="font-bold text-off-white">{chat.user}</p>
                  <p className="text-xs text-off-white/40">Booking #{chat.id}</p>
                </div>
              </div>
              {chat.unread > 0 && (
                <Badge variant="accent" className="rounded-full h-5 w-5 flex items-center justify-center p-0">
                  {chat.unread}
                </Badge>
              )}
            </div>
            <p className="text-sm text-off-white/60 truncate mb-4">"{chat.lastMsg}"</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-off-white/40">{chat.time}</span>
              <Button variant="ghost" size="sm" className="text-accent">Chat Now</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminChats;
