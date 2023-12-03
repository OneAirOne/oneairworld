import styled from "@emotion/styled";
import { Typography } from "@mui/material";

const Pushable = styled("button")({
  background: "hsl(340, 100%, 32%)",
  borderRadius: "12px",
  border: "none",
  padding: "0",
  cursor: "pointer",
  outlineOffset: "4px",
  "&:hover .front": {
    transform: "translateY(-6px)",
  },

  "&:active .front": {
    transform: "translateY(-2px)",
  },
  "&:focus:not(:focus-visible)": {
    outline: "none",
  },

  cursor: "pointer",
});

const Front = styled("div")({
  display: "block",
  padding: "12px 42px",
  borderRadius: "12px",
  fontSize: "1.25rem",
  background: "hsl(345, 100%, 47%)",
  color: "white",
  transform: "translateY(-4px)",
  willChange: "transform",
  transition: "250ms",
});

interface Props {
  onClick: () => void;
}

export default function LaunchButton({ onClick }: Props) {
  async function handleClick() {
    onClick && onClick();
  }

  return (
    <Pushable onClick={handleClick}>
      <Front className="front">
        <Typography>Go ?</Typography>
      </Front>
    </Pushable>
  );
}
