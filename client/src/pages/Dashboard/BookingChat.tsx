import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const BookingChat = () => {
  const { id } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, senderId: 'admin', content: 'Hello! I have received your booking request for the Hyundai Creta.', time: '10:00 AM', isRead: true },
    { id: 2, senderId: 'user', content: 'Hi! I wanted to know if the car has a sunroof?', time: '10:05 AM', isRead: true },
    { id: 3, senderId: 'admin', content: 'Yes, this model comes with a panoramic sunroof. It is in excellent condition.', time: '10:10 AM', isRead: true },
    { id: 4, senderId: 'user', content: 'Great! I will pick it up from the Indiranagar branch.', time: '10:12 AM', isRead: true },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), senderId: 'user', content: message, time: 'Now', isRead: false }]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-off-white">Booking Chat</h1>
          <Badge variant="success">Booking #{id}</Badge>
        </div>
        <Button variant="surface" size="sm" asChild>
          <Link to={`/dashboard/bookings/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
          </Link>
        </Button>
      </div>

      <Card className="flex-1 flex flex-col h-[600px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3 max-w-[80%]',
                msg.senderId === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                msg.senderId === 'user' ? 'bg-accent text-primary' : 'bg-off-white/10 text-off-white'
              )}>
                {msg.senderId === 'user' ? <User className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div className={cn(
                'p-3 rounded-2xl text-sm',
                msg.senderId === 'user' ? 'bg-accent text-primary rounded-tr-none' : 'bg-off-white/10 text-off-white rounded-tl-none'
              )}>
                <p>{msg.content}</p>
                <p className={cn(
                  'text-[10px] mt-1 text-right opacity-50',
                  msg.senderId === 'user' ? 'text-primary' : 'text-off-white'
                )}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-off-white/10 flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button variant="primary" type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BookingChat;
