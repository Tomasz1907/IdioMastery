interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return <p className="text-red-500 text-center text-sm">{message}</p>;
};

export default ErrorDisplay;
