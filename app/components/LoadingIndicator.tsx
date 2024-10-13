import { LoadingSpinner } from "./LoadingSpinner";

type LoadingIndicatorProps = {
  title?: string;
};

const LoadingIndicator = ({ title }: LoadingIndicatorProps) => {
  return (
    <div className="mx-auto mt-6 flex items-center justify-center">
      <LoadingSpinner className="mr-2 size-6" />
      <h1 className="text-lg">{title ?? "Loading ..."}</h1>
    </div>
  );
};

export default LoadingIndicator;
