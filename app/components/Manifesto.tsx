"use client";

import { motion } from "motion/react";
import DonateLink from "./DonateLink";

export default function Manifesto() {
  return (
    <section className="paper-grain-dark relative isolate overflow-hidden bg-ink py-28 text-bone sm:py-36">
      <div className="mx-auto max-w-4xl px-5 sm:px-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
          § 02 — the manifesto
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9 }}
          className="mt-6 font-serif text-5xl leading-[1.05] sm:text-7xl"
        >
          this is a record.<br />
          <span className="italic text-blood">it is anonymous.</span><br />
          it cannot be edited.<br />
          it cannot be censored.<br />
          one voice, one entry.
        </motion.h2>

        <div className="mt-16 grid gap-8 border-t border-bone/15 pt-10 sm:grid-cols-2">
          <p className="font-serif text-xl italic leading-snug text-bone/85">
            a quiet room, owned by nobody, where the species can speak to itself.
          </p>
          <p className="font-serif text-xl italic leading-snug text-bone/85">
            if something here is also true for you — share this place. that is the
            only way it grows.
          </p>
        </div>

        <div className="mt-20 grid gap-6 border-t border-bone/15 pt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/55 sm:grid-cols-4 sm:gap-12">
          <div>
            <div className="text-bone/40">colophon</div>
            <p className="mt-2 leading-relaxed text-bone/75">
              instrument serif · jetbrains mono · geist. equal earth projection.
              built in the open.
            </p>
          </div>
          <div>
            <div className="text-bone/40">contact</div>
            <p className="mt-2 leading-relaxed text-bone/75">
              this site has no inbox. it only listens.
            </p>
          </div>
          <div>
            <div className="text-bone/40">share</div>
            <p className="mt-2 leading-relaxed text-bone/75">
              whatisyourconcern.com — pass it along.
            </p>
          </div>
          <div>
            <div className="text-bone/40">source</div>
            <a
              href="https://github.com/coeymusa/What-is-your-concern"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 leading-relaxed text-bone/75 transition hover:text-bone"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>open source ↗</span>
            </a>
          </div>
        </div>

        <div className="mt-12 flex justify-start">
          <DonateLink variant="block" />
        </div>

        <div className="mt-16 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
          <span>vol. I · entry no. 0001 — onward</span>
          <span className="hidden sm:inline">© the record · {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}
