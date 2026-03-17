export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl md:text-[2rem] font-bold font-heading text-foreground tracking-tight leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{description}</p>
      )}
    </div>
  );
}
