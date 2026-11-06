import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Asterisk,
  Award,
  BookOpen,
  Ear,
  Fingerprint,
  Hand,
  Layers,
  Mic,
  Quote,
  ScrollText,
  Sparkles,
} from "lucide-react";
import {
  publication,
  project,
  verse,
  stages,
  award,
  awardActs,
} from "./publications";
import { HeadingLine } from "./MotionDesign";

function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.07, rootMargin: "0px 0px -25px 0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}

// The sticky stage owns its own scrub range, so the decomposition completes exactly
// as the sticky panel finishes travelling — independent of section length.
function useStageScrub(sectionRef, stageRef, stickyRef) {
  useEffect(() => {
    const section = sectionRef.current,
      stage = stageRef.current,
      sticky = stickyRef.current;
    if (!section || !stage || !sticky) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      start = 0,
      travel = 1,
      flow = false;
    const measure = () => {
      const offset = parseFloat(getComputedStyle(sticky).top) || 96;
      // If the panel cannot fit the viewport, present it as flowing content
      // rather than trapping part of it inside a viewport-height sticky box.
      flow = sticky.scrollHeight > innerHeight - offset - 26;
      stage.dataset.fit = flow ? "flow" : "sticky";
      const stageTop = stage.getBoundingClientRect().top + scrollY;
      if (flow) {
        start = stageTop - innerHeight * 0.8;
        travel = Math.max(340, stage.offsetHeight * 0.92);
      } else {
        start = stageTop - offset;
        travel = Math.max(1, stage.offsetHeight - sticky.offsetHeight);
      }
    };
    const apply = () => {
      frame = 0;
      const value = reduced.matches
        ? 1
        : Math.max(0, Math.min(1, (scrollY - start) / travel));
      section.style.setProperty("--stage-scroll", value.toFixed(4));
      section.dataset.stage = (
        Math.min(4, Math.floor(value * 5)) + 1
      ).toString();
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const reset = () => {
      flow = false;
      measure();
      request();
    };
    request();
    measure();
    apply();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", reset, { passive: true });
    reduced.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", request);
      removeEventListener("resize", reset);
      reduced.removeEventListener("change", reset);
    };
  }, [sectionRef, stageRef, stickyRef]);
}

// The award stage scrubs on its own variable so its three acts land exactly
// where the sticky panel finishes travelling, regardless of section length.
function useAwardScrub(wrapRef, stageRef, panelRef) {
  useEffect(() => {
    const wrap = wrapRef.current,
      stage = stageRef.current,
      panel = panelRef.current;
    if (!wrap || !stage || !panel) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      start = 0,
      travel = 1,
      flow = false;
    const measure = () => {
      const offset = parseFloat(getComputedStyle(panel).top) || 96;
      flow = panel.scrollHeight > innerHeight - offset - 26;
      stage.dataset.fit = flow ? "flow" : "sticky";
      const stageTop = stage.getBoundingClientRect().top + scrollY;
      if (flow) {
        start = stageTop - innerHeight * 0.8;
        travel = Math.max(340, stage.offsetHeight * 0.92);
      } else {
        start = stageTop - offset;
        travel = Math.max(1, stage.offsetHeight - panel.offsetHeight);
      }
    };
    const apply = () => {
      frame = 0;
      const value = reduced.matches
        ? 1
        : Math.max(0, Math.min(1, (scrollY - start) / travel));
      wrap.style.setProperty("--award-scroll", value.toFixed(4));
      wrap.dataset.act = value < 0.36 ? "1" : value < 0.7 ? "2" : "3";
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const reset = () => {
      flow = false;
      measure();
      request();
    };
    request();
    measure();
    apply();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", reset, { passive: true });
    reduced.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", request);
      removeEventListener("resize", reset);
      reduced.removeEventListener("change", reset);
    };
  }, [wrapRef, stageRef, panelRef]);
}

// The framed proof unfolds as it travels through the viewport — no pinning,
// so the certificate fold reads on any screen height.
function useProofScrub(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const apply = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      const value = reduced.matches
        ? 1
        : Math.max(
            0,
            Math.min(1, (innerHeight * 0.92 - top) / (innerHeight * 0.66)),
          );
      el.style.setProperty("--proof-scroll", value.toFixed(4));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    request();
    apply();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    reduced.addEventListener("change", request);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      reduced.removeEventListener("change", request);
    };
  }, [ref]);
}

const LAUREL_LEAVES = [
  [84, 132, -125],
  [73, 114, -55],
  [62, 96, -112],
  [57, 76, -48],
  [55, 44, -100],
  [56, 30, -40],
];

const ARC_PATH = "M 96 158 C 236 30, 418 46, 544 172";

