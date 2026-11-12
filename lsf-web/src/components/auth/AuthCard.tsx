interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="panel flex flex-col gap-6 p-8 shadow-hard-lg">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold leading-none">{title}</h1>
        <p className="text-ink/75">{subtitle}</p>
      </div>

      {children}

      <p className="border-t-[3px] border-ink pt-4 text-center text-ink/80">{footer}</p>
    </div>
  );
}
