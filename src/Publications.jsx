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
import { publication, project, verse, stages } from "./publications";
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
    stickyRef = useRef(null);
  useStageScrub(sectionRef, stageRef, stickyRef);
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
              Research that started with a simple question: how should a layered
              text be read?
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

        <Reveal className="pub-close">
          <span className="pub-close-rule" />
          <p>
            The interaction work and the software are the same idea, approached
            twice:
            <em> structure first, then everything that rests on it.</em>
          </p>
          <a className="text-link" href="#contact">
            Talk to me about it <ArrowUpRight size={17} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
