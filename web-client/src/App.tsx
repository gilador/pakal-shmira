import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { ShiftManager } from "./components/ShiftManager";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <div className="min-h-screen bg-background h-screen flex flex-col">
          <div className="container flex h-4"></div>
          <main className="container flex-1 overflow-y-auto pb-1">
            <ShiftManager />
          </main>
        </div>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
