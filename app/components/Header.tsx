import React from "react";

interface HeaderProps {
  title?: string;
  leftButtons?: React.ReactNode[];
  rightButtons?: React.ReactNode[];
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftButtons = [],
  rightButtons = [],
}) => {
  return (
    <div className="mb-2 flex w-full flex-row items-center justify-between">
      <div className="flex flex-1 flex-row items-center justify-start gap-2">
        {leftButtons.length > 0 ? leftButtons : <div className="h-9" />}
      </div>
      <div className="flex-1 text-center text-xl font-semibold">{title}</div>
      <div className="flex flex-1 flex-row items-center justify-end gap-2">
        {rightButtons.length > 0 ? rightButtons : <div className="h-9" />}
      </div>
    </div>
  );
};

export default Header;
