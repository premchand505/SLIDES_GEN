// 1. Remove all old imports (dynamic, ChatInterface, etc.)
// 2. Import our new MainAppLayout component
import { MainAppLayout } from '@/components/MainAppLayout';

/**
 * This is the root Server Component for the home page.
 * It renders the MainAppLayout Client Component.
 */
export default function Home() {
  return (
    <MainAppLayout />
  );
}