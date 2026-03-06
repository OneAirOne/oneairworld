const SHADOW_COLOR = "hsl(120, 4%, 71%)";
const FACE_COLOR   = "hsl(345, 100%, 47%)";

interface Props {
  onClick: () => void;
}

export default function LaunchButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{ background: SHADOW_COLOR }}
      className="group rounded-xl border-0 p-0 cursor-pointer outline-offset-4"
    >
      <span
        style={{ background: FACE_COLOR }}
        className="flex items-center gap-3 px-[42px] py-3 rounded-xl text-xl font-semibold text-white -translate-y-1 will-change-transform transition-transform duration-[250ms] group-hover:-translate-y-[6px] group-active:-translate-y-0.5"
      >
        <img src="assets/avatar-opacity.gif" className="w-12 h-12 rounded-full" />
        Go
      </span>
    </button>
  );
}
