interface AuthSubmitButtonProps {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
}

export function AuthSubmitButton({ isLoading, label, loadingLabel }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-900/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
