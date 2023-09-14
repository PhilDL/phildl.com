import { Sandpack } from "@codesandbox/sandpack-react";

const CodeSandbox = () => {
  const files = {};

  // return <div>HELLO WORLD</div>;

  return <Sandpack files={files} theme="light" template="astro" />;
};

export { CodeSandbox };

export default CodeSandbox;
