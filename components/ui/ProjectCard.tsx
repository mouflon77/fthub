'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { work } from '@/lib/site';
import { ArrowUpRight, Spark } from './Icons';
import { SocialLinks } from './SocialLinks';
import { useSheen } from './useSheen';

type Project = (typeof work.projects)[number];

const ACCENTS: Record<string, CSSProperties> = {
  primary: {
    '--card-glow-a': 'rgba(0, 122, 255, 0.42)',
    '--card-glow-b': 'rgba(0, 199, 255, 0.22)',
    '--point-color': '#4da3ff',
  } as CSSProperties,
  tertiary: {
    '--card-glow-a': 'rgba(215, 86, 0, 0.4)',
    '--card-glow-b': 'rgba(255, 168, 61, 0.2)',
    '--point-color': '#ff8a3d',
  } as CSSProperties,
};

export function ProjectCard({ project }: { project: Project }) {
  const ref = useSheen<HTMLElement>();

  return (
    <article ref={ref} className="card glass sheen" style={ACCENTS[project.accent]}>
      <div className="card-visual">
        <Image
          className="card-shot"
          src={project.image}
          alt={`${project.name} homepage`}
          fill
          sizes="(min-width: 900px) 42vw, 92vw"
          unoptimized
        />
        <span className="card-tag">{project.role}</span>
      </div>

      <div className="card-body">
        <div className="card-title">
          <h3>{project.name}</h3>
          <span className="card-host">{project.display}</span>
        </div>

        <p className="card-pitch">{project.pitch}</p>

        <ul className="card-points">
          {project.points.map((point) => (
            <li key={point}>
              <Spark />
              {point}
            </li>
          ))}
        </ul>

        <div className="card-foot">
          <SocialLinks links={project.socials} />
          <a
            className="btn btn-primary"
            href={project.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            Visit {project.name}
            <ArrowUpRight className="btn-arrow" />
          </a>
        </div>
      </div>
    </article>
  );
}
