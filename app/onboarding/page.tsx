import { PageShell, SectionHeader } from "@/components/ui";
import { OnboardingForm } from "@/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Onboarding"
        title="Help DomusGraph grow the Housing Graph"
        body="Choose the role that fits you. These structured answers shape the product and improve Verified Housing Events."
      />
      <OnboardingForm />
    </PageShell>
  );
}
