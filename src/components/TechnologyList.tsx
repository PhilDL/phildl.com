import { resolveTechnology } from "@/utils/technologyRegistry";

type TechnologyListProps = {
  technologies: readonly string[];
  className?: string;
};

export default function TechnologyList({ technologies, className }: TechnologyListProps) {
  return (
    <ul className={["flex flex-wrap items-center gap-x-4 gap-y-2", className].filter(Boolean).join(" ")}>
      {technologies.map((technology, index) => {
        const label = technology.trim();
        const definition = resolveTechnology(label);
        const Logo = definition?.logo;

        return (
          <li className="inline-flex items-center gap-1.5" key={`${definition?.key ?? label}-${index}`}>
            {Logo ? <Logo aria-hidden="true" className="size-4 shrink-0" height={16} width={16} /> : null}
            <span>{label || definition?.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
