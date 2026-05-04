import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

import { getNoteByKey } from '@/lib/queries';
import Button from '@/components/Button';
import RichTextContent from '@/components/RichTextContent';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const key = parseInt(resolvedParams.slug.split('-')[0], 10);
  const note = await getNoteByKey(key);

  if (!note) return { title: 'Note Not Found' };

  const plainTextDescription = note.Note.replace(/<[^>]+>/g, '').substring(0, 160) + '...';

  return {
    title: `${note.Title} | Lisle Cross Country`,
    description: plainTextDescription,
  };
}

export default async function NotePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fromPage?: string }>; 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const key = parseInt(resolvedParams.slug.split('-')[0], 10);
  const note = await getNoteByKey(key);

  if (!note) {
    notFound();
  }

  // Grab the page they came from (default to 1 if it's missing)
  const fromPage = resolvedSearchParams.fromPage || '1';
  const returnUrl = `/?page=${fromPage}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      
      <article className="bg-background backdrop-blur-md rounded-2xl overflow-hidden border-border border shadow-lg relative">
        
        <div className="sticky top-0 z-20 px-8 py-4 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between">
          <Link 
            href={returnUrl} 
            className="group flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-light-blue transition-colors"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-muted-foreground/50 truncate max-w-62.5">
            {note.Title}
          </span>
        </div>

        <div className="p-8 md:p-12">
          <header className="mb-10">
            <div className="flex items-center space-x-2 text-light-blue font-bold tracking-widest uppercase text-xs mb-4">
              <span className="w-8 h-0.5 bg-light-blue"></span>
              <time dateTime={note.Date}>
                {new Date(note.Date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
              </time>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground uppercase tracking-tight leading-tight">
              {note.Title}
            </h1>
          </header>

          <div className="font-body text-foreground leading-relaxed text-lg prose prose-invert max-w-none">
            <RichTextContent content={note.Note} />
          </div>
        </div>

        <div className="px-8 md:px-12 py-8 border-t border-border bg-black/20 text-center flex flex-col items-center justify-center gap-4">
            <p className="font-heading text-xl font-bold uppercase tracking-widest text-foreground">
                Finished Reading?
            </p>
            <Link href={returnUrl}>
                <Button className="flex items-center gap-2">
                    <Home size={18} />
                    <span>Return to Home</span>
                </Button>
            </Link>
        </div>

      </article>
    </div>
  );
}