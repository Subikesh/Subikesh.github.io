import raw from './data.json'

export interface SocialLink { label: string; url: string; icon: string }
export interface ProjectButton { url: string; text: string }
export interface Project {
  title: string
  image: string
  alt: string
  description: string
  points?: string[]
  tags?: string[]
  buttons: ProjectButton[]
}
export interface ResumeRole {
  heading: string
  period: string
  ol: { title: string; ul: string[] }[]
}
export interface SkillGroup {
  heading: string
  ul: (string | { title: string; ul: string[] })[]
}

interface Data {
  meta: {
    pageTitle: string
    name: string
    designation: string
    resumePdf: string
    contactFormUrl: string
    description: string
    social: SocialLink[]
  }
  about: { content: string[] }
  projects: Project[]
  resume: (
    | { heading: 'Experience'; list: ResumeRole[] }
    | { heading: 'Education'; ul: string[] }
    | { heading: 'Skills'; list: SkillGroup[] }
  )[]
}

export const data = raw as unknown as Data

export const meta = data.meta
export const about = data.about
export const projects = data.projects
export const experience = (data.resume.find(s => s.heading === 'Experience') as { list: ResumeRole[] }).list
export const education = (data.resume.find(s => s.heading === 'Education') as { ul: string[] }).ul
export const skills = (data.resume.find(s => s.heading === 'Skills') as { list: SkillGroup[] }).list

/** URL-friendly id for a project, used in hash routes. */
export function projectId(p: Project): string {
  return p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').split('-').slice(0, 2).join('-')
}
