import type { Metadata } from 'next';
import './globals.css';
import AgentTools from '@/components/AgentTools';
export const metadata: Metadata = { title: 'Aizen Map — Go find your Bengaluru', description: 'Explore sourced places, screenings and gigs around Bengaluru with a connected city map.', icons: {icon:'/favicon.svg'} };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}<AgentTools/></body></html>; }
