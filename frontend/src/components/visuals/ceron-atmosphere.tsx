export function CeronAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(15_35_65_/_0.32),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgb(15_35_65_/_0.45),transparent_55%)]" />

      {/* Blue nebula */}
      <div className="absolute -left-40 top-24 size-[30rem] rounded-full bg-primary/8 blur-3xl dark:bg-primary/10" />

      {/* Cyan nebula */}
      <div className="absolute -right-40 top-1/3 size-[32rem] rounded-full bg-cyan-400/6 blur-3xl dark:bg-cyan-400/8" />

      {/* Central depth */}
      <div className="absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-950/5 blur-3xl dark:bg-blue-950/15" />

      {/* Main stars */}
      <div
        className="absolute inset-0 animate-ceron-twinkle opacity-40 dark:opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(circle at 8% 12%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 17% 34%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 29% 18%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 41% 9%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 56% 22%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 68% 11%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 79% 31%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 91% 17%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 13% 67%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 27% 82%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 47% 72%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 63% 88%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 76% 69%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 88% 82%, white 0 1px, transparent 1.5px)
          `,
        }}
      />

      {/* Secondary softer stars */}
      <div
        className="absolute inset-0 animate-ceron-twinkle-soft opacity-20 dark:opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 23% 7%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 35% 46%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 52% 14%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 72% 52%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 84% 74%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 6% 91%, white 0 1px, transparent 1.5px)
          `,
        }}
      />

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_20%,rgb(0_0_0_/_0.18)_100%)] dark:bg-[radial-gradient(circle_at_50%_35%,transparent_20%,rgb(0_0_0_/_0.38)_100%)]" />
    </div>
  );
}