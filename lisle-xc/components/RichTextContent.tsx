"use client";

import { useEffect, useRef } from 'react';

export default function RichTextContent({ content }: { content: string }) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        // Find all anchor tags within the rich text
        const links = contentRef.current.querySelectorAll('a');

        links.forEach((link) => {
            // If the link's hostname doesn't match our website's hostname, it's external!
            if (link.hostname && link.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                
                // CRITICAL for security: prevents the new tab from hijacking your site's window object
                link.setAttribute('rel', 'noopener noreferrer'); 
            }
        });
    }, [content]);

    return (
        <div 
            ref={contentRef}
            className="font-body text-foreground leading-relaxed text-lg prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}