import { useState, useRef } from 'react';
import { FolderOpen, Save, LogOut } from 'lucide-react';
import ImageCanvas from './components/ImageCanvas';
import EditorControls from './components/EditorControls';
import LoginScreen from './components/LoginScreen';
import { Button } from './components/ui/button';
import { EditorSettings } from './types';
import { useAuth } from './contexts/AuthContext';
import Konva from 'konva';

// Extend Window interface for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      openImage: () => Promise<{ success: boolean; data?: string; filename?: string }>;
      saveImage: (data: string) => Promise<{ success: boolean }>;
    };
  }
}

function App() {
  const { user, loading, signOut } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const stageRef = useRef<Konva.Stage | null>(null);
  const [settings, setSettings] = useState<EditorSettings>({
    borderWidth: 8,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: 'bg-image:bg.JPG',
    padding: 40,
    shadow: false,
    shadowPreset: 'medium',
    aspectRatio: null,
  });

  const handleOpenImage = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openImage();
      if (result.success && result.data) {
        setSelectedImage(result.data);
        setFilename(result.filename || '');
      }
    }
  };

  const handleSaveImage = async () => {
    if (window.electronAPI && stageRef.current) {
      // Export canvas as base64 image
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2, // Higher quality export
      });

      const result = await window.electronAPI.saveImage(dataURL);
      if (result.success) {
        alert('Image saved successfully!');
      } else {
        alert('Failed to save image');
      }
    }
  };

  const handleExportRef = (ref: React.RefObject<Konva.Stage>) => {
    stageRef.current = ref.current;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-2 bg-card border-b border-border flex justify-between items-center">
        <h1 className="text-sm font-medium">ShotStudio v1.0.1</h1>
        <div className="flex gap-3 items-center">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <Button onClick={handleOpenImage} size="xs" variant="outline" className="gap-2">
            <FolderOpen size={20} />
            Open Image
          </Button>
          {selectedImage && (
            <Button onClick={handleSaveImage} variant="default" size="xs" className="gap-2">
              <Save size={18} />
              Export - 4K
            </Button>
          )}
          <Button onClick={handleSignOut} size="xs" variant="destructive" className="gap-2">
            <LogOut size={16} />
           
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {selectedImage ? (
          <div className="flex gap-5 h-full overflow-hidden">
            {/* Sidebar */}
            <div className="flex flex-col gap-4  border-r border-border pr-0.5">
             
              <EditorControls settings={settings} onChange={setSettings} />
            </div>

            {/* Divider */}
            <div className="w-px bg-border"></div>

            {/* Canvas Container */}
            <div className="flex-1 flex justify-center items-center rounded-lg overflow-auto relative bg-background"
            >
              <ImageCanvas
                imageSrc={selectedImage}
                settings={settings}
                onExport={handleExportRef}
              />
            </div>
          </div>
        ) : (
          <div
            className="flex justify-center items-center h-full relative"
            style={{
              backgroundImage: 'url(/bg.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[1]" />
            <div className="max-w-[600px] text-center relative z-[2]">
              <h2 className="text-white text-2xl font-medium mb-5">ShotStudio v1.0.1</h2>
              <Button
                onClick={handleOpenImage}
                size="sm"
                className="gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <FolderOpen size={24} />
                Open Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
