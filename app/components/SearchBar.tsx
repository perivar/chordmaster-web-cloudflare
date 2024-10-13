import { FC } from "react";
import { X } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchBarProps {
  name: string;
  value: string; // Controlled value
  onChange: (value: string) => void; // Controlled onChange
  onSubmit?: (value: string) => void;
  placeholder: string;
}

const SearchBar: FC<SearchBarProps> = ({
  name,
  value, // Controlled value
  onChange, // Controlled onChange
  onSubmit,
  placeholder,
}) => {
  const handleClear = () => {
    onChange(""); // Clear the input value by calling the parent onChange
  };

  const handleSubmit = () => {
    if (value.trim() !== "") {
      return onSubmit && onSubmit(value); // Call the onSubmit callback with the value if it's not empty
    }
  };

  return (
    <div className="flex w-full justify-center">
      <div className="relative w-full max-w-md py-2">
        <Input
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)} // Pass change to parent
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              return handleSubmit();
            } else if (e.key === "Escape") {
              return handleClear();
            }
          }}
          className="w-full pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
            onClick={handleClear}>
            <X className="size-4 text-muted-foreground" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
