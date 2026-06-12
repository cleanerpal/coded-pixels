'use client';

import { useCallback, useState, type ReactNode } from 'react';

import { MobilePricingBar } from '@/components/configurator/MobilePricingBar';
import { PreviewPlaceholder } from '@/components/configurator/PreviewPlaceholder';
import { PricingSidebar } from '@/components/configurator/PricingSidebar';
import {
  StepProgress,
  type ConfiguratorStep,
} from '@/components/configurator/StepProgress';
import { Step1Templates } from '@/components/configurator/Step1Templates';
import { Step2Features } from '@/components/configurator/Step2Features';
import { Step3Review } from '@/components/configurator/Step3Review';
import { useConfigUrlState } from '@/components/configurator/use-config-url-state';
import type { ConfigState } from '@/types';

function ConfiguratorLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading configurator">
      <div className="h-10 w-full max-w-lg rounded-card bg-border" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_280px]">
        <div className="hidden h-64 rounded-card bg-border lg:block" />
        <div className="h-96 rounded-card bg-border" />
        <div className="hidden h-64 rounded-card bg-border lg:block" />
      </div>
    </div>
  );
}

export function ConfiguratorShellFallback() {
  return <ConfiguratorLoading />;
}

function ConfiguratorContent() {
  const { config, setConfig } = useConfigUrlState();
  const [activeStep, setActiveStep] = useState<ConfiguratorStep>(1);

  const handleConfigChange = useCallback(
    (patch: Partial<ConfigState>) => {
      setConfig((previous) => ({ ...previous, ...patch }));
    },
    [setConfig],
  );

  let stepContent: ReactNode;
  switch (activeStep) {
    case 1:
      stepContent = (
        <Step1Templates config={config} onConfigChange={handleConfigChange} />
      );
      break;
    case 2:
      stepContent = (
        <Step2Features config={config} onConfigChange={handleConfigChange} />
      );
      break;
    case 3:
      stepContent = <Step3Review config={config} />;
      break;
  }

  return (
    <>
      <StepProgress activeStep={activeStep} onStepChange={setActiveStep} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_280px]">
        <PreviewPlaceholder config={config} />
        <div className="min-w-0">{stepContent}</div>
        <PricingSidebar config={config} onConfigChange={handleConfigChange} />
      </div>

      <MobilePricingBar config={config} />
    </>
  );
}

export function ConfiguratorShell() {
  return <ConfiguratorContent />;
}
