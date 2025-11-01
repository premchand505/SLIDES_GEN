import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // <-- Tests the @/lib alias

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          AI PPT Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Setup Verification Page
        </p>

        <div className="mt-6">
          <p className="mb-2 font-medium">Testing Shadcn Button:</p>
          {/* Tests Tailwind styles and shadcn component import */}
          <Button 
            variant="destructive" 
            size="lg"
            className={cn("w-full max-w-xs")} // <-- Tests the cn() util from @/lib/utils
          >
            Setup Verified!
          </Button>
        </div>
        
        <div className="mt-8 text-left p-4 bg-card border rounded-md max-w-xs mx-auto">
          <h3 className="font-semibold text-card-foreground">Checklist:</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Tailwind v4 styles applied</li>
            <li>Shadcn component rendered</li>
            <li>`@/components` alias working</li>
            <li>`@/lib/utils` alias working</li>
          </ul>
        </div>
      </div>
    </main>
  );
}