import React, {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Progress } from "./progress";
import { Alert, AlertDescription } from "./alert";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void;
  currentImageUrls?: string[];
  isUploading?: boolean;
  uploadProgress?: number;
  error?: Error | null;
  className?: string;
  disabled?: boolean;
  onImageRemove?: (index?: number) => void;
  multiple?: boolean;
  maxFiles?: number;
}

// Define the ref interface
export interface ImageUploadRef {
  resetPreviews: () => void;
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(
  (
    {
      onImageSelect,
      currentImageUrls = [],
      isUploading = false,
      uploadProgress = 0,
      error = null,
      className,
      disabled = false,
      onImageRemove,
      multiple = false,
      maxFiles = 5,
    },
    ref
  ) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Expose methods to parent component through ref
    useImperativeHandle(ref, () => ({
      resetPreviews: () => {
        // Release object URLs to prevent memory leaks
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setPreviewUrls([]);
      },
    }));

    // Validate file type and size
    const validateFile = (file: File): { valid: boolean; error?: string } => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return {
          valid: false,
          error: `File "${file.name}" must be an image.`,
        };
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return {
          valid: false,
          error: `File "${file.name}" must be less than 5MB.`,
        };
      }

      return { valid: true };
    };

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          // Validate all files
          for (const file of acceptedFiles) {
            const validation = validateFile(file);
            if (!validation.valid && validation.error) {
              // Display error using toast
              if (typeof window !== "undefined") {
                // Import toast dynamically to avoid issues
                toast.error("File validation failed", {
                  description: validation.error,
                });
              }
              return;
            }
          }

          // Limit the number of files based on maxFiles
          const filesToProcess = multiple
            ? acceptedFiles.slice(
                0,
                maxFiles - previewUrls.length - currentImageUrls.length
              )
            : [acceptedFiles[0]];

          if (filesToProcess.length > 0) {
            // Create preview URLs
            const urls = filesToProcess.map((file) =>
              URL.createObjectURL(file)
            );

            if (multiple) {
              setPreviewUrls((prev) => [...prev, ...urls]);
            } else {
              // In single mode, replace the existing preview
              setPreviewUrls(urls);
            }

            // Call the parent handler
            onImageSelect(filesToProcess);
          }
        }
      },
      [
        onImageSelect,
        multiple,
        maxFiles,
        previewUrls.length,
        currentImageUrls.length,
      ]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } =
      useDropzone({
        onDrop,
        accept: {
          "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
        },
        maxFiles: multiple ? maxFiles : 1,
        disabled:
          disabled ||
          isUploading ||
          (multiple &&
            currentImageUrls.length + previewUrls.length >= maxFiles),
        multiple: multiple,
      });

    const handleRemoveImage = (index?: number) => {
      if (index !== undefined) {
        // We need to determine if the image is from currentImageUrls or previewUrls
        if (index < currentImageUrls.length) {
          // It's an existing image URL
          // Call the parent callback to notify about specific image removal
          onImageRemove?.(index);
        } else {
          // It's a preview image (newly added)
          // Adjust index for the previewUrls array
          const previewIndex = index - currentImageUrls.length;
          
          // Remove the preview URL
          setPreviewUrls((prev) => prev.filter((_, i) => i !== previewIndex));
          
          // Call the parent callback with the original index
          onImageRemove?.(index);
        }
      } else {
        // Remove all images
        setPreviewUrls([]);
        // Call the parent callback to notify about image removal
        onImageRemove?.();
      }
    };

    // Combine current images and preview images
    const [displayImages, setDisplayImages] = useState<string[]>([]);
    useEffect(() => {
      setDisplayImages([...(currentImageUrls || []), ...previewUrls]);
    }, [currentImageUrls, previewUrls]);

    const hasImages = displayImages.length > 0;

    return (
      <div className={cn("space-y-4", className)}>
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive && !isDragReject && "border-blue-500 bg-blue-50",
            isDragReject && "border-red-500 bg-red-50",
            !isDragActive && "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "opacity-75 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />

          {hasImages ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {!disabled && !isUploading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {multiple &&
                  currentImageUrls.length + previewUrls.length < maxFiles && (
                    <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
              </div>
              <p className="text-sm text-muted-foreground">
                {multiple
                  ? "Click or drag to add more images"
                  : "Click or drag to replace image"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Drop the image here"
                    : multiple
                    ? "Upload images"
                    : "Upload an image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, GIF up to 5MB{" "}
                  {multiple && `(max ${maxFiles} files)`}
                </p>
              </div>
              <Button variant="outline" disabled={disabled || isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Choose {multiple ? "Images" : "Image"}
              </Button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Recommended: Square image, at least 800x800px</p>
          <p>Maximum file size: 5MB</p>
        </div>
      </div>
    );
  }
);
