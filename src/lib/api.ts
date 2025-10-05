import { supabase } from './supabase'
import type { Resource, Coach, Submission } from './types'

// Resources API
export const resourcesApi = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Coaches API
export const coachesApi = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Submissions API
export const submissionsApi = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateStatus(id: string, status: string, resurfaceDate?: string) {
    const updateData: any = { status }

    const { error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
  },

  async updateTags(id: string, tags: string[]) {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ tags })
      .eq('id', id)

    if (error) throw error
  },

  async updateResurfaceDate(id: string, resurfaceDate: string | null) {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ resurface_date: resurfaceDate })
      .eq('id', id)

    if (error) throw error
  },

  async softDelete(id: string) {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }
}