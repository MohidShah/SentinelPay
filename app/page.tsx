"use client";

import React, { useState } from "react";
import { WelcomeSelector } from "@/components/welcome-selector";
import { LandingPage } from "@/components/landing-page";
import { DashboardShell } from "@/components/dashboard-shell";

export default function Home() {
  const [viewMode, setViewMode] = useState<"welcome" | "story" | "dashboard">("welcome");
  const [initialScenario, setInitialScenario] = useState<string | undefined>(undefined);
  const [initialPersona, setInitialPersona] = useState<"shopper" | "admin">("shopper");

  if (viewMode === "welcome") {
    return (
      <WelcomeSelector
        onSelectStory={() => setViewMode("story")}
        onSelectShopper={() => {
          setInitialPersona("shopper");
          setInitialScenario(undefined);
          setViewMode("dashboard");
        }}
        onSelectAdmin={() => {
          setInitialPersona("admin");
          setInitialScenario(undefined);
          setViewMode("dashboard");
        }}
        onRunScenario={(scenario) => {
          setInitialPersona("admin");
          setInitialScenario(scenario);
          setViewMode("dashboard");
        }}
      />
    );
  }

  if (viewMode === "story") {
    return (
      <LandingPage
        onEnterApp={() => {
          setInitialPersona("admin");
          setInitialScenario(undefined);
          setViewMode("dashboard");
        }}
        onOpenSelector={() => setViewMode("welcome")}
        onExploreScenario={(scenario) => {
          setInitialPersona("admin");
          setInitialScenario(scenario);
          setViewMode("dashboard");
        }}
      />
    );
  }

  return (
    <DashboardShell
      initialScenario={initialScenario}
      initialPersona={initialPersona}
      onBackToWelcome={() => setViewMode("welcome")}
      onOpenStory={() => setViewMode("story")}
    />
  );
}
