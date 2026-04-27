"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';

interface NoteData {
  Key: number;
  Date: string;
  Title: string;
  Note: string;
  Image: string | null;
}

export default function News() {
  const [post, setPost] = useState<NoteData | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track if the post is expanded or truncated
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/news?page=${page}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setPost(data.post);
        setTotalPages(data.totalPages);
        
        // Reset the expanded state every time we load a new page
        setIsExpanded(false); 
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [page]);

  const handleNewer = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleOlder = () => setPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="lg:col-span-2 space-y-8">
      <section className="bg-background backdrop-blur-md rounded-2xl overflow-hidden border-border border flex flex-col transition-all duration-300">
        
        {/* Main Article Content */}
        <div className="min-h-75 flex flex-col justify-center">
          {isLoading ? (
            <div className="p-8 md:p-12 text-center text-light-gray font-medium animate-pulse">
              Loading latest update...
            </div>
          ) : post ? (
            <div className="p-8 md:p-12">
              <div className="flex items-center space-x-2 text-light-blue font-bold tracking-widest uppercase text-xs mb-4">
                <span className="w-8 h-0.5 bg-light-blue"></span>
                <span>
                  {new Date(post.Date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                </span>
              </div>
              
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground uppercase tracking-tight mb-6 leading-tight">
                {post.Title}
              </h2>
              
              <div 
                className={`font-body text-foreground leading-relaxed text-lg mb-8 ${!isExpanded ? 'line-clamp-4' : ''}`}
                dangerouslySetInnerHTML={{ __html: post.Note }}
              />
              
              <Button onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Show Less' : 'Read Full Story'}
              </Button>
            </div>
          ) : (
            <div className="p-8 md:p-12 text-center text-light-gray font-medium">
              No news updates available.
            </div>
          )}
        </div>

        {/* Pagination Container */}
        <div className="flex justify-between items-center px-8 py-4 md:px-12 border-t border-border bg-background/50">
          <button 
            onClick={handleOlder}
            disabled={page >= totalPages}
            className={`flex items-center space-x-2 font-bold uppercase tracking-tighter transition-colors
              ${page >= totalPages ? 'text-light-gray cursor-not-allowed' : 'text-foreground hover:text-light-blue cursor-pointer'}`}
          >
            <ChevronLeft size={20} />
            <span>Older Posts</span>
          </button>

          <button 
            onClick={handleNewer}
            disabled={page === 1}
            className={`flex items-center space-x-2 font-bold uppercase tracking-tighter transition-colors
              ${page === 1 ? 'text-light-gray cursor-not-allowed' : 'text-foreground hover:text-light-blue cursor-pointer'}`}
          >
            <span>Newer Posts</span>
            <ChevronRight size={20} />
          </button>
        </div>
        
      </section>
    </div>
  );
}