import { ArrowUpRightIcon } from "@/components/simple/icons";
import { PixelIcon } from "@/components/simple/pixel-icon";
import { Win } from "@/components/simple/win";
import { fill, type SimpleCopy } from "@/lib/i18n/simple";
import type { PublicProject } from "@/lib/portfolio/contract";

/** How many projects get a window of their own; the rest go in one list. */
const FEATURED = 4;

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The projects that show their work (a real screenshot, then a case study) come
 * first, because a window with a picture says more than one with a paragraph. Within
 * each group the owner's own order from the terminal is kept.
 */
export function splitProjects(projects: PublicProject[]) {
  const shown = projects.filter((p) => p.caseStudy.images.length > 0);
  const plain = projects.filter((p) => p.caseStudy.images.length === 0);
  const ordered = [...shown, ...plain];
  return { featured: ordered.slice(0, FEATURED), rest: ordered.slice(FEATURED) };
}

function ProjectWindow({ project, copy }: { project: PublicProject; copy: SimpleCopy }) {
  const study = project.caseStudy;
  const cover = study.images[0];
  const facts = [
    [copy.projectRole, study.role],
    [copy.projectDuration, study.duration],
    [copy.projectTeam, study.team],
  ].filter(([, value]) => value);

  return (
    <Win bare className="sv-project" icon="folder" title={project.file}>
      {cover ? (
        <div className="sv-cover">
          {/* Screenshots are hosted elsewhere (GitHub, Drive); next/image has no loader for them. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={study.captions[0] || project.name} height={450} loading="lazy" referrerPolicy="no-referrer" src={cover} width={720} />
        </div>
      ) : null}
      <div className="sv-project-body">
        <h3>{project.name}</h3>
        <p className="sv-tagline">{project.tagline}</p>
        <p>{project.desc}</p>

        {study.metrics.length > 0 ? (
          <dl className="sv-metrics">
            {study.metrics.map((metric) => (
              <div key={metric.label}>
                <dd>{metric.value}</dd>
                <dt>{metric.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}

        {study.problem ? (
          <p>
            <strong>{copy.projectProblem}.</strong> {study.problem}
          </p>
        ) : null}
        {study.result ? (
          <p>
            <strong>{copy.projectResult}.</strong> {study.result}
          </p>
        ) : null}

        {facts.length > 0 ? (
          <dl className="sv-meta">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {project.stack.length > 0 ? (
          <ul className="sv-tags">
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {project.demo || project.repo ? (
          <p className="sv-links">
            {project.demo ? (
              <a className="sv-link" href={project.demo} rel="noopener" target="_blank">
                {copy.projectLive} <span>{hostOf(project.demo)}</span> <ArrowUpRightIcon size={14} />
              </a>
            ) : null}
            {project.repo ? (
              <a className="sv-link" href={project.repo} rel="noopener" target="_blank">
                {copy.projectSource} <ArrowUpRightIcon size={14} />
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
    </Win>
  );
}

export function Work({ projects, copy }: { projects: PublicProject[]; copy: SimpleCopy }) {
  const { featured, rest } = splitProjects(projects);

  return (
    <section className="sv-section" id="work">
      <div className="sv-wrap">
        <header className="sv-head">
          <p className="sv-label">C:\PORTFOLIO\PROJECTS</p>
          <h2>{copy.workTitle}</h2>
          <p>{copy.workIntro}</p>
          {copy.workLanguageNote ? <p className="sv-head-note">{copy.workLanguageNote}</p> : null}
        </header>

        {projects.length === 0 ? <p className="sv-empty">{copy.projectEmpty}</p> : null}

        <div className="sv-grid">
          {featured.map((project) => (
            <ProjectWindow copy={copy} key={project.id} project={project} />
          ))}
        </div>

        {rest.length > 0 ? (
          <Win bare className="sv-more" icon="folder" title={fill(copy.winMore, { n: rest.length })}>
            <ul className="sv-files">
              {rest.map((project) => (
                <li key={project.id}>
                  <PixelIcon name="txt" size={20} />
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project.tagline}</span>
                  </div>
                  <p className="sv-file-links">
                    {project.demo ? (
                      <a className="sv-link" href={project.demo} rel="noopener" target="_blank">
                        {copy.projectLive}
                      </a>
                    ) : null}
                    {project.repo ? (
                      <a className="sv-link" href={project.repo} rel="noopener" target="_blank">
                        {copy.projectSource}
                      </a>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </Win>
        ) : null}
      </div>
    </section>
  );
}
