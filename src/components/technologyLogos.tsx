import type { SVGProps } from "react";

import NodedotjsLogoBase from "@thesvg/react/nodedotjs";
import PostgresqlLogoBase from "@thesvg/react/postgresql";

type TechnologyLogoProps = SVGProps<SVGSVGElement>;

export function NodejsLogo(props: TechnologyLogoProps) {
  return <NodedotjsLogoBase {...props} />;
}

export function PostgresqlLogo(props: TechnologyLogoProps) {
  return <PostgresqlLogoBase color="#336791" fill="#336791" {...props} />;
}

export function NextjsLogo(props: TechnologyLogoProps) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="90" cy="90" r="89" fill="#FFF" stroke="#111827" strokeWidth="2" />
      <path
        d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
        fill="#111827"
      />
      <rect fill="#111827" height="72" width="12" x="115" y="54" />
    </svg>
  );
}
