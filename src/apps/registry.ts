import type { ComponentType } from 'react'
import type { IconName } from '../ui/Icon'
import { AboutApp } from './AboutApp'
import { ProjectsApp } from './ProjectsApp'
import { ResumeApp } from './ResumeApp'
import { ContactApp } from './ContactApp'
import { SettingsApp } from './SettingsApp'
import { meta } from '../content'

export interface AppDef {
  id: string
  label: string
  icon: IconName
  component?: ComponentType
  /** External apps open in a new tab instead of a window. */
  url?: string
}

export const APPS: AppDef[] = [
  { id: 'about', label: 'About Me', icon: 'person', component: AboutApp },
  { id: 'projects', label: 'Projects', icon: 'code', component: ProjectsApp },
  { id: 'resume', label: 'Resume', icon: 'description', component: ResumeApp },
  { id: 'contact', label: 'Contact', icon: 'mail', component: ContactApp },
  { id: 'settings', label: 'Settings', icon: 'settings', component: SettingsApp },
]

const social = (label: string) => meta.social.find(s => s.label === label)

export const LINK_APPS: AppDef[] = [
  { id: 'github', label: 'GitHub', icon: 'github', url: social('Github')?.url },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', url: social('LinkedIn')?.url },
  { id: 'playstore', label: 'NewsBuddy', icon: 'newsbuddy', url: 'https://play.google.com/store/apps/details?id=com.spacey.newsbuddy.android' },
]

export const GRID_APPS: AppDef[] = [...LINK_APPS, APPS.find(a => a.id === 'settings')!]
export const DOCK_APPS: AppDef[] = APPS.filter(a => ['about', 'projects', 'resume', 'contact'].includes(a.id))

export function getApp(id: string | undefined): AppDef | null {
  if (!id) return null
  return APPS.find(a => a.id === id) ?? null
}
