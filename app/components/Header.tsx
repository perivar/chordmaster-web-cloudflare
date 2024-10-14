import React from "react";

interface HeaderProps {
  title: string; // Mandatory title prop
  leftButtons?: React.ReactNode[]; // Optional array of buttons for the left side
  rightButtons?: React.ReactNode[]; // Optional array of buttons for the right side
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftButtons = [],
  rightButtons = [],
}) => {
  return (
    <div className="mb-2 flex w-full flex-row items-center justify-between">
      <div className="flex flex-1 flex-row items-center justify-start gap-2">
        {leftButtons}
      </div>
      <div className="flex-1 text-center text-xl font-semibold">{title}</div>
      <div className="ml-2 flex flex-1 flex-row items-center justify-end gap-2">
        {rightButtons}
      </div>
    </div>
  );
};

export default Header;
