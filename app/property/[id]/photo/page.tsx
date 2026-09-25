import { EmptyState, PageShell, SectionHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { submitPhotoAction } from "@/lib/actions";
import { getCurrentUser, getProperty } from "@/lib/data";
import { logAnalyticsEvent } from "@/lib/events";

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return (
      <PageShell>
        <SectionHeader eyebrow="Evidence" title="Add a photo" />
        <EmptyState
          title="Sign in to add a photo"
          body="Photos are tied to your account so we can moderate content and follow up if there's a dispute. It only takes a magic link, no password."
          href={`/auth/sign-in?next=${encodeURIComponent(`/property/${id}/photo`)}`}
          action="Sign in"
        />
      </PageShell>
    );
  }
  await logAnalyticsEvent("photo_started", { property_id: id });
  const property = await getProperty(id);
  const action = submitPhotoAction.bind(null, id);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Evidence"
        title="Add a photo"
        body={property ? `Add a photo as evidence for ${property.address_line_1}. JPEG, PNG, or WebP, up to 5MB.` : "Add a photo as evidence for this property. JPEG, PNG, or WebP, up to 5MB."}
      />
      <form action={action} className="panel grid gap-5">
        <label className="grid gap-2">
          <span className="label">Photo</span>
          <input
            className="field file:mr-3 file:rounded-md file:border-0 file:bg-onyx file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white file:transition-colors file:duration-150 file:ease-out hover:file:bg-graphite"
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
        <div>
          <SubmitButton pendingText="Uploading…">Upload photo</SubmitButton>
        </div>
      </form>
    </PageShell>
  );
}
