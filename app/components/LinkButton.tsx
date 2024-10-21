import { Link } from "@remix-run/react";

type LinkButtonProps = {
  label?: string;
  title?: string;
  url?: string;
};

const LinkButton = ({ label, title, url }: LinkButtonProps) => {
  return (
    <div className="mt-8 flex flex-row gap-2">
      {label && (
        <div className="text-sm text-secondary-foreground">{label}:</div>
      )}
      <div className="text-sm text-primary hover:underline">
        {url && (
          <Link to={url} target="_blank" rel="noreferrer">
            {title}
          </Link>
        )}
      </div>
    </div>
  );
};

export default LinkButton;
