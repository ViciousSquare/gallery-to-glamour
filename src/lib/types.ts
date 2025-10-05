export interface Resource {
  id: string
  created_at: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  eligibility: string | null
  deadline: string | null
  featured: boolean
}

export interface Coach {
  id: string
  name: string
  bio: string | null
  image_url: string | null
  linkedin_url: string | null
  display_order: number
  active: boolean
  created_at: string
}

export interface Submission {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  company: string | null
  role: string | null
  interest_area: string | null
  goals: string | null
  status: string
  notes: string | null
  tags: string[]
  resurface_date: string | null
  deleted_at: string | null
}