import * as React from "react";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function PushButton({ onClick, disabled = false, children }: Props) {
  if (disabled) {
    return (
      <button
        onClick={onClick}
        disabled
        className="rounded-xl border-0 p-0 cursor-not-allowed opacity-50 bg-brand-muted"
      >
        <span className="flex items-center gap-3 px-[42px] py-3 rounded-xl text-xl font-semibold text-white bg-brand-muted">
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group rounded-xl border-0 p-0 cursor-pointer outline-offset-4 bg-brand-shadow"
    >
      <span className="flex items-center gap-3 px-[42px] py-3 rounded-xl text-xl font-semibold text-white bg-brand-primary -translate-y-1 will-change-transform transition-transform duration-[250ms] group-hover:-translate-y-[6px] group-active:-translate-y-0.5">
        {children}
      </span>
    </button>
  );
}
