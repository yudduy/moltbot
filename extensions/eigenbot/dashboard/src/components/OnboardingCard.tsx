import { CheckCircle, Loader2, XCircle } from "lucide-react";

interface Props {
  isLoading: boolean;
  error: unknown;
}

export default function OnboardingCard({ isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin mb-4" aria-hidden="true" />
        <p className="text-sm">Connecting to Eigenbot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16" aria-live="polite">
        <XCircle className="w-8 h-8 text-red-400 mb-4" aria-hidden="true" />
        <p className="text-sm text-red-400 font-medium mb-1">Connection failed</p>
        <p className="text-xs text-neutral-400">Make sure the gateway is running</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16" aria-live="polite">
      <CheckCircle className="w-8 h-8 text-emerald-400 mb-4" aria-hidden="true" />
      <p className="text-sm text-emerald-400 font-medium mb-1">Eigenbot is running</p>
      <p className="text-xs text-neutral-400">Waiting for agent activity — send a message to your agent through any channel</p>
    </div>
  );
}
