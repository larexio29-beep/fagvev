import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Sparkles,
  ArrowUpRight,
  Ruler,
  Leaf,
  BookOpen,
  Languages,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { subjectClass, type Subject } from "../lib/model";
export const subjectIcons = {
  TIF: Wrench,
  Matematikk: Ruler,
  Naturfag: Leaf,
  Norsk: BookOpen,
  Engelsk: Languages,
};
export function Tags({ values }: { values: Subject[] }) {
  return (
    <div className="tags">
      {values.map((s) => (
        <span className={`tag ${subjectClass[s]}`} key={s}>
          {s}
        </span>
      ))}
    </div>
  );
}
export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="demo-notice">
      <Sparkles size={17} />
      <span>
        {children ||
          "Demonstrasjon · Forslagene er regelbaserte eksempler, ikke ekte KI-analyse. Læringstemaene er ikke offisielle kompetansemål."}
      </span>
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal">
          <div className="modal-header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>
                {description || "FagVev · Demonstrasjon med fiktive data"}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Lukk">
              <X size={22} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function SectionTitle({
  title,
  sub,
  action,
  onAction,
}: {
  title: string;
  sub?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowUpRight size={17} />
        </button>
      )}
    </div>
  );
}
export function WorkshopArt({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      className={`workshop-art variant-${variant}`}
      viewBox="0 0 500 320"
      role="img"
      aria-label={
        variant % 2
          ? "Illustrasjon av materialer og verkstedarbeid"
          : "Illustrasjon av aksling, måleverktøy og arbeidstegning"
      }
    >
      <defs>
        <pattern
          id={`grid-${variant}`}
          width="25"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M25 0H0V25"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".12"
          />
        </pattern>
        <linearGradient id={`metal-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2eee2" />
          <stop offset=".45" stopColor="#b3c9c7" />
          <stop offset="1" stopColor="#6e9390" />
        </linearGradient>
      </defs>
      <rect width="500" height="320" fill={`url(#grid-${variant})`} />
      <circle
        cx="265"
        cy="160"
        r="108"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".15"
      />
      <circle
        cx="265"
        cy="160"
        r="82"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".15"
        strokeDasharray="3 8"
      />
      <g
        transform={
          variant % 2
            ? "translate(50 10) rotate(-14 240 160)"
            : "rotate(-25 250 160)"
        }
      >
        <path
          d="M90 141 320 141 350 158 350 192 320 210 90 210Z"
          fill={`url(#metal-${variant})`}
          stroke="#60847f"
        />
        <ellipse
          cx="91"
          cy="175"
          rx="27"
          ry="34"
          fill="#c9d8d1"
          stroke="#60847f"
        />
        <ellipse cx="91" cy="175" rx="10" ry="14" fill="#668983" />
        <path d="M165 143v65m110-65v65m42-65v65" stroke="#71928c" />
        <path d="M105 155h210" stroke="#fff" strokeOpacity=".7" />
        <path
          d="M110 100h240m-240-8v16m240-16v16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="202"
          y="90"
          fill="currentColor"
          fontSize="12"
          fontFamily="monospace"
        >
          Ø 25 × 120
        </text>
        <g transform="translate(180 225)">
          <path d="M-30 0h230v16H-30z" fill="#e8eee4" stroke="#60847f" />
          <path
            d="M0-60v78h-16v-78m60 10v68H28v-68"
            fill="#b9cfc3"
            stroke="#60847f"
          />
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 10} 2v${i % 5 === 0 ? 11 : 6}`}
              stroke="#60847f"
            />
          ))}
        </g>
      </g>
      <path
        d="M400 45v30m-15-15h30M55 250v20m-10-10h20"
        stroke="currentColor"
        strokeOpacity=".5"
      />
      <text
        x="350"
        y="285"
        fontFamily="monospace"
        fontSize="10"
        fill="currentColor"
        opacity=".6"
      >
        FAGVEV / VERKSTED 01
      </text>
    </svg>
  );
}
