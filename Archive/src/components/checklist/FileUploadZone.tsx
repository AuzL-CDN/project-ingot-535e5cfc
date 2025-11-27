import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Image, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFileUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
}

export const FileUploadZone = ({
  onFileUpload,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 25 * 1024 * 1024, // 25MB default
  multiple = true,
  className = ""
}: FileUploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => 
        file.errors.map((error: any) => error.message).join(', ')
      ).join('; ');
      
      toast({
        title: "Upload Error",
        description: `Some files were rejected: ${errors}`,
        variant: "destructive"
      });
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, files would be uploaded to Supabase Storage
      // For now, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Call the upload handler
      onFileUpload(acceptedFiles);

      toast({
        title: "Upload Successful",
        description: `${acceptedFiles.length} file(s) uploaded successfully.`
      });

      // Reset progress after success
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50
          ${isDragActive ? 'border-primary bg-primary/5' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <div className="p-8 text-center">
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-muted">
              {isDragReject ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Upload Supporting Documentation'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: Images, PDF, Word docs (Max: {formatFileSize(maxSize)})
              </p>
            </div>

            {!isDragActive && (
              <Button variant="outline" type="button">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            )}
          </div>
        </div>
      </Card>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex items-start space-x-2">
          <Image className="h-4 w-4 mt-0.5 text-blue-500" />
          <div>
            <p className="font-medium">Image Integration:</p>
            <p>Images will be automatically embedded in the Final Report sections for easy reference.</p>
            <p className="mt-1 font-medium">Document Linking:</p>
            <p>Documents will appear as clickable links that open in new tabs/modals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};