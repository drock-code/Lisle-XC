import Link from 'next/link';
import RunnerAvatar from './RunnerAvatar';
import { generateSlug } from '@/lib/utils'; // Adjust path as needed

interface RunnerCardProps {
  runner: {
    Key: number;
    Name: string;
    Grade: number;
    AvatarURL: string | null;
  };
}

export default function RunnerCard({ runner }: RunnerCardProps) {
  const slug = generateSlug(runner.Name);
  
  return (
    <Link 
      href={`/runners/${runner.Key}-${slug}`}
      className="group bg-background border border-border rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-light-blue"
    >
      <RunnerAvatar 
        src={runner.AvatarURL} 
        name={runner.Name} 
        size="lg" 
        className="mb-4 group-hover:scale-105 transition-transform"
      />
      <h3 className="font-heading font-bold text-foreground group-hover:text-light-blue transition-colors">
        {runner.Name}
      </h3>
      <p className="text-sm text-muted-foreground font-medium">
        Grade {runner.Grade}
      </p>
    </Link>
  );
}