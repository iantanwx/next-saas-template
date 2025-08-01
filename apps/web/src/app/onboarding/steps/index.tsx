'use client';

import { Button } from '@superscale/ui/components/button';
import { Card, CardFooter } from '@superscale/ui/components/card';
import { Progress } from '@superscale/ui/components/progress';
import { UserWithMemberships } from '@superscale/crud/types';
import { useState } from 'react';
import { Wizard, useWizard } from 'react-use-wizard';
import NameStep from './name';
import OrganizationStep from './organization';

interface FooterProps {
  loading: boolean;
}

interface OnboardingStepConfig {
  renderNext: boolean;
}

const onboardingConfig: Record<number, OnboardingStepConfig> = {
  0: {
    renderNext: true,
  },
  1: {
    renderNext: true,
  },
};

function Footer({ loading }: FooterProps) {
  const { activeStep, previousStep, isFirstStep, isLastStep, stepCount } =
    useWizard();
  const progress = Math.ceil(((activeStep + 1) / stepCount) * 100);
  const stepConfig =
    onboardingConfig[activeStep as keyof typeof onboardingConfig];
  return (
    <CardFooter className="flex flex-row justify-between space-x-2">
      <div className="flex w-28 flex-col space-y-2">
        <span className="text-sm text-gray-500">
          Step {activeStep + 1} / {stepCount}
        </span>
        <Progress value={progress} />
      </div>
      <div className="flex flex-row space-x-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={previousStep}>
            Previous
          </Button>
        )}
        {!isLastStep && stepConfig?.renderNext && (
          <Button type="submit" form={`onboarding-step-${activeStep + 1}`}>
            Next
          </Button>
        )}
        {isLastStep && stepConfig?.renderNext && (
          <Button type="submit" form={`onboarding-step-${activeStep + 1}`}>
            Finish
          </Button>
        )}
      </div>
    </CardFooter>
  );
}

interface OnboardingProps {
  user: UserWithMemberships;
}

function getOnboardingStep(user: UserWithMemberships) {
  if (!user.name) {
    return 0;
  }

  return 1;
}

export default function Onboarding(props: OnboardingProps) {
  const { user } = props;

  const initialStep = getOnboardingStep(user);
  const [loading, setLoading] = useState(false);

  return (
    <Card className="flex flex-col px-8 py-6 md:h-[500px] md:w-[600px]">
      <Wizard
        startIndex={initialStep}
        wrapper={<div className="flex flex-1 flex-col justify-center" />}
        footer={<Footer loading={loading} />}
      >
        <NameStep user={user} setLoading={setLoading} />
        {!user.memberships.length && (
          <OrganizationStep user={user} setLoading={setLoading} />
        )}
      </Wizard>
    </Card>
  );
}
