"use client";

interface ArcadeButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

const ArcadeButton: React.FC<ArcadeButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const baseClasses =
    "arcade-button px-6 py-4 text-center font-bold uppercase tracking-wider neon-border rounded-md transition-all";
  const variantClasses =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary/90"
      : "bg-secondary text-black hover:bg-secondary/90";
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default ArcadeButton;
