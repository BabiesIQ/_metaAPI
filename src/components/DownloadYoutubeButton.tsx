import { Download } from "lucide-react";

interface DownloadYoutubeButtonProps {
  compact?: boolean;
  className?: string;
  dataOcid?: string;
}

export function DownloadYoutubeButton({
  compact = false,
  className = "",
  dataOcid = "youtube-example.download.button",
}: DownloadYoutubeButtonProps) {
  return (
    <a
      href="/examples/Youtube.py"
      download="Youtube.py"
      title="Download Youtube.py"
      aria-label="Download Youtube.py REST API example"
      data-ocid={dataOcid}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors hover:border-primary/60 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        compact ? "h-8 w-8" : "h-9 px-3 text-xs font-medium"
      } ${className}`}
    >
      <Download className="h-3.5 w-3.5" />
      {!compact && <span>Download Youtube.py</span>}
    </a>
  );
}