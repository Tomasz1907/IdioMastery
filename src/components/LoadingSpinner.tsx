import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="text-center py-8">
      <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#F6BE2C]" />
    </div>
  );
};

export default LoadingSpinner;
