import type { Metadata } from 'next';
import WeddingEnvelope from './envelope/page';
import "@/app/globals.css"  
export const metadata: Metadata = {
  title: 'M & T — Wedding Invitation',
  description: 'You are cordially invited to celebrate our wedding.',
};

export default function Home() {
  return (
    <main className="wedding-page">
      <WeddingEnvelope />
    </main>
  );
}
