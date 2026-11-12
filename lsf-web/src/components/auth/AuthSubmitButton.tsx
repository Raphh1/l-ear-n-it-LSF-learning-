interface AuthSubmitButtonProps {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
}

export function AuthSubmitButton({ isLoading, label, loadingLabel }: AuthSubmitButtonProps) {
  return (
    <button type="submit" disabled={isLoading} className="btn btn-ink btn-lg w-full">
      {isLoading ? loadingLabel : label}
    </button>
  );
}
