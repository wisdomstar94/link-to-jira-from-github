import { ReactNode } from "react";

export function Layout(props: { children: ReactNode }) {
  return (
    <>
      <div className="w-[600px] h-[300px] bg-white relative">
        { props.children }
      </div>
    </>
  );
}