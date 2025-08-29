import { BubbleChat } from "../BubbleChat";
import { CorporateChat } from "../CorporateChat";
import { EducationChat } from "../EducationChat";
import { ElegantChat } from "../ElegantChat";
import { GamingChat } from "../GamingChat";
import { HealthcareChat } from "../HealthcareChat";
import { MinimalChat } from "../MinimalChat";
import { ModernChat } from "../ModernChat";
import { ProfessionalChat } from "../ProfessionalChat";
import { RetailChat } from "../RetailChat";
import { GlassDockChat } from "../Premium/GlassDockChat";
import { MessengerChat } from "../Premium/MessengerChat";

export   const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Sleek gradient design with rounded corners',
      component: ModernChat,
      preview: 'bg-gradient-to-r from-blue-500 to-purple-500',
      features: ['Gradient backgrounds', 'Smooth animations', 'Modern typography'],
      category: 'General'
    },
    {
      id: 'glassdock',
      name: 'Glass Dock',
      description: 'Premium glassmorphism dock with quick actions',
      component: GlassDockChat,
      preview: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      features: ['Glass blur', 'Quick replies', 'Scroll-to-bottom pill'],
      category: 'Premium'
    },
    {
      id: 'messenger',
      name: 'Messenger',
      description: 'Messenger-style conversational UI',
      component: MessengerChat,
      preview: 'bg-gray-200',
      features: ['Grouped bubbles', 'Reactions', 'Read indicators'],
      category: 'Premium'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and simple interface',
      component: MinimalChat,
      preview: 'bg-gray-100 border border-gray-300',
      features: ['Clean lines', 'Subtle shadows', 'Focused design'],
      category: 'General'
    },
    {
      id: 'bubble',
      name: 'Bubble',
      description: 'Playful bubble-style messages',
      component: BubbleChat,
      preview: 'bg-gradient-to-r from-pink-400 to-rose-400',
      features: ['Rounded bubbles', 'Playful colors', 'Friendly feel'],
      category: 'General'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Corporate and business-focused',
      component: ProfessionalChat,
      preview: 'bg-slate-700',
      features: ['Corporate colors', 'Professional tone', 'Business ready'],
      category: 'Business'
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Enterprise-grade professional design',
      component: CorporateChat,
      preview: 'bg-gradient-to-r from-gray-700 to-gray-800',
      features: ['Enterprise design', 'Formal tone', 'Corporate branding'],
      category: 'Business'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Gaming-inspired with neon accents',
      component: GamingChat,
      preview: 'bg-gradient-to-r from-green-500 to-emerald-500',
      features: ['Neon colors', 'Gaming aesthetics', 'High contrast'],
      category: 'Entertainment'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated and refined',
      component: ElegantChat,
      preview: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      features: ['Elegant gradients', 'Refined typography', 'Luxury feel'],
      category: 'Premium'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical and health-focused design',
      component: HealthcareChat,
      preview: 'bg-gradient-to-r from-teal-500 to-cyan-500',
      features: ['Medical colors', 'Trust-building', 'Health-focused'],
      category: 'Industry'
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Learning and academic environment',
      component: EducationChat,
      preview: 'bg-gradient-to-r from-amber-500 to-orange-500',
      features: ['Academic colors', 'Learning-focused', 'Student-friendly'],
      category: 'Industry'
    },
    {
      id: 'retail',
      name: 'Retail',
      description: 'E-commerce and shopping experience',
      component: RetailChat,
      preview: 'bg-gradient-to-r from-rose-500 to-pink-500',
      features: ['Shopping colors', 'Customer-focused', 'Sales-oriented'],
      category: 'Industry'
    }
  ]

    export const categories = [
      "All",
      "General",
      "Business",
      "Industry",
      "Entertainment",
      "Premium",
    ];
