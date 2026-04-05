import { renderToStaticMarkup } from "react-dom/server";

import { resolveTechnology } from "@/utils/technologyRegistry";

type TechnologyListProps = {
  technologies: readonly string[];
  className?: string;
};

function scopeSvgDefinitionIds(svgMarkup: string, idPrefix: string) {
  const ids = Array.from(svgMarkup.matchAll(/\sid="([^"]+)"/g), (match) => match[1]).filter((id): id is string =>
    Boolean(id),
  );

  if (ids.length === 0) {
    return svgMarkup;
  }

  return ids.reduce((scopedMarkup, id) => {
    const scopedId = `${idPrefix}-${id}`;

    return scopedMarkup
      .replaceAll(`id="${id}"`, `id="${scopedId}"`)
      .replaceAll(`url(#${id})`, `url(#${scopedId})`)
      .replaceAll(`href="#${id}"`, `href="#${scopedId}"`)
      .replaceAll(`xlink:href="#${id}"`, `xlink:href="#${scopedId}"`);
  }, svgMarkup);
}

export default function TechnologyList({ technologies, className }: TechnologyListProps) {
  return (
    <ul className={["flex flex-wrap items-center gap-x-4 gap-y-2", className].filter(Boolean).join(" ")}>
      {technologies.map((technology, index) => {
        const label = technology.trim();
        const definition = resolveTechnology(label);
        const Logo = definition?.logo;
        const scopedLogoIdPrefix = `tech-${definition?.key ?? label.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase()}-${index}`;
        const logoMarkup = Logo
          ? scopeSvgDefinitionIds(
              renderToStaticMarkup(<Logo aria-hidden="true" height={16} width={16} />),
              scopedLogoIdPrefix,
            )
          : null;

        return (
          <li className="inline-flex items-center gap-1.5" key={`${definition?.key ?? label}-${index}`}>
            {logoMarkup ? (
              <span
                aria-hidden="true"
                className="shrink-0 leading-none [&>svg]:size-4 [&>svg]:shrink-0"
                dangerouslySetInnerHTML={{ __html: logoMarkup }}
              />
            ) : null}
            <span>{label || definition?.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
