// Eyebrow pill + two-tone heading (dark line, then a muted line) used by every section.
export function SectionHeading({
  eyebrow,
  title1,
  title2,
  body,
  onDark,
  className = "text-center",
}: {
  eyebrow?: string;
  title1: string;
  title2: string;
  body?: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <p
          className={`inline-block rounded-full border px-4 py-1.5 text-sm ${
            onDark ? "border-white/15 text-lime" : "border-line bg-white text-teal"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="mt-5 text-balance text-3xl leading-[1.25] font-bold md:text-[2.75rem] rtl:leading-[1.45]">
        <span className="block">{title1}</span>
        <span className={`block ${onDark ? "text-paper/45" : "text-muted/55"}`}>{title2}</span>
      </h2>
      {body && (
        <p className={`mt-4 text-lg leading-8 ${onDark ? "text-paper/70" : "text-muted"}`}>{body}</p>
      )}
    </div>
  );
}
