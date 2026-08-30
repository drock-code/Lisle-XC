"use client";

import { useEffect, useRef } from 'react';

export default function RichTextContent({ content }: { content: string }) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        const links = contentRef.current.querySelectorAll('a');

        links.forEach((link) => {
            if (link.hostname && link.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer'); 
            }
        });
    }, [content]);

    return (
        <div 
            ref={contentRef}
            className="font-body leading-relaxed text-lg max-w-none
                       prose 
                       /* Force paragraphs, lists, and bold text to use your foreground color */
                       prose-p:text-foreground 
                       prose-strong:text-foreground 
                       prose-ul:text-foreground 
                       prose-ol:text-foreground 
                       prose-li:text-foreground
                       
                       /* Optional: Give headings your brand color and font */
                       prose-headings:font-heading
                       prose-headings:text-foreground
                       
                       /* Your existing anchor tag fixes */
                       [&_a]:text-foreground
                       [&_a]:font-bold 
                       [&_a]:no-underline 
                       [&_a:hover]:underline 
                       [&_a:hover]:text-light-blue
                       [&_a]:transition-colors [&_a]:duration-200"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}