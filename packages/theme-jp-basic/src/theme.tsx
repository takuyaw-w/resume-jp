import { renderToString } from "preact-render-to-string";
import type { ResumeDocument, ThemeModule } from "@resume/theme-api";
import {
  formatWorkingPeriodDuration,
  getEnabledPhaseLabels,
  renderRole,
} from "@resume/theme-jp-common";

function SkillItemList(
  props: { items: Array<{ name: string; experienceText?: string; level?: string }> },
) {
  return (
    <ul class="skill-item-list">
      {props.items.map((item) => {
        const meta = [item.experienceText, item.level]
          .filter((value) => typeof value === "string" && value.trim().length > 0)
          .join(" / ");

        return (
          <li
            key={`${item.name}-${item.experienceText ?? ""}-${item.level ?? ""}`}
            class="skill-item"
          >
            {meta ? `${item.name}（${meta}）` : item.name}
          </li>
        );
      })}
    </ul>
  );
}

function ResumePage(props: { document: ResumeDocument }) {
  const doc = props.document;

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <title>{doc.profile.name.fullName} - Resume</title>
        <style>
          {`
          @page {
            size: A4;
            margin: 12mm;
          }

          :root {
            --text: #111111;
            --muted: #666666;
            --border: #d9d9d9;
            --bg-subtle: #f7f7f7;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px;
            color: var(--text);
            font-family: sans-serif;
            line-height: 1.7;
            background: #ffffff;
            font-size: 14px;
          }

          main {
            max-width: 960px;
            margin: 0 auto;
          }

          header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--border);
          }

          .name {
            margin: 0 0 6px;
            font-size: 28px;
            line-height: 1.2;
          }

          .kana {
            margin: 0 0 14px;
            color: var(--muted);
            font-size: 13px;
          }

          .meta-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 20px;
            margin: 0;
            padding: 0;
            list-style: none;
            font-size: 13px;
          }

          .meta-label {
            color: var(--muted);
            margin-right: 6px;
          }

          section {
            margin-bottom: 24px;
          }

          .section-title {
            margin: 0 0 12px;
            padding: 6px 10px;
            font-size: 16px;
            background: var(--bg-subtle);
            border-left: 4px solid var(--border);
          }

          .pre-wrap {
            margin: 0;
            white-space: pre-wrap;
          }

          .summary-table,
          .project-table {
            width: 100%;
            border-collapse: collapse;
          }

          .summary-table th,
          .summary-table td,
          .project-table th,
          .project-table td {
            padding: 8px 10px;
            border: 1px solid var(--border);
            vertical-align: top;
            text-align: left;
          }

          .summary-table th,
          .project-table th {
            width: 160px;
            background: var(--bg-subtle);
            font-weight: 700;
          }

          .skill-item-list {
            margin: 0;
            padding-left: 20px;
          }

          .skill-item {
            margin: 0 0 4px;
          }

          .skill-item:last-child {
            margin-bottom: 0;
          }

          .qualification-list {
            margin: 0;
            padding-left: 20px;
          }

          .project {
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
            page-break-inside: avoid;
          }

          .project:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }

          .project-title {
            margin: 0 0 8px;
            font-size: 16px;
          }

          .project-meta {
            margin: 0 0 10px;
            color: var(--muted);
            font-size: 13px;
          }

          .project-overview {
            margin: 0 0 12px;
          }

          @media print {
            body {
              padding: 0;
            }
          }
          `}
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1 class="name">{doc.profile.name.fullName}</h1>
            <p class="kana">{doc.profile.name.fullNameKana}</p>

            <ul class="meta-list">
              <li>
                <span class="meta-label">イニシャル</span>
                <span>{doc.profile.name.initials}</span>
              </li>
              <li>
                <span class="meta-label">最寄り駅</span>
                <span>{doc.profile.nearestStation}</span>
              </li>
              {doc.profile.gender && (
                <li>
                  <span class="meta-label">性別</span>
                  <span>{doc.profile.gender}</span>
                </li>
              )}
              {doc.profile.nationality && (
                <li>
                  <span class="meta-label">国籍</span>
                  <span>{doc.profile.nationality}</span>
                </li>
              )}
              <li>
                <span class="meta-label">経験年数</span>
                <span>{doc.profile.experience.totalLabel}</span>
              </li>
            </ul>
          </header>

          <section>
            <h2 class="section-title">得意分野</h2>
            <p class="pre-wrap">{doc.profile.specialtiesText}</p>
          </section>

          <section>
            <h2 class="section-title">スキルサマリ</h2>
            <table class="summary-table">
              <tbody>
                <tr>
                  <th>OS</th>
                  <td><SkillItemList items={doc.profile.skillSummary.os} /></td>
                </tr>
                <tr>
                  <th>言語</th>
                  <td><SkillItemList items={doc.profile.skillSummary.languages} /></td>
                </tr>
                <tr>
                  <th>フレームワーク</th>
                  <td><SkillItemList items={doc.profile.skillSummary.frameworks} /></td>
                </tr>
                <tr>
                  <th>データベース</th>
                  <td><SkillItemList items={doc.profile.skillSummary.databases} /></td>
                </tr>
                <tr>
                  <th>その他</th>
                  <td><SkillItemList items={doc.profile.skillSummary.others} /></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 class="section-title">自己PR</h2>
            <p class="pre-wrap">{doc.profile.selfPr}</p>
          </section>

          {doc.qualifications.length > 0 && (
            <section>
              <h2 class="section-title">資格</h2>
              <ul class="qualification-list">
                {doc.qualifications.map((item) => (
                  <li key={`${item.name}-${item.acquiredAt}`}>
                    {item.name}（{item.acquiredAt}）
                  </li>
                ))}
              </ul>
            </section>
          )}

          {doc.projects.length > 0 && (
            <section>
              <h2 class="section-title">参画プロジェクト</h2>

              {doc.projects.map((project, index) => (
                <article
                  key={`${project.projectName}-${project.period.from}-${project.period.to}`}
                  class="project"
                >
                  <h3 class="project-title">
                    {index + 1}. {project.projectName}
                  </h3>

                  <p class="project-meta">
                    期間: {project.period.from} - {project.period.to}
                    {" / "}
                    稼働期間: {formatWorkingPeriodDuration(
                      project.period.from,
                      project.period.to,
                    )}
                    {" / "}
                    役割: {renderRole(project.role)}
                  </p>

                  <p class="project-overview">{project.overview}</p>

                  <table class="project-table">
                    <tbody>
                      <tr>
                        <th>使用言語</th>
                        <td>{project.techStack.languages.join(", ")}</td>
                      </tr>
                      <tr>
                        <th>サーバーOS</th>
                        <td>{project.techStack.serverOs.join(", ")}</td>
                      </tr>
                      <tr>
                        <th>DB</th>
                        <td>{project.techStack.databases.join(", ")}</td>
                      </tr>
                      <tr>
                        <th>フレームワーク</th>
                        <td>{project.techStack.frameworks.join(", ")}</td>
                      </tr>
                      <tr>
                        <th>ツール</th>
                        <td>{project.techStack.tools.join(", ")}</td>
                      </tr>
                      <tr>
                        <th>その他</th>
                        <td>{project.techStack.others.join(", ")}</td>
                      </tr>
                      <tr>
                        <th>担当工程</th>
                        <td>{getEnabledPhaseLabels(project.phases).join(" / ")}</td>
                      </tr>
                    </tbody>
                  </table>
                </article>
              ))}
            </section>
          )}
        </main>
      </body>
    </html>
  );
}

export const jpBasicTheme: ThemeModule = {
  meta: {
    id: "jp-basic",
    displayName: "Japanese Basic",
    version: "0.1.0",
  },
  render(document) {
    return `<!doctype html>${renderToString(<ResumePage document={document} />)}`;
  },
};
