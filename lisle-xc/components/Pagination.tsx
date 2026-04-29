import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  
  // Local state so the user can freely type in the box before submitting
  const [inputValue, setInputValue] = useState(currentPage.toString());

  // Keep the input in sync if the user clicks the Next/Prev buttons
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // Handle the logic when the user presses Enter or clicks away
  const handleJump = () => {
    const parsed = parseInt(inputValue, 10);
    
    if (!isNaN(parsed)) {
      // Clamp the number so they can't go below 1 or above totalPages
      const validPage = Math.max(1, Math.min(parsed, totalPages));
      onPageChange(validPage);
      setInputValue(validPage.toString());
    } else {
      // If they typed gibberish, just reset to the current page
      setInputValue(currentPage.toString());
    }
  };

  // Trigger jump when hitting Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-light-blue-gray/20 border-t border-border p-4 flex justify-between items-center text-sm font-bold text-foreground">
      {/* Previous Button */}
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center space-x-1 transition-colors ${
          currentPage === 1 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:text-light-blue cursor-pointer'
        }`}
      >
        <ChevronLeft size={16} /> 
        <span>Previous</span>
      </button>

      {/* Interactive Page Indicator */}
      <div className="flex items-center space-x-2 text-foreground font-medium">
        <span>Page</span>
        <input 
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleJump} // Trigger when clicking outside the box
          onKeyDown={handleKeyDown} // Trigger on Enter
          className="w-12 text-center bg-background border border-border rounded py-1 px-1 text-sm focus:outline-none focus:ring-2 focus:ring-lisle-blue focus:border-transparent transition-all"
        />
        <span>of {totalPages}</span>
      </div>

      {/* Next Button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center space-x-1 transition-colors ${
          currentPage === totalPages 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:text-light-blue cursor-pointer'
        }`}
      >
        <span>Next</span> 
        <ChevronRight size={16} />
      </button>
    </div>
  );
}