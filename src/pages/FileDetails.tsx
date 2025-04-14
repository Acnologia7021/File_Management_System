
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Share2, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FilePlus, 
  File, 
  Lock, 
  Unlock, 
  CalendarIcon, 
  User, 
  Tag, 
  StarIcon
} from 'lucide-react';
import { FileItem } from '@/lib/types';
import { Header } from '@/components/Header';
import { 
  downloadFile, 
  deleteFile, 
  formatFileSize, 
  formatDate 
} from '@/lib/file-utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { ShareModal } from '@/components/ShareModal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const FileDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { file } = location.state as { file: FileItem };
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  if (!file) {
    navigate('/dashboard');
    return null;
  }
  
  // Get file icon based on type
  const getFileIcon = () => {
    switch (file.type) {
      case 'pdf':
        return <FileText className="h-16 w-16 text-red-500" />;
      case 'docx':
        return <FileText className="h-16 w-16 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-16 w-16 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="h-16 w-16 text-purple-500" />;
      case 'zip':
        return <FilePlus className="h-16 w-16 text-yellow-500" />;
      default:
        return <File className="h-16 w-16 text-gray-500" />;
    }
  };
  
  // Handle file download
  const handleDownload = async () => {
    toast.promise(downloadFile(file), {
      loading: 'Downloading file...',
      success: 'File downloaded successfully',
      error: 'Download failed',
    });
  };
  
  // Handle file deletion
  const handleDelete = async () => {
    toast.promise(
      deleteFile(file.id).then(() => {
        navigate('/dashboard');
      }),
      {
        loading: 'Deleting file...',
        success: 'File deleted successfully',
        error: 'Deletion failed',
      }
    );
  };
  
  // Handle file sharing
  const handleShare = async (email: string, permissions: any) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Sharing file...',
        success: `File shared with ${email}`,
        error: 'Failed to share file',
      }
    );
    setShowShareModal(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Files
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* File Preview */}
            <div className="col-span-1">
              <Card className="overflow-hidden h-full">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium truncate">{file.name}</h3>
                    {file.isEncrypted && (
                      <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {file.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.isFavorite && (
                      <Badge variant="secondary" className="text-xs">
                        <StarIcon className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                        Favorite
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* File Details */}
            <div className="col-span-2">
              <div className="glassmorphism rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">{file.name}</h2>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">File Information</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex">
                        <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Type:</dt>
                        <dd className="text-sm capitalize">{file.type}</dd>
                      </div>
                      <div className="flex">
                        <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Size:</dt>
                        <dd className="text-sm">{formatFileSize(file.size)}</dd>
                      </div>
                      <div className="flex">
                        <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Created:</dt>
                        <dd className="text-sm">{formatDate(file.metadata.createdAt)}</dd>
                      </div>
                      <div className="flex">
                        <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Modified:</dt>
                        <dd className="text-sm">{formatDate(file.metadata.modifiedAt)}</dd>
                      </div>
                      <div className="flex">
                        <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Created By:</dt>
                        <dd className="text-sm">{file.metadata.createdBy}</dd>
                      </div>
                      <div className="flex">
                        <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Modified By:</dt>
                        <dd className="text-sm">{file.metadata.lastModifiedBy}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Security</h3>
                    <div className="bg-muted/50 rounded-lg p-4 flex items-center">
                      {file.isEncrypted ? (
                        <>
                          <Lock className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <h4 className="font-medium text-sm">This file is encrypted</h4>
                            <p className="text-xs text-muted-foreground">Only authorized users can view the contents</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-5 w-5 text-yellow-500 mr-3" />
                          <div>
                            <h4 className="font-medium text-sm">This file is not encrypted</h4>
                            <p className="text-xs text-muted-foreground">Consider encrypting sensitive information</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {file.metadata.checksum && (
                      <div className="mt-4">
                        <div className="flex mb-1">
                          <dt className="text-sm font-medium text-muted-foreground w-24 shrink-0">Checksum:</dt>
                          <dd className="text-sm font-mono text-xs break-all">{file.metadata.checksum}</dd>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {file.isShared && (
                    <>
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Shared With</h3>
                        <ul className="space-y-2">
                          {file.sharedWith.map((share) => (
                            <li
                              key={share.id}
                              className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{share.userName}</p>
                                  <p className="text-xs text-muted-foreground">{share.userEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-xs">
                                  {share.permissions.canEdit && (
                                    <Badge variant="outline" className="mr-1 px-1 text-[10px]">
                                      Edit
                                    </Badge>
                                  )}
                                  {share.permissions.canDelete && (
                                    <Badge variant="outline" className="mr-1 px-1 text-[10px]">
                                      Delete
                                    </Badge>
                                  )}
                                  {share.permissions.canShare && (
                                    <Badge variant="outline" className="px-1 text-[10px]">
                                      Share
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md animate-in fade-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium">{file.name}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          file={file}
          onShare={handleShare}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default FileDetails;
