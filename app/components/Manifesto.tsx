"use client";

import { motion } from "motion/react";
import DonateLink from "./DonateLink";

export default function Manifesto() {
  return (
    <section className="paper-grain-dark relative isolate overflow-hidden bg-ink py-28 text-bone sm:py-36">
      <div className="mx-auto max-w-4xl px-5 sm:px-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
          § 05 — the manifesto
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

        <div className="mt-20 grid gap-6 border-t border-bone/15 pt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/55 sm:grid-cols-3 sm:gap-12">
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
