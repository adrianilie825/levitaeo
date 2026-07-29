"use client";

type UploadProgressBarProps = {
  percent: number;
  label?: string;
};

export default function UploadProgressBar({
  percent,
  label = "Uploading",
}: UploadProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-[13px] text-neutral-600">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden bg-[#ECE8E2]">
        <div
          className="h-full bg-[#111111] transition-[width] duration-150"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
