// Tag system for contact submissions
// Provides categorized tags and utilities for displaying them

// Activity tags - track actions taken
export const ACTIVITY_TAGS = [
  'Email Sent',
  'Call Made', 
  'Meeting Held',
  'Proposal Sent',
  'Follow-up Scheduled'
] as const;

// Service tags - categorize what the client wants
export const SERVICE_TAGS = [
  'AI Strategy',
  'Team Training',
  'Implementation', 
  'Ongoing Mentorship',
  'Resource Access'
] as const;

// Status tags - qualify the lead
export const STATUS_TAGS = [
  'Hot Lead',
  'Budget Approved',
  'Decision Maker',
  'Follow-up Required',
  'Waiting on Client'
] as const;

// Combined array of all available tags
export const ALL_SUBMISSION_TAGS = [
  ...ACTIVITY_TAGS,
  ...SERVICE_TAGS,
  ...STATUS_TAGS
] as const;

// Type for tag categories
export type TagCategory = 'activity' | 'service' | 'status';

// Helper function to determine which category a tag belongs to
export function getTagCategory(tag: string): TagCategory {
  if (ACTIVITY_TAGS.includes(tag as any)) {
    return 'activity';
  }
  if (SERVICE_TAGS.includes(tag as any)) {
    return 'service';
  }
  if (STATUS_TAGS.includes(tag as any)) {
    return 'status';
  }
  // Default to status if tag not found
  return 'status';
}

// Helper function to get Tailwind CSS classes for tag colors based on category
export function getTagColor(tag: string): string {
  const category = getTagCategory(tag);
  
  switch (category) {
    case 'activity':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'service':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'status':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}