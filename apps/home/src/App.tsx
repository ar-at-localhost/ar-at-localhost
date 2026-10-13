import { GitBranch } from "lucide-react";
import { Button } from "ui/components/button";

function App() {
  return (
    <div className="w-full">
      <h1 className="font-mono text-center text-4xl font-bold p-8">ar-at-localhost</h1>
      <div className="w-full flex flex-row items-center justify-center">
        <Button variant="outline">
          <GitBranch data-icon="inline-start" />
          Github
        </Button>
      </div>
    </div>
  );
}

export default App;
