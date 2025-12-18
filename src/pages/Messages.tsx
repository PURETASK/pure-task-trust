import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Send, Calendar } from "lucide-react";

const conversations = [
  {
    id: "1",
    cleaner: {
      name: "Sarah Mitchell",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    lastMessage: "I'll be there at 9 AM sharp!",
    time: "2h ago",
    unread: true,
    booking: {
      date: "Dec 20, 2024",
      type: "Standard Clean",
    },
  },
  {
    id: "2",
    cleaner: {
      name: "Mike Robinson",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    lastMessage: "Thank you for the great review!",
    time: "Dec 15",
    unread: false,
    booking: {
      date: "Dec 15, 2024",
      type: "Deep Clean",
    },
  },
];

const messages = [
  {
    id: "1",
    sender: "cleaner",
    text: "Hi! I've accepted your booking request for December 20th.",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "client",
    text: "Great! Could you please bring eco-friendly products?",
    time: "10:32 AM",
  },
  {
    id: "3",
    sender: "cleaner",
    text: "Of course! I always have eco-friendly options available. Is there anything else you'd like me to know about your home?",
    time: "10:35 AM",
  },
  {
    id: "4",
    sender: "client",
    text: "The front door code is 1234. There's a cat, she's friendly but might follow you around!",
    time: "10:38 AM",
  },
  {
    id: "5",
    sender: "cleaner",
    text: "I'll be there at 9 AM sharp!",
    time: "10:40 AM",
  },
];

export default function Messages() {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Messages</h1>

            <div className="grid md:grid-cols-3 gap-6 h-[600px]">
              {/* Conversation List */}
              <Card className="md:col-span-1 overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {conversations.map((convo) => (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConvo(convo)}
                        className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                          selectedConvo.id === convo.id ? "bg-secondary/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <img
                              src={convo.cleaner.image}
                              alt={convo.cleaner.name}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                            {convo.unread && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`font-medium truncate ${convo.unread ? "text-foreground" : ""}`}>
                                {convo.cleaner.name}
                              </p>
                              <span className="text-xs text-muted-foreground">{convo.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{convo.booking.date}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="md:col-span-2 flex flex-col overflow-hidden">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <img
                      src={selectedConvo.cleaner.image}
                      alt={selectedConvo.cleaner.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-medium">{selectedConvo.cleaner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedConvo.booking.type} • {selectedConvo.booking.date}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.sender === "client"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-secondary rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "client"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Messages are tied to bookings. You can only message cleaners you've booked.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
