import TornPostcardPortfolio, { type TornPostcardPortfolioProps } from '@/components/ui/torn-postcard-portfolio';
import { getGitHubProjects } from '@/lib/github-projects';

export const revalidate = 3600;

// Identity, projects and journey: https://github.com/5erax/5erax
const portfolio = {
  name: 'Astraa',
  role: 'Fullstack developer · UI & interaction',
  location: 'Ho Chi Minh, Vietnam',
  since: '2026',
  headline: ['A developer with an', 'eye for the interface.'],
  intro: 'I build web apps, mobile experiences, and worlds to explore.',
  snap: false,
  email: 'lagna0175@gmail.com',
  about: {
    title: 'A note from Astraa',
    subtitle: 'The person behind the interface',
    text: 'I’m Astraa, a fullstack developer in Vietnam. I build expressive interfaces, thoughtful motion, and the components, APIs, and data flows behind them.',
    portrait: '/media/avatar-personal.png',
    photo: '/media/astraa-portrait.webp',
    snapshots: [
      { src: '/media/team.webp', alt: 'Astraa with the team' },
      { src: '/media/friends.webp', alt: 'An evening with friends' },
      { src: '/media/working.webp', alt: 'Working on a website' },
      { src: '/media/workspace.webp', alt: 'A shared workspace' },
      { src: '/media/team-session.webp', alt: 'A team working session' },
    ],
    facts: [
      { label: 'Based in', value: 'Ho Chi Minh, Vietnam' },
      { label: 'Building', value: 'Web, mobile & games' },
      { label: 'Latest contribution', value: 'GitHub projects' },
      { label: 'Open to', value: 'Frontend & fullstack opportunities' },
    ],
    skills: ['React', 'Next.js', 'TypeScript', 'Figma', 'PixiJS', 'React Native', 'Node.js', 'PostgreSQL'],
  },
  projects: [
    {
      name: 'Nét Studio', repository: '5erax/net-studio', year: '2026', role: 'Creative studio · interactive website',
      description: 'A bilingual creative studio website with cobalt engraved illustrations, switchable palettes, project filters, and a downloadable brief. Built with React, GSAP, and Lenis.',
      tags: ['React', 'GSAP', 'Lenis'],
      url: 'https://net-studio-nu.vercel.app/', note: 'ideas take shape',
      image: '/media/net-studio-preview.webp',
    },
    {
      name: 'Garden Dreams', repository: '5erax/garden-dreams-florist', year: '2026', role: 'Florist storefront · web experience',
      description: 'A Vietnamese florist storefront with product discovery, a cart, personalised cards, and customer order history. Built with React and Supabase.',
      tags: ['React', 'Supabase', 'Motion'],
      url: 'https://garden-dreams-florist.vercel.app/', note: 'flowers, little notes & memories',
      image: '/media/garden-dreams-preview.webp',
    },
    {
      name: 'ProZ0', repository: '5erax/ProZ0', role: 'Browser game · in development',
      description: 'A 2D pixel-art survival and exploration sandbox about building a new civilization and uncovering the traces of an older one. Its Phase 1 vertical slice is in development.',
      tags: ['TypeScript', 'PixiJS', 'Vite'],
      url: 'https://github.com/5erax/ProZ0', note: 'in development',
      image: '/media/proz0-preview.webp',
    },
    {
      name: 'MediMate AI', repository: '5erax/SEP490_FE_MedicalAIAssistant', role: 'Healthcare · web & mobile',
      description: 'An AI-assisted pre-visit interface for symptom intake, care discovery, and patient workflows. Making complex information feel clear, calm, and approachable.',
      tags: ['React', 'JavaScript', 'Vite', 'MapLibre'],
      url: 'https://github.com/5erax/SEP490_FE_MedicalAIAssistant', note: 'care begins with clarity',
      image: '/media/medimate-preview.webp',
    },
    {
      name: 'MediMate Mobile', repository: '5erax/SEP490_MB_MedicalAIAssistant', role: 'Healthcare · mobile app',
      description: 'The mobile companion to MediMate AI, built with React Native and Expo. A personal health interface for sign-in, health profiles and care workflows.',
      tags: ['React Native', 'Expo', 'TypeScript'],
      url: 'https://github.com/5erax/SEP490_MB_MedicalAIAssistant', note: 'mobile app · sign-in screen',
      image: '/media/medimate-mobile-interface.webp',
    },
    {
      name: 'FinGenie', repository: '5erax/FinGenie', role: 'Personal finance · web & mobile',
      description: 'AI-assisted personal finance across web and mobile. A shared codebase brings together a Next.js web app, a NestJS API, an Expo mobile app, and PostgreSQL.',
      tags: ['Next.js', 'NestJS', 'Expo', 'PostgreSQL'],
      url: 'https://github.com/5erax/FinGenie', note: 'financial adventures · web interface', image: '/media/fingenie-interface.webp',
    },
    {
      name: 'GeoConnect', repository: '5erax/geoconnect', role: 'Maps & communities',
      description: 'Location-based communities, interactive maps, and real-time messaging. Built with React, Leaflet, and Socket.io.',
      tags: ['React', 'Leaflet', 'Socket.io'],
      url: 'https://github.com/5erax/geoconnect', note: 'places, people, conversations', image: '/media/geoconnect-preview.webp',
    },
    {
      name: 'CVmate', repository: '5erax/CVmate', role: 'Career tools',
      description: 'CV creation, ATS-oriented feedback, and interview practice. An interface for preparing the next step, built with React, TypeScript, and Hugging Face.',
      tags: ['React', 'TypeScript', 'Hugging Face'],
      url: 'https://github.com/5erax/CVmate', note: 'preparing the next chapter', image: '/media/cvmate-preview.webp',
    },
    {
      name: 'Ecommerce Mobile', repository: '5erax/ecomerce-mobile', role: 'Mobile commerce',
      description: 'A React Native and Expo shopping experience with product browsing, a wishlist, a cart, and order history.',
      tags: ['React Native', 'Expo'],
      url: 'https://github.com/5erax/ecomerce-mobile', note: 'mobile storefront · home screen', image: '/media/ecommerce-interface.webp',
    },
    {
      name: 'MLN Web', repository: '5erax/MLN-web', role: 'Interactive learning',
      description: 'An interactive Vietnamese Party history learning platform, with lessons, timelines, and quizzes.',
      tags: ['Education', 'Timelines', 'Quizzes'],
      url: 'https://github.com/5erax/MLN-web', note: 'history through interaction', image: '/media/mln-preview.webp',
    },
    {
      name: 'MLN AI', repository: '5erax/MLN-AI', role: 'Learning platform · web experience',
      description: 'A Vietnamese Marx–Lenin philosophy learning application with an AI chatbot and a dedicated sign-in experience. Built with React, FastAPI and Supabase.',
      tags: ['React', 'FastAPI', 'Supabase'], url: 'https://mln-ai.vercel.app/', note: 'learning platform · sign-in screen',
      image: '/media/mln-ai-interface.webp',
    },
  ],
  route: [
    { year: '2020–2024', title: 'Computer science studies', place: 'Vietnam', text: 'Programming, databases, algorithms, and software development fundamentals. The foundation behind the interface.' },
    { year: '2023', title: 'Frontend internship', place: 'Vietnam', text: 'Responsive layouts, reusable components, and interface consistency. Learning to build for the people using the product.' },
    { year: '2024–present', title: 'Fullstack development', place: 'Vietnam', text: 'Web and mobile applications, with particular care for UI and interaction. Components, APIs, and the data flows between them.' },
    { year: 'Now', title: 'Recent GitHub work', place: 'Ho Chi Minh', text: 'Web, mobile and interactive projects.' },
  ],
  links: [
    { label: 'GitHub', url: 'https://github.com/5erax' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/dha2608', disabled: true },
    { label: 'MediMate live', url: 'https://sep-490-fe-medical-ai-assistant.vercel.app' },
  ],
  labels: ['Cover', 'About', 'Work', 'Journey', 'Contact'],
  workTitle: 'Selected work',
  routeTitle: 'My journey so far',
  contactTitle: 'Send a note to Astraa',
} satisfies TornPostcardPortfolioProps;

export default async function Page() {
  const projects = await getGitHubProjects(portfolio.projects);
  const latest = projects[0];
  return <main><TornPostcardPortfolio {...portfolio} projects={projects}
    note={`Recently working on ${latest.name}`}
    about={{ ...portfolio.about, facts: portfolio.about.facts.map(fact =>
      fact.label === 'Latest contribution' ? { ...fact, value: latest.name } : fact) }}
    route={portfolio.route.map(stop => stop.year === 'Now'
      ? { ...stop, title: latest.name, text: latest.description } : stop)}
  /></main>;
}
