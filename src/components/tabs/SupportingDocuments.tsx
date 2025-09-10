import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Upload, File, Mail, Video, FileText, Trash2, Eye } from 'lucide-react';

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadDate: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface SupportingDocumentsProps {
  currentActivity: string;
}

export const SupportingDocuments = ({ currentActivity }: SupportingDocumentsProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const fileCategories = [
    {
      id: 'supporting',
      label: 'Supporting Documents',
      icon: FileText,
      description: 'General supporting documentation',
      path: '/Supporting documents',
      acceptedTypes: '.pdf,.doc,.docx,.txt,.xlsx,.pptx'
    },
    {
      id: 'emails',
      label: 'E-Mails',
      icon: Mail,
      description: 'Email correspondence and communications',
      path: '/E-Mails',
      acceptedTypes: '.eml,.msg,.pdf'
    },
    {
      id: 'video',
      label: 'Inspection Video',
      icon: Video,
      description: 'Video recordings of inspections',
      path: '/Inspection Video',
      acceptedTypes: '.mp4,.avi,.mov,.wmv'
    },
    {
      id: 'main',
      label: 'Main Files',
      icon: File,
      description: 'Primary activity documents',
      path: '/ (Activity Root)',
      acceptedTypes: '*'
    }
  ];

  const handleDragOver = useCallback((e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOver(categoryId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files, categoryId);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files, categoryId);
  };

  const handleFileUpload = (files: File[], categoryId: string) => {
    if (!currentActivity) {
      alert('Please save an activity first before uploading files.');
      return;
    }

    files.forEach((file) => {
      const fileUpload: FileUpload = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category: categoryId,
        uploadDate: new Date().toISOString(),
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, fileUpload]);

      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, progress: Math.min((f.progress || 0) + 10, 100) }
              : f
          )
        );
      }, 200);

      // Complete upload after simulation
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );
      }, 2000);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilesByCategory = (categoryId: string) => {
    return uploadedFiles.filter(f => f.category === categoryId);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <span>Supporting Documents</span>
          </CardTitle>
          <CardDescription>
            Upload and manage files for the current inspection activity. Files are organized into specific folders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentActivity && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-warning-foreground font-medium">
                ⚠️ Please save an activity from the Main tab before uploading files.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fileCategories.map((category) => {
              const Icon = category.icon;
              const categoryFiles = getFilesByCategory(category.id);
              const isDragOver = dragOver === category.id;
              
              return (
                <Card 
                  key={category.id}
                  className={`transition-all duration-200 ${
                    isDragOver ? 'border-accent border-2 bg-accent/5' : 'border-border'
                  } ${!currentActivity ? 'opacity-50' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span>{category.label}</span>
                      {categoryFiles.length > 0 && (
                        <Badge variant="secondary">{categoryFiles.length}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                      <br />
                      <span className="font-mono text-xs text-muted-foreground">{category.path}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver 
                          ? 'border-accent bg-accent/10' 
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      } ${!currentActivity ? 'pointer-events-none' : 'cursor-pointer'}`}
                      onDragOver={(e) => handleDragOver(e, category.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, category.id)}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drop files here or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept={category.acceptedTypes}
                        onChange={(e) => handleFileSelect(e, category.id)}
                        className="hidden"
                        id={`file-${category.id}`}
                        disabled={!currentActivity}
                      />
                      <label htmlFor={`file-${category.id}`}>
                        <Button variant="outline" size="sm" disabled={!currentActivity}>
                          Select Files
                        </Button>
                      </label>
                    </div>

                    {categoryFiles.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categoryFiles.map((file) => (
                          <div key={file.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                              {file.status === 'uploading' && (
                                <Progress value={file.progress} className="h-1 mt-1" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge 
                                variant={file.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {file.status}
                              </Badge>
                              <Button
                                onClick={() => removeFile(file.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">File Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{uploadedFiles.length}</div>
                    <div className="text-sm text-muted-foreground">Total Files</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-success">
                      {uploadedFiles.filter(f => f.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Uploaded</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-warning">
                      {uploadedFiles.filter(f => f.status === 'uploading').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Uploading</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {formatFileSize(uploadedFiles.reduce((acc, f) => acc + f.size, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Size</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">File Organization:</p>
            <ul className="space-y-1 text-xs">
              <li>• Files are automatically organized into appropriate folders</li>
              <li>• Multiple file selection and drag-drop are supported</li>
              <li>• Activity root folder is created automatically when files are uploaded</li>
              <li>• All files are linked to the current activity for easy retrieval</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};