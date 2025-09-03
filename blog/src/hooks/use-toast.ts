import { toast } from "sonner";

export const useToast = () => {
  return {
    toast,
    toasts: [] // Compatibility with shadcn/ui toast interface
  };
};
