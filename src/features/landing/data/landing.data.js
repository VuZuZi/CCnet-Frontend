import { FiZap, FiShield, FiTrendingUp, FiUsers, FiLayers, FiCheck } from 'react-icons/fi'


export const programs = [
  {
    id: 'feather-rally',
    ageRange: '7-11 years',
    title: 'Feather Rally Club',
    description: 'Light, fast, agile – a badminton club with play and vision training.',
    emoji: '🏸',
    cardClass: 'card-purple',
    animationDelay: '0s'
  },
  {
    id: 'boxy-beats',
    ageRange: '8-13 years',
    title: 'Boxy Beats Club',
    description: 'Sharp moves and strong minds through playful boxing basics.',
    emoji: '🥊',
    cardClass: 'card-green',
    animationDelay: '0.5s'
  },
  {
    id: 'sky-gym',
    ageRange: '9-14 years',
    title: 'Sky Gym Academy',
    description: 'Fun strength and flexibility training on bars and the floor.',
    emoji: '🤸',
    cardClass: 'card-blue',
    animationDelay: '1s'
  },
  {
    id: 'dance-studio',
    ageRange: 'All ages',
    title: 'Dance Studio',
    description: 'Express yourself through rhythm, movement, and creativity.',
    emoji: '💃',
    cardClass: 'card-yellow',
    animationDelay: '1.5s'
  }
]


export const features = [
  {
    id: 'lightning-fast',
    icon: FiZap,
    title: 'Lightning Fast',
    description: 'Built with cutting-edge technology for blazing fast performance that scales with your needs.'
  },
  {
    id: 'secure',
    icon: FiShield,
    title: 'Secure by Default',
    description: 'CCNet-grade security with JWT authentication, token rotation, and data encryption.'
  },
  {
    id: 'analytics',
    icon: FiTrendingUp,
    title: 'Real-time Analytics',
    description: 'Track performance metrics and gain insights with beautiful, real-time dashboards.'
  },
  {
    id: 'collaboration',
    icon: FiUsers,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with role-based access control and team workspaces.'
  },
  {
    id: 'modular',
    icon: FiLayers,
    title: 'Modular Architecture',
    description: 'Extensible platform that grows with your business. Add features as you need them.'
  },
  {
    id: 'uptime',
    icon: FiCheck,
    title: '99.9% Uptime',
    description: 'Reliable infrastructure with automatic backups and disaster recovery built-in.'
  }
]


export const stats = [
  { id: 'users', value: '10K+', label: 'Active Users' },
  { id: 'tasks', value: '50K+', label: 'Tasks Completed' },
  { id: 'uptime', value: '99.9%', label: 'Uptime SLA' },
  { id: 'support', value: '24/7', label: 'Support Available' }
]


export const useCases = [
  {
    id: 'startups',
    icon: FiLayers,
    title: 'Startups',
    description: 'Move fast and build amazing products',
    color: 'purple'
  },
  {
    id: 'agencies',
    icon: FiUsers,
    title: 'Agencies',
    description: 'Manage multiple clients seamlessly',
    color: 'green'
  },
  {
    id: 'scaleups',
    icon: FiTrendingUp,
    title: 'Scale-ups',
    description: 'Grow your business efficiently',
    color: 'blue'
  },
  {
    id: 'ccnet',
    icon: FiShield,
    title: 'CCNet',
    description: 'CCNet-grade security and support',
    color: 'yellow'
  }
]


export const footerNavigation = {
  product: [
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' }
  ],
  company: [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ],
  legal: [
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' }
  ]
}