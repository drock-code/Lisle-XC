import Image from 'next/image';
import { useState } from 'react';

export const Background = () => {

{/* Choose a random image from the backgrounds folder */}
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070";

    const backgrounds = [
        "/backgrounds/2025boys.jpg",
        "/backgrounds/2025girls.jpg",
    ];

    const [imgSrc, setImgSrc] = useState(() => {
        const randomIdx = Math.floor(Math.random() * backgrounds.length);
        return backgrounds[randomIdx];
    });

    return (
      <div className="fixed inset-0 z-0">
            <Image
                src={imgSrc}
                width={5000}
                height={5000}
                alt="Lisle Cross Country Background"
                className="w-full h-full object-cover"
                priority
                onError={() => {
                    setImgSrc(FALLBACK_IMAGE);
                }}
            />
        {/* The Branded Overlay: Blends the image with Lisle Blue (#183760) */}
        <div className="absolute inset-0 bg-lisle-blue/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-b from-lisle-blue/25 via-transparent to-lisle-blue/30" />
      </div>
    );
}