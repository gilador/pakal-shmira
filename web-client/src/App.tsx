import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { ShiftManager } from "./components/ShiftManager";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <div className=" bg-background flex flex-col h-screen pb-5">
          <div className="container flex h-4"></div>
          <main className="container flex-1 overflow-hidden">
            <ShiftManager />
          </main>
        </div>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
