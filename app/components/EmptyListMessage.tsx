import { FunctionComponent } from "react";

import { cn } from "~/lib/utils";

import { Button } from "./ui/button";

interface EmptyListMessageProps {
  message: string;
  onPress?: () => void;
  buttonTitle?: string;
  className?: string;
}

const EmptyListMessage: FunctionComponent<EmptyListMessageProps> = ({
  message,
  onPress,
  buttonTitle,
  className,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <p className={cn("text-center", className)}>{message}</p>

      {buttonTitle && onPress && (
        <Button onClick={onPress} className="mt-4">
          {buttonTitle}
        </Button>
      )}
    </div>
  );
};

export default EmptyListMessage;
