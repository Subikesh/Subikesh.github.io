import { AppScreen } from '../ui/AppScreen'
import { Icon } from '../ui/Icon'
import { spawnRipple } from '../ui/Pressable'
import { education, experience, meta, skills } from '../content'

export function ResumeApp() {
  return (
    <AppScreen title="Resume">
      <div className="page-fade">
        <div className="section-label" style={{ paddingTop: 0 }}>Experience</div>
        {experience.map(role => (
          <div key={role.heading} className="card role-card">
            <div className="role-heading">{role.heading}</div>
            <div className="role-period">{role.period}</div>
            {role.ol.map(project => (
              <div key={project.title} className="role-project">
                <div className="role-project-title">{project.title}</div>
                <ul>
                  {project.ul.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        <div className="section-label">Education</div>
        <div className="card role-card">
          {education.map((line, i) => (
            <div key={i} className="pd-point" style={{ color: 'var(--md-on-surface)' }}>
              <Icon name="school" size={20} />
              <span>{line}</span>
            </div>
          ))}
        </div>

        <div className="section-label">Skills</div>
        <div className="card role-card">
          {skills.map(group => (
            <div key={group.heading} className="skill-group">
              <div className="skill-title">{group.heading}</div>
              <div className="chip-row">
                {group.ul.flatMap(item =>
                  typeof item === 'string'
                    ? [item]
                    : [item.title, ...item.ul],
                ).map(label => (
                  <span key={label} className="chip">{label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* clearance so the last card scrolls clear of the Download PDF FAB */}
        <div aria-hidden="true" style={{ height: 72 }} />
      </div>

      <a
        className="fab ripple-host"
        href={`/${meta.resumePdf}`}
        download="Subikesh_PS_Resume.pdf"
        onPointerDown={spawnRipple}
        aria-label="Download resume PDF"
      >
        <Icon name="download" size={22} />
        Download PDF
      </a>
    </AppScreen>
  )
}
