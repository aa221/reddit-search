"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ChatDialog from "@/components/ui/chatdialogue";
import { useUser } from "@/app/context/UserContext";
import ClipLoader from "react-spinners/ClipLoader"; // Import ClipLoader

interface SubredditDetails {
  display_name: string;
  public_description: string;
  icon: string;
  subscribers: number;
  id: string;
}

interface ChatHistoryItem {
  chat_history: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [subreddits, setSubreddits] = useState<SubredditDetails[]>([]);
  const [selectedSubreddit, setSelectedSubreddit] = useState<{ title: string; details: SubredditDetails } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [subredditName, setSubredditName] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  const { userId, setUserId } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const queryUserId = searchParams.get('userId');
    if (queryUserId) {
      setUserId(queryUserId);
    } else if (!userId) {
      router.push('/login');
    }
  }, [searchParams, setUserId, userId, router]);

  const handleSearch = useCallback(async () => {
    setIsSearchLoading(true);
    
    try {
      const response = await fetch(
        `https://reddit-search.up.railway.app/search_subreddits?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSubreddits(data); // data is now a list
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsSearchLoading(false);
    }
  }, [query]);

  const handleOpenDialog = useCallback((title: string, details: SubredditDetails) => {
    setSelectedSubreddit({ title, details });
    setSubredditName(title);
    setIsDialogOpen(true);
  }, []);

  const handleQuickChat = useCallback(async () => {
    if (!selectedSubreddit || !userId || !subredditName) return;
  
    setIsChatLoading(true);
  
    try {
      const response = await fetch('https://reddit-search.up.railway.app/chat_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddit: subredditName,
          user_id: userId,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
  
      const data = await response.json();
      if (data.response && Array.isArray(data.response) && data.response.length > 0) {
        const parsedHistory: Message[] = data.response.map((item: ChatHistoryItem) => {
          try {
            const history = JSON.parse(item.chat_history) as { [key: string]: string };
            return Object.entries(history).flatMap(([question, answer]) => ([
              { role: 'user', content: question, timestamp: new Date() },
              { role: 'assistant', content: answer, timestamp: new Date() },
            ]));
          } catch  { // Prefixed with '_'
            const [question, answer] = item.chat_history.split(': ');
            return [
              { role: 'user', content: question, timestamp: new Date() },
              { role: 'assistant', content: answer, timestamp: new Date() },
            ];
          }
        }).flat();

        setConversationHistory(parsedHistory);
      } else {
        setConversationHistory([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setConversationHistory([]);
    } finally {
      setIsChatLoading(false);
      setIsChatOpen(true);
    }
  }, [selectedSubreddit, userId, subredditName]);

  const handleAddToCollection = useCallback(() => {
    if (!selectedSubreddit) return;

    alert(
      userId
        ? `Added "${selectedSubreddit.title}" to the collection for user ${userId}!`
        : `No user logged in, but let's assume we added "${selectedSubreddit.title}" anyway.`
    );
  }, [selectedSubreddit, userId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {/* Search Section */}
      <div className="p-6 bg-white shadow-md rounded-md w-full max-w-lg mb-8">
        <h1 className="text-2xl font-semibold text-center mb-4">
          Search Subreddits
        </h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex-1"
          />
          <Button onClick={() => handleSearch()}>Search</Button>
        </div>
      </div>

      {/* Loading Spinner for Search */}
      {isSearchLoading && (
        <div
          className="flex justify-center items-center mb-4"
          style={{
            zIndex: 1000,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ClipLoader size={50} /> {/* Adjust size as needed */}
        </div>
      )}

      {/* Subreddits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl px-4">
        {subreddits.map((sub) => (
          <div
            key={sub.display_name}
            className="bg-white rounded shadow p-2 flex flex-col items-center
                       cursor-pointer transition-transform transform hover:scale-105"
            onClick={() => handleOpenDialog(sub.display_name, sub)}
          >
            {sub.icon ? (
              <img
                src={sub.icon}
                alt={sub.display_name}
                className="object-cover w-32 h-32 mb-2"
              />
            ) : (
              <img
                src="/assets/reddit-4.svg"
                alt="Default Icon"
                className="object-cover w-32 h-32 mb-2"
              />
            )}
            <h2 className="font-semibold text-sm text-center">{sub.display_name}</h2>
            <p className="text-xs text-gray-600 text-center">
              {sub.subscribers} subscribers
            </p>
          </div>
        ))}
      </div>

      {/* Dialog for Subreddit Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-96">
          {selectedSubreddit && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSubreddit.title}</DialogTitle>
                <DialogDescription>
                  {selectedSubreddit.details.public_description ||
                    "No description available"}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-between mb-4">
                <Button 
                  variant="outline" 
                  onClick={handleQuickChat}
                >
                  Quick Chat
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleAddToCollection}
                >
                  Add to Collection
                </Button>
              </DialogFooter>
              {/* Optional: Show loading spinner inside the dialog */}
              {isChatLoading && (
                <div className="flex justify-center items-center">
                  <ClipLoader size={30} />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <ChatDialog 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
        subredditName={subredditName} 
        userId={userId}
        conversationHistory={conversationHistory}
        isChatLoading={isChatLoading} // Pass the loading state
      />
    </div>
  );
}
