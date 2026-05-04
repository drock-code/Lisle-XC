"use client";

import Image from 'next/image';
import { useState, useEffect, startTransition } from 'react';
import { Expand, X } from 'lucide-react';

interface BackgroundProps {
    availableImages: string[];
}

export const Background = ({ availableImages }: BackgroundProps) => {
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070";
    const [imgSrc, setImgSrc] = useState<string>("");
    const [errorImage, setErrorImage] = useState<string | null>(null);
    
    const [showFullImage, setShowFullImage] = useState(false);

    // 1. Existing effect to pick the random image
    useEffect(() => {
        const pickRandomImage = () => {
            if (availableImages.length > 0) {
                const randomIdx = Math.floor(Math.random() * availableImages.length);
                return availableImages[randomIdx];
            }
            return FALLBACK_IMAGE;
        };

        const chosen = pickRandomImage();

        startTransition(() => {
            setImgSrc(chosen);
        });
    }, [availableImages]);

    // 2. NEW effect to handle the Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowFullImage(false);
            }
        };

        // Only attach the listener if the modal is actually open
        if (showFullImage) {
            window.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup the listener when the component unmounts or the modal closes
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showFullImage]);

    if (!imgSrc) {
        return <div className="fixed inset-0 z-0 bg-lisle-blue" />;
    }

    const activeImage = errorImage || imgSrc;

    return (
        <>
            <div className="fixed inset-0 z-0 bg-lisle-blue">
                <Image
                    src={activeImage}
                    width={5000}
                    height={5000}
                    alt="Lisle Cross Country Background"
                    className="w-full h-full object-cover"
                    priority
                    onError={() => setErrorImage(FALLBACK_IMAGE)}
                />
                <div className="absolute inset-0 bg-lisle-blue/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-linear-to-b from-lisle-blue/25 via-transparent to-lisle-blue/30" />
            </div>

            {/* Tooltip Wrapper */}
            <div className="fixed bottom-6 right-6 z-40 flex items-center group">
                <span className="absolute right-full mr-4 whitespace-nowrap px-3 py-1.5 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-md backdrop-blur-md opacity-0 pointer-events-none translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 border border-white/10">
                    View Background
                </span>

                <button
                    onClick={() => setShowFullImage(true)}
                    className="p-3 bg-black/40 hover:bg-black/70 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110 border border-white/10 cursor-pointer"
                    aria-label="View full background image"
                >
                    <Expand size={20} />
                </button>
            </div>

            {showFullImage && (
                <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    
                    <button
                        onClick={() => setShowFullImage(false)}
                        className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 flex items-center gap-3 group/close cursor-pointer"
                        aria-label="Close full image"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover/close:text-white/80 hidden md:block transition-colors">
                            ESC
                        </span>
                        <X size={24} />
                    </button>

                    <div className="relative w-full h-full max-w-7xl">
                        <Image
                            src={activeImage}
                            alt="Full Size Background"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
};