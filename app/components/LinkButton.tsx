import { Link } from "@remix-run/react";

type LinkButtonProps = {
  title?: string;
  url?: string;
};

const LinkButton = ({ title, url }: LinkButtonProps) => {
  return (
    <div className="mt-8 flex flex-row gap-2">
      <div className="text-sm text-secondary-foreground">Source:</div>
      <div className="text-sm text-primary hover:underline">
        {url && <Link to={url}>{title}</Link>}
      </div>
    </div>
  );
};

export default LinkButton;
