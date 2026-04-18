import { renderToString } from "preact-render-to-string";
import type { ResumeDocument, ThemeModule } from "@resume/theme-api";
import {
  formatWorkingPeriodDuration,
  getEnabledPhaseLabels,
  renderRole,
} from "@resume/theme-jp-common";

type SkillItem = {
  name: string;
  experienceText?: string;
  level?: string;
};

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function SkillItemList(props: { items: SkillItem[] }) {
  return (
    <ul class="skill-list">
      {props.items.map((item) => {
        const meta = [item.experienceText, item.level]
          .filter((value) => typeof value === "string" && value.trim().length > 0)
          .join(" / ");

        return (
          <li
            key={`${item.name}-${item.experienceText ?? ""}-${item.level ?? ""}`}
            class="skill-list__item"
          >
            <span class="skill-list__name">{item.name}</span>
            {meta && <span class="skill-list__meta">（{meta}）</span>}
          </li>
        );
      })}
    </ul>
  );
}

function SkillBlock(props: { label: string; items: SkillItem[] }) {
  return (
    <section class="skill-block">
      <div class="skill-block__label">{props.label}</div>
      <SkillItemList items={props.items} />
    </section>
  );
}

function MetaPill(props: { label: string; value: string }) {
  return (
    <div class="meta-pill">
      <div class="meta-pill__label">{props.label}</div>
      <div class="meta-pill__value">{props.value}</div>
    </div>
  );
}

