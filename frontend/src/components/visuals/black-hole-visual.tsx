import Image from "next/image";

export function BlackHoleVisual() {
  return (
    <div
      aria-hidden="true"
      className="group relative aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
    >
      <Image
        src="/visuals/ceron/black-hole.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />

      {/* Blend the image into the dashboard surface */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/35 via-transparent to-transparent" />

      {/* Darken the lower edge for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

      {/* Subtle Ceron atmospheric tint */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgb(59_130_246_/_0.08),transparent_45%)]" />

      {/* Soft edge highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}