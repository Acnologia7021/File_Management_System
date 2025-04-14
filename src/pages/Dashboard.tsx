
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FolderPlus,
  Tag,
  Clock,
  Star,
  Share2,
  Lock,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/Header';
import { FileList } from '@/components/FileList';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { 
  FileItem, 
  FilterOptions, 
  SortOptions 
} from '@/lib/types';
import { 
  generateMockFiles, 
  filterFiles, 
  sortFiles,
  downloadFile,
  deleteFile
} from '@/lib/file-utils';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortBy: 'date',
    direction: 'desc',
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
  });
  const [loading, setLoading] = useState(true);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);
  
  // Load files on mount
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        // In a real app, would fetch from a backend API
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        const files = generateMockFiles(16);
        setAllFiles(files);
        
        // Apply initial sorting
        const sorted = sortFiles(files, sortOptions);
        setFilteredFiles(sorted);
      } catch (error) {
        console.error('Error loading files:', error);
        toast.error('Failed to load files');
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, []);
  
  // Handle sorting changes
  const handleSort = (options: SortOptions) => {
    setSortOptions(options);
    const sorted = sortFiles(filteredFiles, options);
    setFilteredFiles(sorted);
  };
  
  // Handle filtering changes
  const handleFilter = (options: FilterOptions) => {
    setFilterOptions(options);
    const filtered = filterFiles(allFiles, options);
    const sorted = sortFiles(filtered, sortOptions);
    setFilteredFiles(sorted);
  };
  
  // Handle file download
  const handleDownload = async (file: FileItem) => {
    toast.promise(downloadFile(file), {
      loading: 'Downloading file...',
      success: 'File downloaded successfully',
      error: 'Download failed',
    });
  };
  
  // Handle file deletion
  const handleDelete = async (fileId: string) => {
    toast.promise(
      deleteFile(fileId).then(() => {
        // Remove the file from state
        const updatedFiles = allFiles.filter(file => file.id !== fileId);
        setAllFiles(updatedFiles);
        
        // Update filtered files
        const filtered = filterFiles(updatedFiles, filterOptions);
        const sorted = sortFiles(filtered, sortOptions);
        setFilteredFiles(sorted);
      }),
      {
        loading: 'Deleting file...',
        success: 'File deleted successfully',
        error: 'Deletion failed',
      }
    );
  };
  
  // Handle file upload
  const handleUploadComplete = (file: File, encrypted: boolean, checksum?: string, encryptionKey?: string) => {
    // Create a new file item
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      path: `/files/${file.name}`,
      metadata: {
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        createdAt: new Date(),
        modifiedAt: new Date(),
        createdBy: user?.name || 'Unknown',
        lastModifiedBy: user?.name || 'Unknown',
        encrypted,
        checksum,
      },
      isShared: false,
      sharedWith: [],
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
      },
      isFavorite: false,
      tags: [],
      isEncrypted: encrypted,
    };
    
    // Add the new file to state
    const updatedFiles = [newFile, ...allFiles];
    setAllFiles(updatedFiles);
    
    // Update filtered files
    const filtered = filterFiles(updatedFiles, filterOptions);
    const sorted = sortFiles(filtered, sortOptions);
    setFilteredFiles(sorted);
    
    // Close the upload sheet
    setUploadSheetOpen(false);
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = (fileId: string, favorite: boolean) => {
    const updatedFiles = allFiles.map(file => 
      file.id === fileId ? { ...file, isFavorite: favorite } : file
    );
    
    setAllFiles(updatedFiles);
    
    // Update filtered files
    const filtered = filterFiles(updatedFiles, filterOptions);
    const sorted = sortFiles(filtered, sortOptions);
    setFilteredFiles(sorted);
    
    toast.success(favorite ? 'Added to favorites' : 'Removed from favorites');
  };
  
  const handleViewDetails = (file: FileItem) => {
    navigate(`/file/${file.id}`, { state: { file } });
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  const sidebarItems = [
    { name: 'All Files', icon: <FolderPlus className="h-4 w-4 mr-2" />, active: true },
    { name: 'Recent', icon: <Clock className="h-4 w-4 mr-2" />, active: false },
    { name: 'Favorites', icon: <Star className="h-4 w-4 mr-2" />, active: false },
    { name: 'Shared', icon: <Share2 className="h-4 w-4 mr-2" />, active: false },
    { name: 'Encrypted', icon: <Lock className="h-4 w-4 mr-2" />, active: false },
    { name: 'Tags', icon: <Tag className="h-4 w-4 mr-2" />, active: false },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 h-full hidden md:block p-4 border-r border-border">
          <div className="mb-6">
            <Sheet open={uploadSheetOpen} onOpenChange={setUploadSheetOpen}>
              <SheetTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Upload File</SheetTitle>
                  <SheetDescription>
                    Upload a new file to your secure vault
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <FileUpload onUploadComplete={handleUploadComplete} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <nav>
            <ul className="space-y-1">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start text-base font-normal h-10"
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto pt-8">
            <div className="px-4 py-3 rounded-lg bg-muted/50">
              <div className="flex items-center mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Storage</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '38%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                3.8 GB of 10 GB used
              </p>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Upload Button */}
            <div className="md:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Upload File</SheetTitle>
                    <SheetDescription>
                      Upload a new file to your secure vault
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6">
                    <FileUpload onUploadComplete={handleUploadComplete} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Files</h1>
              
              {loading && (
                <div className="flex items-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </div>
              )}
            </div>
            
            <FileList
              files={filteredFiles}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onViewDetails={handleViewDetails}
              onSort={handleSort}
              onFilter={handleFilter}
              sortOptions={sortOptions}
              filterOptions={filterOptions}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
