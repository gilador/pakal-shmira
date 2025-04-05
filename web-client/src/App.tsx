import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { ShiftManager } from "./components/ShiftManager";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container flex h-16 items-center px-4">
              <h1 className="text-2xl font-bold">Shift Optimizer</h1>
            </div>
          </header>
          <main className="container py-6">
            <ShiftManager />
          </main>
        </div>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