function AwardStage({ wrapRef, stageRef, panelRef }) {
  return (
    <div className="award" ref={wrapRef} data-award data-act="1">
      <Reveal className="award-head">
        <span className="eyebrow award-eyebrow">
          RECOGNITION · {award.conferenceShort}
        </span>
        <h3 id="award-heading">
          Then the work travelled,
          <em> and came back awarded.</em>
        </h3>
      </Reveal>

      <div className="award-stage" ref={stageRef} aria-labelledby="award-heading">
        <div className="award-stage-sticky" ref={panelRef}>
          <div className="pub-stage-rail award-rail" aria-hidden="true">
            <span className="pub-rail-track">
              <i />
            </span>
            {awardActs.map((act) => (
              <span
                className="pub-rail-step"
                key={act.id}
                style={{ "--fill-at": act.fillAt }}
              >
                <i />
                <b>{act.number}</b>
                <em>{act.label}</em>
              </span>
            ))}
          </div>

          <div className="award-acts">
            <div className="award-act act-1">
              <div className="award-act-intro">
              <span className="eyebrow">THE PAPER</span>
              <h4 className="award-paper-title">
                {award.paper.lines.map((line, index) => (
                  <span
                    className="award-title-line"
                    key={line}
                    style={{ "--t": 0.02 + index * 0.05 }}
                  >
                    <i>{line}</i>
                  </span>
                ))}
              </h4>
              <p className="award-idea">{award.paper.idea}</p>
              </div>
              <div className="award-metrics">
                {award.paper.metrics.map((metric) => (
                  <span
                    className="award-metric"
                    key={metric.label}
                    style={{ "--t": metric.at }}
                  >
                    <b>{metric.value}</b>
                    <em>{metric.label}</em>
                  </span>
                ))}
              </div>
            </div>

            <div className="award-act act-2">
              <svg
                className="award-route"
                viewBox="0 0 640 240"
                role="img"
                aria-label={`Route of the paper: from ${award.route.from.place}, where it was written, to ${award.route.to.place}, where it was presented`}
              >
                <path className="award-route-base" d={ARC_PATH} pathLength="600" />
                <path className="award-route-draw" d={ARC_PATH} pathLength="600" />
                <g className="award-plane" aria-hidden="true">
                  <path d="M0 -7 L14 0 L0 7 L3.5 0 Z" />
                </g>
                <g className="award-node award-node-a">
                  <circle cx="96" cy="158" r="5" />
                  <circle className="award-node-ring" cx="96" cy="158" r="10" />
                </g>
                <g className="award-node award-node-b">
                  <circle cx="544" cy="172" r="5" />
                  <circle className="award-node-ring" cx="544" cy="172" r="10" />
                </g>
                <text className="award-route-label" x="96" y="188" textAnchor="middle">
                  {award.route.from.place}
                </text>
                <text className="award-route-note" x="96" y="204" textAnchor="middle">
                  {award.route.from.note}
                </text>
                <text className="award-route-label" x="544" y="202" textAnchor="middle">
                  {award.route.to.place}
                </text>
                <text className="award-route-note" x="544" y="218" textAnchor="middle">
                  {award.route.to.note}
                </text>
              </svg>
              <p className="award-caption">{award.route.caption}</p>
            </div>

            <div className="award-act act-3">
              <div className="award-verdict">
                <svg
                  className="award-laurel award-laurel-left"
                  viewBox="0 0 120 160"
                  aria-hidden="true"
                >
                  <path
                    className="award-laurel-stem"
                    d="M96 150 C 62 122, 48 78, 58 18"
                    pathLength="200"
                  />
                  {LAUREL_LEAVES.map(([x, y, r], index) => (
                    <g key={index} transform={`translate(${x} ${y}) rotate(${r})`}>
                      <path
                        className="award-leaf"
                        style={{ "--i": index }}
                        d="M0 0 C 10 -7, 22 -8, 30 -2 C 22 5, 10 6, 0 0 Z"
                      />
                    </g>
                  ))}
                </svg>
                <div className="award-verdict-lock">
                  <span className="award-verdict-kicker">
                    {award.conferenceShort} · {award.dates}
                  </span>
                  <strong className="award-verdict-title">
                    <i>{award.verdict.title}</i>
                  </strong>
                  <span className="award-verdict-session">
                    {award.verdict.session}
                  </span>
                  <span className="award-verdict-line">{award.verdict.line}</span>
                </div>
                <svg
                  className="award-laurel award-laurel-right"
                  viewBox="0 0 120 160"
                  aria-hidden="true"
                >
                  <path
                    className="award-laurel-stem"
                    d="M96 150 C 62 122, 48 78, 58 18"
                    pathLength="200"
                  />
                  {LAUREL_LEAVES.map(([x, y, r], index) => (
                    <g key={index} transform={`translate(${x} ${y}) rotate(${r})`}>
                      <path
                        className="award-leaf"
                        style={{ "--i": index }}
                        d="M0 0 C 10 -7, 22 -8, 30 -2 C 22 5, 10 6, 0 0 Z"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AwardProof({ proofRef }) {
  const [certificate, memento] = award.artifacts;
  return (
    <div className="award-proof" ref={proofRef} data-award-proof>
      <Reveal className="award-proof-head">
        <span className="eyebrow">THE PROOF, FRAMED</span>
        <p>Signed in two countries, carried home in one bag.</p>
      </Reveal>

      <div className="award-artifacts">
        <figure
          className="award-artifact award-artifact-cert"
          style={{ "--img": `url(${certificate.src})` }}
        >
          <div className="award-fold" role="img" aria-label={certificate.alt}>
            <div className="fold-seg fold-1">
              <i className="fold-face front" />
              <i className="fold-face back" />
              <div className="fold-seg fold-2">
                <i className="fold-face front" />
                <i className="fold-face back" />
                <div className="fold-seg fold-3">
                  <i className="fold-face front" />
                  <i className="fold-face back" />
                </div>
              </div>
            </div>
          </div>
          <figcaption>{certificate.caption}</figcaption>
        </figure>

        <figure className="award-artifact award-artifact-memento">
          <span className="award-memento-frame">
            <img src={memento.src} alt={memento.alt} loading="lazy" />
          </span>
          <figcaption>{memento.caption}</figcaption>
        </figure>
      </div>

      <Reveal className="award-credits">
        <div className="award-credits-main">
          <span className="eyebrow">FIVE AUTHORS, ONE TRACK</span>
          <p className="award-authors">
            {award.authors.map((author, index) => (
              <span className="award-author" key={author} data-lead={index === 0 || undefined}>
                {author}
              </span>
            ))}
          </p>
          <p className="award-role">{award.role}</p>
        </div>
        <div className="award-credits-side">
          <span className="eyebrow">SIGNED BY</span>
          {award.signatories.map((line) => (
            <p className="award-signatory" key={line}>
              {line}
            </p>
          ))}
          <span className="eyebrow">CONVENED BY</span>
          <p className="award-signatory">{award.organisers}</p>
        </div>
      </Reveal>
    </div>
  );
}

const WAVE_BARS = [
  8, 14, 22, 30, 40, 31, 23, 36, 44, 33, 25, 40, 28, 18, 26, 34, 21, 13, 9, 16,
];
const TACTILE_DOTS = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [1, 1],
  [3, 1],
  [0, 2],
  [3, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [0, 4],
];

// The scroll position itself drives every stage of the decomposition.
function VerseAnatomy({ stageRef, stickyRef }) {
  return (
    <div
      className="pub-stage"
      ref={stageRef}
      aria-labelledby="pub-anatomy-heading"
    >
      <div className="pub-stage-sticky" ref={stickyRef}>
        <div className="pub-stage-head">
          <div>
            <span className="eyebrow">READING ONE VERSE, STRUCTURALLY</span>
            <h3 id="pub-anatomy-heading">
              A verse is not a sentence.
              <em> It is a structure.</em>
            </h3>
          </div>
          <div className="pub-stage-rail" aria-hidden="true">
            <span className="pub-rail-track">
              <i />
            </span>
            {stages.map((stage, index) => (
              <span
                className="pub-rail-step"
                key={stage.id}
                style={{ "--index": index, "--fill-at": stage.fillAt ?? 0 }}
              >
                <i />
                <b>{stage.number}</b>
                <em>{stage.label}</em>
              </span>
            ))}
          </div>
        </div>

        <div className="pub-stage-grid">
          <div className="pub-verse">
            <div className="pub-verse-ref">
              <ScrollText size={14} />
              <span>{verse.reference}</span>
              <span className="pub-verse-speaker">{verse.speaker}</span>
            </div>
            <p className="pub-devanagari">
              {verse.tokens.map((token, index) => (
                <span
                  className="pub-token"
                  key={token.word + index}
                  style={{ "--index": index }}
                >
                  {token.word}
                </span>
              ))}
            </p>
            <p className="pub-iast">{verse.iast}</p>
            <p className="pub-translation">
              <Quote size={15} />
              {verse.translation}
            </p>
            <div className="pub-compounds">
              <span className="eyebrow">COMPOUNDS REJOINED</span>
              <div className="pub-chips">
                {verse.compounds.map((compound) => (
                  <div className="pub-compound" key={compound.raw}>
                    <b>{compound.raw}</b>
                    <span>{compound.parts}</span>
                    <small>{compound.gloss}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pub-breakdown">
            <div className="pub-breakdown-head">
              <Layers size={15} />
              <span className="eyebrow">WORD-LEVEL BREAKDOWN</span>
            </div>
            <ul className="pub-words">
              {verse.tokens.map((token, index) => (
                <li
                  className="pub-word"
                  key={token.word + index}
                  style={{ "--t": 0.3 + index * 0.045, "--index": index }}
                >
                  <span className="pub-word-deva">{token.word}</span>
                  <span className="pub-word-iast">{token.iast}</span>
                  <span className="pub-word-meaning">{token.meaning}</span>
                  <span className="pub-word-tag">{token.tag}</span>
                  <span className="pub-word-note">{token.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pub-access">
          <div className="pub-access-mode">
            <Hand size={17} />
            <strong>Tactile</strong>
            <span>Trace the structure at the fingertips.</span>
          </div>
          <div className="pub-access-mode">
            <Mic size={17} />
            <strong>Voice</strong>
            <span>Move by chapter, verse, or word.</span>
          </div>
          <div className="pub-access-mode">
            <Ear size={17} />
            <strong>Assessment</strong>
            <span>Hear the recitation compared.</span>
          </div>
          <div className="pub-access-signals">
            <span className="pub-tactile" aria-hidden="true">
              {TACTILE_DOTS.map(([x, y], index) => (
                <i
                  key={index}
                  style={{ "--x": x, "--y": y, "--index": index }}
                />
              ))}
            </span>
            <span className="pub-wave" aria-hidden="true">
              {WAVE_BARS.map((height, index) => (
                <i key={index} style={{ "--h": height, "--index": index }} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Publications() {
  const sectionRef = useRef(null),
    stageRef = useRef(null),
    stickyRef = useRef(null),
    awardWrapRef = useRef(null),
    awardStageRef = useRef(null),
    awardPanelRef = useRef(null),
    proofRef = useRef(null);
  useStageScrub(sectionRef, stageRef, stickyRef);
  useAwardScrub(awardWrapRef, awardStageRef, awardPanelRef);
  useProofScrub(proofRef);
  return (
    <section
      className="publications-section section-space"
      id="publications"
      ref={sectionRef}
      aria-labelledby="publications-heading"
    >
      <div className="container">
        <Reveal>
          <div className="section-label">
            <span className="section-number">02</span>
            <span>PUBLICATIONS &amp; RESEARCH</span>
          </div>
        </Reveal>
        <div className="section-heading-row">
          <Reveal>
            <h2 id="publications-heading">
              <HeadingLine>Written down</HeadingLine>
              <HeadingLine index={1}>
                <em>before it shipped.</em>
              </HeadingLine>
            </h2>
          </Reveal>
          <Reveal className="section-intro" delay={90}>
            <span className="mini-asterisk">
              <Asterisk size={24} />
            </span>
            <p>
              A patent application, and the platform it grew out of.
              <br />
              Plus a paper that flew to Sri Lanka and came back with its
              track&apos;s best-paper award.
            </p>
            <span className="eyebrow pub-years">2025 — PRESENT</span>
          </Reveal>
        </div>

        <VerseAnatomy stageRef={stageRef} stickyRef={stickyRef} />

        <div className="pub-grid">
          <Reveal className="pub-card pub-card-patent">
            <div className="pub-card-top">
              <span className="pub-chip">
                <Award size={14} /> {publication.kind}
              </span>
              <span className="pub-card-index">01</span>
            </div>
            <h3 className="pub-patent-title">{publication.title}</h3>
            <p className="pub-card-copy">{publication.summary}</p>
            <div className="pub-areas">
              {publication.areas.map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
            <p className="pub-audience">
              <Fingerprint size={14} /> {publication.audience}
            </p>
            <p className="pub-pending">
              Identifiers, publication venue, and dates will be added here as
              they become public.
            </p>
          </Reveal>

          <Reveal className="pub-card pub-card-project" delay={90}>
            <div className="pub-card-top">
              <span className="pub-chip">
                <Sparkles size={14} /> THE BUILD BEHIND IT
              </span>
              <span className="pub-card-index">02</span>
            </div>
            <h3 className="pub-project-name">{project.name}</h3>
            <p className="pub-project-tagline">{project.tagline}</p>
            <p className="pub-card-copy">{project.summary}</p>
            <div className="pub-focus">
              {project.focus.map((item) => (
                <span key={item}>
                  <BookOpen size={13} /> {item}
                </span>
              ))}
            </div>
            <p className="pub-note">{project.note}</p>
          </Reveal>
        </div>

        <AwardStage
          wrapRef={awardWrapRef}
          stageRef={awardStageRef}
          panelRef={awardPanelRef}
        />

        <AwardProof proofRef={proofRef} />

        <Reveal className="pub-close">
          <span className="pub-close-rule" />
          <p>
            A patent, a platform, and a best-paper award — the same habit three
            times over:
            <em> take the structure seriously, and the rest follows.</em>
          </p>
          <a className="text-link" href="#contact">
            Talk to me about it <ArrowUpRight size={17} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