function ResumePage(props: { document: ResumeDocument }) {
  const doc = props.document;
  const specialtyLines = splitLines(doc.profile.specialtiesText);

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{doc.profile.name.fullName} - Resume</title>
        <style>
          {`
          :root {
            --bg: #0f172a;
            --bg-accent: #111827;
            --panel: rgba(255, 255, 255, 0.94);
            --panel-soft: rgba(255, 255, 255, 0.88);
            --panel-dark: rgba(15, 23, 42, 0.78);
            --text: #0f172a;
            --text-soft: #475569;
            --text-light: rgba(255, 255, 255, 0.92);
            --border: rgba(148, 163, 184, 0.22);
            --chip: #e2e8f0;
            --accent: #7c3aed;
            --accent-soft: rgba(124, 58, 237, 0.12);
            --shadow-lg: 0 18px 50px rgba(15, 23, 42, 0.22);
            --shadow-md: 0 12px 30px rgba(15, 23, 42, 0.14);
            --radius-xl: 24px;
            --radius-lg: 18px;
            --radius-md: 14px;
          }

          * {
            box-sizing: border-box;
          }

          html {
            background:
              radial-gradient(circle at top left, rgba(124, 58, 237, 0.30), transparent 28%),
              radial-gradient(circle at top right, rgba(59, 130, 246, 0.22), transparent 30%),
              linear-gradient(180deg, var(--bg) 0%, var(--bg-accent) 100%);
          }

          body {
            margin: 0;
            min-height: 100vh;
            padding: 28px;
            color: var(--text);
            font-family: sans-serif;
            line-height: 1.65;
            background: transparent;
          }

          main {
            max-width: 1180px;
            margin: 0 auto;
          }

          .hero {
            position: relative;
            overflow: hidden;
            border-radius: 32px;
            padding: 32px;
            margin-bottom: 24px;
            background:
              linear-gradient(135deg, rgba(124, 58, 237, 0.88), rgba(30, 41, 59, 0.88)),
              linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: var(--text-light);
          }

          .hero::after {
            content: "";
            position: absolute;
            inset: auto -80px -120px auto;
            width: 280px;
            height: 280px;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%);
            pointer-events: none;
          }

          .hero__top {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
            flex-wrap: wrap;
            margin-bottom: 24px;
          }

          .hero__eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(255,255,255,0.10);
            font-size: 12px;
            letter-spacing: 0.08em;
            margin-bottom: 14px;
          }

          .hero__name {
            margin: 0 0 8px;
            font-size: 40px;
            line-height: 1.1;
            letter-spacing: 0.02em;
          }

          .hero__kana {
            margin: 0;
            color: rgba(255,255,255,0.76);
            font-size: 14px;
          }

          .hero__summary {
            max-width: 760px;
          }

          .hero__meta-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          .meta-pill {
            border-radius: 16px;
            padding: 12px 14px;
            background: rgba(255,255,255,0.10);
            border: 1px solid rgba(255,255,255,0.14);
            backdrop-filter: blur(8px);
          }

          .meta-pill__label {
            font-size: 11px;
            color: rgba(255,255,255,0.72);
            margin-bottom: 4px;
            letter-spacing: 0.04em;
          }

          .meta-pill__value {
            font-size: 14px;
            font-weight: 700;
            color: #fff;
          }

          .layout {
            display: grid;
            grid-template-columns: minmax(0, 0.96fr) minmax(320px, 0.72fr);
            gap: 20px;
            align-items: start;
          }

          .stack {
            display: grid;
            gap: 20px;
          }

          .panel {
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: var(--radius-xl);
            padding: 22px;
            box-shadow: var(--shadow-md);
          }

          .panel--soft {
            background: var(--panel-soft);
          }

          .panel__title {
            margin: 0 0 16px;
            font-size: 18px;
            line-height: 1.3;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .panel__title::before {
            content: "";
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 999px;
            background: linear-gradient(135deg, var(--accent), #3b82f6);
            flex: 0 0 auto;
          }

          .pre-wrap {
            margin: 0;
            white-space: pre-wrap;
          }

          .bullet-list {
            margin: 0;
            padding-left: 18px;
          }

          .bullet-list li {
            margin-bottom: 8px;
          }

          .bullet-list li:last-child {
            margin-bottom: 0;
          }

          .skill-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .skill-block {
            border-radius: var(--radius-lg);
            padding: 14px 14px 12px;
            background: linear-gradient(180deg, #ffffff, #f8fafc);
            border: 1px solid var(--border);
          }

          .skill-block__label {
            font-size: 12px;
            color: var(--text-soft);
            margin-bottom: 8px;
            font-weight: 700;
            letter-spacing: 0.03em;
          }

          .skill-list {
            margin: 0;
            padding-left: 18px;
          }

          .skill-list__item {
            margin-bottom: 6px;
          }

          .skill-list__item:last-child {
            margin-bottom: 0;
          }

          .skill-list__name {
            font-weight: 600;
          }

          .skill-list__meta {
            color: var(--text-soft);
          }

          .qualification-list {
            margin: 0;
            padding-left: 18px;
          }

          .qualification-list li {
            margin-bottom: 8px;
          }

          .qualification-list li:last-child {
            margin-bottom: 0;
          }

          .project-list {
            display: grid;
            gap: 16px;
          }

          .project-card {
            border-radius: 22px;
            padding: 18px;
            background:
              linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
            border: 1px solid var(--border);
            box-shadow: var(--shadow-md);
          }

          .project-card__head {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            flex-wrap: wrap;
            margin-bottom: 12px;
          }

          .project-card__title {
            margin: 0;
            font-size: 17px;
            line-height: 1.4;
          }

          .project-card__sub {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
          }

          .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 10px;
            border-radius: 999px;
            background: var(--accent-soft);
            color: #4c1d95;
            font-size: 12px;
            font-weight: 600;
          }

          .chip--dark {
            background: #e2e8f0;
            color: #1e293b;
          }

          .project-card__overview {
            margin: 0 0 14px;
            color: var(--text);
          }

          .project-meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 14px;
          }

          .meta-box {
            border-radius: 14px;
            padding: 12px 13px;
            background: #f8fafc;
            border: 1px solid var(--border);
          }

          .meta-box__label {
            font-size: 11px;
            color: var(--text-soft);
            margin-bottom: 5px;
            font-weight: 700;
            letter-spacing: 0.03em;
          }

          .meta-box__value {
            font-size: 13px;
            color: var(--text);
            word-break: break-word;
          }

          .phase-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .phase-chip {
            padding: 6px 10px;
            border-radius: 999px;
            background: #eef2ff;
            color: #3730a3;
            font-size: 12px;
            font-weight: 600;
          }

          .self-pr {
            color: var(--text);
          }

          @media (max-width: 980px) {
            body {
              padding: 18px;
            }

            .layout {
              grid-template-columns: 1fr;
            }

            .hero__meta-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .skill-grid,
            .project-meta-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .hero {
              padding: 22px;
              border-radius: 24px;
            }

            .hero__name {
              font-size: 30px;
            }

            .hero__meta-grid {
              grid-template-columns: 1fr;
            }

            .panel,
            .project-card {
              padding: 18px;
            }
          }

          @media print {
            html {
              background: white;
            }

            body {
              padding: 0;
              background: white;
            }

            .hero,
            .panel,
            .project-card {
              box-shadow: none;
            }
          }
          `}
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <div class="hero__top">
              <div class="hero__summary">
                <div class="hero__eyebrow">MODERN RESUME THEME</div>
                <h1 class="hero__name">{doc.profile.name.fullName}</h1>
                <p class="hero__kana">{doc.profile.name.fullNameKana}</p>
              </div>
            </div>

            <div class="hero__meta-grid">
              <MetaPill label="イニシャル" value={doc.profile.name.initials} />
              <MetaPill label="経験年数" value={doc.profile.experience.totalLabel} />
              <MetaPill label="最寄り駅" value={doc.profile.nearestStation} />
              <MetaPill label="性別" value={doc.profile.gender ?? "-"} />
              <MetaPill label="国籍" value={doc.profile.nationality ?? "-"} />
            </div>
          </section>

          <div class="layout">
            <div class="stack">
              <section class="panel">
                <h2 class="panel__title">得意分野</h2>
                {specialtyLines.length > 0
                  ? (
                    <ul class="bullet-list">
                      {specialtyLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )
                  : <p class="pre-wrap">{doc.profile.specialtiesText}</p>}
              </section>

              <section class="panel">
                <h2 class="panel__title">参画プロジェクト</h2>

                <div class="project-list">
                  {doc.projects.map((project, index) => (
                    <article
                      key={`${project.projectName}-${project.period.from}-${project.period.to}`}
                      class="project-card"
                    >
                      <div class="project-card__head">
                        <div>
                          <h3 class="project-card__title">
                            {index + 1}. {project.projectName}
                          </h3>
                          <div class="project-card__sub">
                            <span class="chip">
                              {project.period.from} - {project.period.to}
                            </span>
                            <span class="chip chip--dark">
                              稼働期間: {formatWorkingPeriodDuration(
                                project.period.from,
                                project.period.to,
                              )}
                            </span>
                            <span class="chip">{renderRole(project.role)}</span>
                          </div>
                        </div>
                      </div>

                      <p class="project-card__overview">{project.overview}</p>

                      <div class="project-meta-grid">
                        <div class="meta-box">
                          <div class="meta-box__label">使用言語</div>
                          <div class="meta-box__value">
                            {project.techStack.languages.join(", ")}
                          </div>
                        </div>
                        <div class="meta-box">
                          <div class="meta-box__label">サーバーOS</div>
                          <div class="meta-box__value">
                            {project.techStack.serverOs.join(", ")}
                          </div>
                        </div>
                        <div class="meta-box">
                          <div class="meta-box__label">データベース</div>
                          <div class="meta-box__value">
                            {project.techStack.databases.join(", ")}
                          </div>
                        </div>
                        <div class="meta-box">
                          <div class="meta-box__label">フレームワーク</div>
                          <div class="meta-box__value">
                            {project.techStack.frameworks.join(", ")}
                          </div>
                        </div>
                        <div class="meta-box">
                          <div class="meta-box__label">ツール</div>
                          <div class="meta-box__value">
                            {project.techStack.tools.join(", ")}
                          </div>
                        </div>
                        <div class="meta-box">
                          <div class="meta-box__label">その他</div>
                          <div class="meta-box__value">
                            {project.techStack.others.join(", ")}
                          </div>
                        </div>
                      </div>

                      <ul class="phase-list">
                        {getEnabledPhaseLabels(project.phases).map((label) => (
                          <li key={label} class="phase-chip">
                            {label}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div class="stack">
              <section class="panel panel--soft">
                <h2 class="panel__title">スキルサマリ</h2>
                <div class="skill-grid">
                  <SkillBlock label="OS" items={doc.profile.skillSummary.os} />
                  <SkillBlock label="言語" items={doc.profile.skillSummary.languages} />
                  <SkillBlock
                    label="フレームワーク"
                    items={doc.profile.skillSummary.frameworks}
                  />
                  <SkillBlock
                    label="データベース"
                    items={doc.profile.skillSummary.databases}
                  />
                  <SkillBlock label="その他" items={doc.profile.skillSummary.others} />
                </div>
              </section>

              <section class="panel">
                <h2 class="panel__title">自己PR</h2>
                <p class="pre-wrap self-pr">{doc.profile.selfPr}</p>
              </section>

              {doc.qualifications.length > 0 && (
                <section class="panel">
                  <h2 class="panel__title">資格</h2>
                  <ul class="qualification-list">
                    {doc.qualifications.map((item) => (
                      <li key={`${item.name}-${item.acquiredAt}`}>
                        {item.name}（{item.acquiredAt}）
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

export const jpModernTheme: ThemeModule = {
  meta: {
    id: "jp-modern",
    displayName: "Japanese Modern",
    version: "0.1.0",
  },
  render(document) {
    return `<!doctype html>${renderToString(<ResumePage document={document} />)}`;
  },
};
