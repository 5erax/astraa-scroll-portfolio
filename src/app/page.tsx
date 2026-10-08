import TornPostcardPortfolio, { type TornPostcardPortfolioProps } from '@/components/ui/torn-postcard-portfolio';

// Identity, projects and journey: https://github.com/5erax/5erax
const portfolio = {
  name: 'Astraa',
  role: 'Fullstack developer · UI & interaction',
  location: 'Ho Chi Minh, Vietnam',
  since: '2024',
  headline: ['A developer with an', 'eye for the interface.'],
  intro: 'I build web apps, mobile experiences, and worlds to explore.',
  note: 'Currently building ProZ0',
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
      { label: 'Current focus', value: 'ProZ0 · in development' },
      { label: 'Open to', value: 'Frontend & fullstack opportunities' },
    ],
    skills: ['React', 'Next.js', 'TypeScript', 'Figma', 'PixiJS', 'React Native', 'Node.js', 'PostgreSQL'],
  },
  projects: [
    {
      name: 'ProZ0', role: 'Browser game · in development',
      description: 'A 2D pixel-art survival and exploration sandbox about building a new civilization and uncovering the traces of an older one. My current focus is its Phase 1 vertical slice.',
      tags: ['TypeScript', 'PixiJS', 'Vite'],
      url: 'https://github.com/5erax/ProZ0', note: 'current focus · in development',
      image: '/media/proz0-preview.webp',
    },
    {
      name: 'MediMate AI', role: 'Healthcare · web & mobile',
      description: 'An AI-assisted pre-visit interface for symptom intake, care discovery, and patient workflows. Making complex information feel clear, calm, and approachable.',
      tags: ['React', 'JavaScript', 'Vite', 'MapLibre'],
      url: 'https://github.com/5erax/SEP490_FE_MedicalAIAssistant', note: 'care begins with clarity',
      image: '/media/medimate-preview.webp',
    },
    {
      name: 'FinGenie', role: 'Personal finance · web & mobile',
      description: 'AI-assisted personal finance across web and mobile. A shared codebase brings together a Next.js web app, a NestJS API, an Expo mobile app, and PostgreSQL.',
      tags: ['Next.js', 'NestJS', 'Expo', 'PostgreSQL'],
      url: 'https://github.com/5erax/FinGenie', note: 'source repository · preview pending', image: '/media/fingenie-preview.webp',
    },
    {
      name: 'GeoConnect', role: 'Maps & communities',
      description: 'Location-based communities, interactive maps, and real-time messaging. Built with React, Leaflet, and Socket.io.',
      tags: ['React', 'Leaflet', 'Socket.io'],
      url: 'https://github.com/5erax/geoconnect', note: 'places, people, conversations', image: '/media/geoconnect-preview.webp',
    },
    {
      name: 'CVmate', role: 'Career tools',
      description: 'CV creation, ATS-oriented feedback, and interview practice. An interface for preparing the next step, built with React, TypeScript, and Hugging Face.',
      tags: ['React', 'TypeScript', 'Hugging Face'],
      url: 'https://github.com/5erax/CVmate', note: 'preparing the next chapter', image: '/media/cvmate-preview.webp',
    },
    {
      name: 'Ecommerce Mobile', role: 'Mobile commerce',
      description: 'A React Native and Expo shopping experience with product browsing, a wishlist, a cart, and order history.',
      tags: ['React Native', 'Expo'],
      url: 'https://github.com/5erax/ecomerce-mobile', note: 'source repository · preview pending', image: '/media/ecommerce-preview.webp',
    },
    {
      name: 'MLN Web', role: 'Interactive learning',
      description: 'An interactive Vietnamese Party history learning platform, with lessons, timelines, and quizzes.',
      tags: ['Education', 'Timelines', 'Quizzes'],
      url: 'https://github.com/5erax/MLN-web', note: 'history through interaction', image: '/media/mln-preview.webp',
    },
  ],
  route: [
    { year: '2020–24', title: 'Computer science studies', place: 'Vietnam', text: 'Programming, databases, algorithms, and software development fundamentals. The foundation behind the interface.' },
    { year: '2023', title: 'Frontend internship', place: 'Vietnam', text: 'Responsive layouts, reusable components, and interface consistency. Learning to build for the people using the product.' },
    { year: '2024–now', title: 'Fullstack development', place: 'Vietnam', text: 'Web and mobile applications, with particular care for UI and interaction. Components, APIs, and the data flows between them.' },
    { year: 'Now', title: 'Building ProZ0', place: 'Ho Chi Minh', text: 'A browser-first survival and exploration sandbox in TypeScript and PixiJS. Currently focused on the Phase 1 vertical slice.' },
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

export default function Page() {
  return <main><TornPostcardPortfolio {...portfolio} /></main>;
}
