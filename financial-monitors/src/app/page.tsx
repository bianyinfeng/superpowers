"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import TreasuryMonitor from "@/components/monitors/TreasuryMonitor";
import USDMonitor from "@/components/monitors/USDMonitor";
import GoldMonitor from "@/components/monitors/GoldMonitor";
import InflationMonitor from "@/components/monitors/InflationMonitor";

type Tab = "treasury" | "usd" | "gold" | "inflation";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("treasury");

  return (
    <main className="min-h-screen">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "treasury" && <TreasuryMonitor />}
        {activeTab === "usd" && <USDMonitor />}
        {activeTab === "gold" && <GoldMonitor />}
        {activeTab === "inflation" && <InflationMonitor />}
      </div>
    </main>
  );
}
