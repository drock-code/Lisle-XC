"use client";

import Image from 'next/image';
import { useState, useEffect, startTransition } from 'react';

interface BackgroundProps {
    availableImages: string[];
}

export const Background = ({ availableImages }: BackgroundProps) => {
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070";
    const [imgSrc, setImgSrc] = useState<string>("");
    const [errorImage, setErrorImage] = useState<string | null>(null);

    useEffect(() => {
        const pickRandomImage = () => {
            if (availableImages.length > 0) {
                const randomIdx = Math.floor(Math.random() * availableImages.length);
                return availableImages[randomIdx];
            }
            return FALLBACK_IMAGE;
        };

        const chosen = pickRandomImage();

        // startTransition tells React this update is non-urgent, which prevents the "cascading render" warning.
        startTransition(() => {
            setImgSrc(chosen);
        });
    }, [availableImages]);

    // Render the branded blue background until the image source is determined
    if (!imgSrc) {
        return <div className="fixed inset-0 z-0 bg-lisle-blue" />;
    }

    return (
        <div className="fixed inset-0 z-0 bg-lisle-blue">
            <Image
                src={errorImage || imgSrc}
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
    );
};