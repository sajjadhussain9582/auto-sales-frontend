import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-background selection:bg-primary/30">
      
      {/* Decorative background elements */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[40vh] bg-primary/20 blur-[100px] rounded-full opacity-50 
        dark:bg-primary/20 dark:opacity-40" />
        
        <div className="bg-primary/8 absolute right-0 bottom-0 h-96 w-96 rounded-full blur-[120px]" />
        <div className="bg-primary/6 absolute top-1/4 left-0 h-72 w-72 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-5xl px-6 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 delay-150">
        
        {/* Pill badge */}
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-md transition-colors hover:bg-primary/10 cursor-default">
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>The next evolution of AI agents</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto drop-shadow-sm">
          Agentic AI{' '}
          <span className="from-primary block mt-2 bg-gradient-to-r via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Communication System
          </span>
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Unlock seamless automation with autonomous intelligence. 
          Deploy custom agents, orchestrate complex tasks, and redefine human-computer interaction.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto pt-4">
          <Button 
            asChild 
            size="lg" 
            className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/25 transition-transform hover:-translate-y-1"
          >
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 text-base rounded-full border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary/5 transition-transform hover:-translate-y-1"
          >
            <Link href="/login">
              <Bot className="mr-2 h-5 w-5" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Footer / Copyright */}
      <div className="absolute bottom-6 text-sm text-muted-foreground text-center w-full z-10 font-medium">
        &copy; {new Date().getFullYear()} Agentic AI. All rights reserved.
      </div>
    </div>
  );
}
