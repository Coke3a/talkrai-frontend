import { PageHeader } from "./page-header";

interface LoadingStateProps {
  title?: string;
}

export function LoadingState({ title }: LoadingStateProps) {
  return (
    <div className="page-wrapper">
      {title && <PageHeader title={title} />}
      <div className="px-5 pt-6">
        {/* Skeleton card */}
        <div className="skeleton-rect" style={{ height: 140, marginBottom: 20, borderRadius: "var(--radius-xl)" }} />
        {/* Skeleton rows */}
        <div className="skeleton-line" style={{ width: 80, height: 10, marginBottom: 14 }} />
        <div className="skeleton-rect" style={{ height: 72, marginBottom: 12, borderRadius: "var(--radius-lg)" }} />
        <div className="skeleton-rect" style={{ height: 72, marginBottom: 12, borderRadius: "var(--radius-lg)" }} />
        <div className="skeleton-line" style={{ width: 80, height: 10, marginBottom: 14, marginTop: 24 }} />
        <div className="skeleton-rect" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
      </div>
    </div>
  );
}
