import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import { getNewsPostByPage } from '@/lib/queries';
import { generateSlug } from '@/lib/utils';

export default async function News({ page }: { page: number }) {
  const { post, totalPages } = await getNewsPostByPage(page);

  const prevPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, totalPages);

  return (
    <div className="lg:col-span-2 space-y-8">
      <section className="bg-background backdrop-blur-md rounded-2xl overflow-hidden border-border border flex flex-col transition-all duration-300">
        
        {/* Main Article Content */}
        <div className="min-h-75 flex flex-col justify-center">
          {post ? (
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
              
              {/* Force the line-clamp here to preview the text */}
              <div 
                className="font-body text-foreground leading-relaxed text-lg mb-8 line-clamp-4"
                dangerouslySetInnerHTML={{ __html: post.Note }}
              />
              
              <Link href={`/notes/${post.Key}-${generateSlug(post.Title)}?fromPage=${page}`}>
                <Button>Read Full Story</Button>
              </Link>
            </div>
          ) : (
            <div className="p-8 md:p-12 text-center text-light-gray font-medium">
              No news updates available.
            </div>
          )}
        </div>

        {/* URL-Based Pagination Container */}
        <div className="flex justify-between items-center px-8 py-4 md:px-12 border-t border-border bg-background/50">
          {page >= totalPages ? (
            <div className="flex items-center space-x-2 font-bold uppercase tracking-tighter text-light-gray cursor-not-allowed">
              <ChevronLeft size={20} />
              <span>Older Posts</span>
            </div>
          ) : (
            <Link 
              href={`/?page=${nextPage}`} scroll={false}
              className="flex items-center space-x-2 font-bold uppercase tracking-tighter text-foreground hover:text-light-blue transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Older Posts</span>
            </Link>
          )}

          {page === 1 ? (
            <div className="flex items-center space-x-2 font-bold uppercase tracking-tighter text-light-gray cursor-not-allowed">
              <span>Newer Posts</span>
              <ChevronRight size={20} />
            </div>
          ) : (
            <Link 
              href={`/?page=${prevPage}`} scroll={false}
              className="flex items-center space-x-2 font-bold uppercase tracking-tighter text-foreground hover:text-light-blue transition-colors"
            >
              <span>Newer Posts</span>
              <ChevronRight size={20} />
            </Link>
          )}
        </div>
        
      </section>
    </div>
  );
}