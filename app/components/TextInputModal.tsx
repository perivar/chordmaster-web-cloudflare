import { useState } from "react";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface TextInputModalProps {
  error: string | undefined | null;
  enabled: boolean;
  dialogTitle?: string;
  dialogDescription?: string;
  onDismiss: () => void;
  dismissButtonTitle?: string;
  onSubmit: (value: string) => void;
  submitButtonTitle: string;
  onChange?: (name: string) => void;
  label?: string;
  placeholder: string;
  initialValue?: string;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  error,
  enabled,
  dialogTitle,
  dialogDescription,
  onSubmit,
  submitButtonTitle = "OK",
  onDismiss,
  dismissButtonTitle = "Cancel",
  onChange,
  label,
  placeholder,
  initialValue = "",
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const onChangeText = (val: string) => {
    setInputValue(val);
    if (onChange) onChange(val);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue(""); // Clear input on submit
  };

  return (
    <Dialog open={enabled} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {label && <Label htmlFor={`text-input-modal-${label}`}>{label}</Label>}
        <Input
          id={`text-input-modal-${label}`}
          value={inputValue}
          onChange={e => onChangeText(e.target.value)}
          placeholder={placeholder}
        />
        {/* Display error if exists */}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            {dismissButtonTitle}
          </Button>
          <Button onClick={handleSubmit}>{submitButtonTitle}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
