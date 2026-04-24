import type { ReactNode } from "react";

interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  return children;
}

export default App;