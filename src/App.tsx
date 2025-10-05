import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import Browse from "@/pages/Browse";
import DatasetDetail from "@/pages/DatasetDetail";
import ListDataset from "@/pages/ListDataset";
import Dashboard from "@/pages/Dashboard";
import Fund from "@/pages/Fund";
import Upload from "@/pages/Upload";
import Retrieve from "@/pages/Retrieve";
import Access from "@/pages/Access";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/dataset/:id" element={<DatasetDetail />} />
              <Route path="/list" element={<ListDataset />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fund" element={<Fund />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/retrieve" element={<Retrieve />} />
              <Route path="/access" element={<Access />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
