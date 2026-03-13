import { Users, HeartHandshake, ShieldCheck, UserCheck, LineChart, ClipboardCheck } from 'lucide-react';

export const impactJourneys = [
  {
    id: 'connect',
    icon: Users,
    title: 'Connect & Follow',
    description: 'Join vibrant communities and follow impact makers who align with your personal values.',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'fund',
    icon: HeartHandshake,
    title: 'Fund & Volunteer',
    description: 'Directly contribute funds or offer your unique skills to projects that need immediate support.',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'organize',
    icon: ShieldCheck,
    title: 'Become an Organizer',
    description: 'Launch your own social movement, lead change, and manage your impact with full transparency.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  }
];

export const mockProjects = [
  {
    id: '1',
    category: 'Environment',
    categoryColor: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Amazon Reforestation Initiative',
    description: 'Help us plant 50,000 native trees in the degraded areas of the Amazon basin.',
    progress: 85,
    target: '$50,000'
  },
  {
    id: '2',
    category: 'Education',
    categoryColor: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Community Literacy Program',
    description: 'Providing essential reading materials and tutoring for underprivileged youth.',
    progress: 45,
    target: '$12,000'
  },
  {
    id: '3',
    category: 'Health',
    categoryColor: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Mobile Health Clinic',
    description: 'A mobile unit to provide free medical checkups for remote rural communities.',
    progress: 60,
    target: '$25,000'
  }
];

export const transparencyPromises = [
  { id: 'kyc', icon: UserCheck, text: 'Every organizer is KYC verified.' },
  { id: 'ledger', icon: LineChart, text: 'Every transaction is tracked on our public ledger.' },
  { id: 'proof', icon: ClipboardCheck, text: 'Every project requires proof of disbursement to release funds.' },
];