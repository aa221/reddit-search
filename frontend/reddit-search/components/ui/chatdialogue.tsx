// ChatDialog.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Send, Trash2 } from 'lucide-react';
import ClipLoader from "react-spinners/ClipLoader";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subredditName?: string | null;
  userId?: string | null;
  conversationHistory?: Message[];
  isChatLoading?: boolean; // New prop for loading chat history
}


export default function ChatDialog({ 
  open, 
  onOpenChange, 
  subredditName, 
  userId, 
  conversationHistory = [],
  isChatLoading = false, // Destructure the new prop
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false); // Renamed to avoid conflict
  const [isDeleting, setIsDeleting] = useState(false); // New state for deletion
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation dialog

  const viewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea's Viewport
  const scrollAnchorRef = useRef<HTMLDivElement>(null); // Optional: For scroll anchor

  // Set messages when conversationHistory changes and dialog is open
  useEffect(() => {
    if (open) {
      setMessages(conversationHistory);
      // Scroll after messages are set
      // Using setTimeout to ensure messages are rendered before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    } else {
      setMessages([]);
    }
  }, [open, conversationHistory]);

  // Scroll when messages change and dialog is open
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      // Option 1: Scroll the Viewport to bottom
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth', // Use 'auto' for immediate scrolling
      });

      console.log('Scrolling to bottom:', viewportRef.current.scrollTop, viewportRef.current.scrollHeight);
    } else {
      console.log('viewportRef.current is null');
    }

    // Option 2: Use scrollIntoView on the scroll anchor
    // if (scrollAnchorRef.current) {
    //   scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    //   console.log('Scrolled into view using scrollAnchorRef');
    // }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the default form submission behavior
  
    if (!input.trim() || isSending) return;
  
    setIsSending(true);
  
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput('');
  
    // Call the chat_with_bot API
    try {
      const response = await fetch('https://reddit-search-production.up.railway.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          subreddit: subredditName,
          user_id: userId,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response, // Use the response from the API
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // Optionally, add an error message to the chat
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I couldn't process your request.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };
  

  // Handler to delete conversation
  const handleDeleteConversation = async () => {
    if (!subredditName || !userId) {
      setError("Subreddit name and User ID are required to delete the conversation.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('https://reddit-search-production.up.railway.app/delete_conversation', {
        method: 'POST', // Changed to POST for sending JSON body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddit: subredditName,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete conversation.');
      }

      const data = await response.json();
      console.log("Delete response:", data);

      // Clear chat history
      setMessages([]);
    } catch (err: unknown) {
      console.error("Error deleting conversation:", err);
      setError((err as Error).message || "An error occurred while deleting the conversation.");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false); // Close confirmation dialog after action
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] h-[600px] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <DialogTitle>Chat Assistant {subredditName && `- ${subredditName}`}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Conditional Rendering for Chat History Loading */}
        {isChatLoading ? (
          <div className="flex justify-center items-center flex-1">
            <ClipLoader size={50} /> {/* Adjust size as needed */}
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6" viewportRef={viewportRef}>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <Card className="bg-muted border-0">
                  <CardContent className="p-4 text-sm text-muted-foreground text-center">
                    No messages yet. Start a conversation!
                  </CardContent>
                </Card>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <Card className={`max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary border-primary' 
                        : 'bg-muted border-muted'
                    }`}>
                      <CardContent className={`p-3 text-sm ${
                        message.role === 'user' 
                          ? 'text-primary-foreground' 
                          : ''
                      }`}>
                        {message.content}
                      </CardContent>
                    </Card>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/user-avatar.png" />
                        <AvatarFallback>ME</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              {/* Scroll Anchor (Optional if using Option 1 above) */}
              <div ref={scrollAnchorRef} />
            </div>
          </ScrollArea>
        )}

        <div className="p-6 pt-4">
          <Separator className="mb-4" />
          <form onSubmit={handleSubmit} className="flex gap-4 items-center">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending || isDeleting}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isSending || isDeleting}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          {/* Display error message if any */}
          {error && (
            <div className="mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
          {/* Delete Conversation Button */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setIsConfirmOpen(true)}
              disabled={isDeleting || isSending}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <ClipLoader size={16} />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Chat History
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the chat history? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConversation}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ClipLoader size={16} />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Optional: Show loading spinner when sending messages */}
        {(isSending || isDeleting) && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50">
            <ClipLoader size={40} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
