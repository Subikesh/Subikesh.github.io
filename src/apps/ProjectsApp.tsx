import { AppScreen, TopBar } from '../ui/AppScreen'
import { Icon } from '../ui/Icon'
import { Pressable, spawnRipple } from '../ui/Pressable'
import { useSystem } from '../system/SystemContext'
import { projectId, projects, type Project } from '../content'

function ProjectCard({ project, selected, onOpen }: { project: Project; selected?: boolean; onOpen: () => void }) {
  return (
    <Pressable
      className={`project-card card ${selected ? 'card-filled' : ''}`}
      onClick={onOpen}
      aria-label={project.title}
    >
      <img className="pc-image" src={project.image} alt={project.alt} loading="lazy" />
      <div className="pc-body">
        <div className="pc-title">{project.title}</div>
        <div className="pc-desc">{project.description}</div>
        {project.tags && (
          <div className="chip-row">
            {project.tags.slice(0, 3).map(t => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Pressable>
  )
}

function ProjectDetail({ project, embedded }: { project: Project; embedded?: boolean }) {
  const isNewsBuddy = project.title.includes('NewsBuddy')
  const body = (
    <div className={embedded ? 'page-fade' : 'page-forward'} style={embedded ? { padding: '16px' } : undefined}>
      <div className="pd-hero">
        <img src={project.image} alt={project.alt} />
      </div>
      <h1 className="pd-title">{project.title}</h1>
      {project.tags && (
        <div className="chip-row" style={{ padding: '4px' }}>
          {project.tags.map(t => (
            <span key={t} className="chip chip-tonal">{t}</span>
          ))}
        </div>
      )}
      <p className="pd-desc">{project.description}</p>
      {project.points && (
        <div className="pd-points">
          {project.points.map((pt, i) => (
            <div key={i} className="pd-point">
              <Icon name="check" size={18} />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      )}
      <div className="pd-buttons">
        {project.buttons.map((b, i) => (
          <a
            key={b.url}
            className={`btn ${i === 0 ? 'btn-filled' : 'btn-tonal'} ripple-host state-layer`}
            href={b.url}
            target="_blank"
            rel="noreferrer"
            onPointerDown={spawnRipple}
          >
            <Icon name="open_in_new" size={16} />
            {b.text}
          </a>
        ))}
        {isNewsBuddy && (
          <a
            className="btn btn-text ripple-host state-layer"
            href="/NewsBuddy/privacy_policy.html"
            target="_blank"
            rel="noreferrer"
            onPointerDown={spawnRipple}
          >
            Privacy Policy
          </a>
        )}
      </div>
    </div>
  )
  if (embedded) return <div className="screen-scroll" style={{ padding: 0 }}>{body}</div>
  return (
    <AppScreen title={project.title} noHeadline>
      {body}
    </AppScreen>
  )
}

export function ProjectsApp() {
  const { route, navigate, device } = useSystem()
  const selectedId = route[1]
  const detail = projects.find(p => projectId(p) === selectedId)

  // Tablet: list-detail two-pane layout, like a Compose ListDetailPaneScaffold.
  if (device === 'tablet') {
    const shown = detail ?? projects[0]
    return (
      <div className="screen">
        <TopBar title="Projects" scrolled />
        <div className="projects-panes">
          <div className="pane-list screen-scroll" style={{ paddingBottom: 24 }}>
            <div className="project-list" style={{ paddingTop: 8 }}>
              {projects.map(p => (
                <ProjectCard
                  key={p.title}
                  project={p}
                  selected={projectId(p) === projectId(shown)}
                  onOpen={() => navigate(`projects/${projectId(p)}`)}
                />
              ))}
            </div>
          </div>
          <div className="pane-detail">
            <ProjectDetail key={projectId(shown)} project={shown} embedded />
          </div>
        </div>
      </div>
    )
  }

  if (detail) return <ProjectDetail key={selectedId} project={detail} />

  return (
    <AppScreen title="Projects">
      <div className="project-list page-fade">
        {projects.map(p => (
          <ProjectCard key={p.title} project={p} onOpen={() => navigate(`projects/${projectId(p)}`)} />
        ))}
      </div>
    </AppScreen>
  )
}
