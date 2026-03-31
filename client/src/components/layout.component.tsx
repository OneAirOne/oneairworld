import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div>{children}</div>
    </div>
  );
}
