import { useState, useRef } from 'react';
import { FolderOpen, Save, Github as GithubIcon } from 'lucide-react';
import ImageCanvas from './components/ImageCanvas';
import EditorControls from './components/EditorControls';
import LoginScreen from './components/LoginScreen';
import UserMenu from './components/UserMenu';
// import PlanSelectionModal from './components/PlanSelectionModal'; // COMMENTED OUT: Future feature
// import LicenseKeyModal from './components/LicenseKeyModal'; // COMMENTED OUT: Future feature
import { Button } from './components/ui/button';
import { EditorSettings } from './types';
import { useAuth } from './contexts/AuthContext';
// import { usePlan } from './contexts/PlanContext'; // COMMENTED OUT: Future feature
import Konva from 'konva';

// Extend Window interface for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      openImage: () => Promise<{ success: boolean; data?: string; filename?: string }>;
      saveImage: (data: string) => Promise<{ success: boolean }>;
      openExternal: (url: string) => Promise<{ success: boolean }>;
    };
  }
}

function App() {
  const { user, loading, signOut } = useAuth();
  // const { userPlan, selectPlan } = usePlan(); // COMMENTED OUT: Will be used when plans are enabled
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const stageRef = useRef<Konva.Stage | null>(null);
  // const [showPlanModal, setShowPlanModal] = useState(false); // COMMENTED OUT: Future feature
  // const [showLicenseModal, setShowLicenseModal] = useState(false); // COMMENTED OUT: Future feature
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

  // COMMENTED OUT: Plan selection will be added in future
  // useEffect(() => {
  //   if (user && !userPlan) {
  //     setShowPlanModal(true);
  //   }
  // }, [user, userPlan]);

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

  // COMMENTED OUT: Plan selection handler for future use
  // const handleSelectPlan = async (plan: 'free' | 'pro') => {
  //   try {
  //     if (plan === 'pro') {
  //       setShowPlanModal(false);
  //       setShowLicenseModal(true);
  //     } else {
  //       await selectPlan(plan);
  //       setShowPlanModal(false);
  //     }
  //   } catch (error) {
  //     console.error('Error selecting plan:', error);
  //     alert('Failed to select plan. Please try again.');
  //   }
  // };

  // Show loading state (only auth loading, plan loads in background)
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
    <>
      {/* Modals */}
      {/* <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handleSelectPlan}
      />
      <LicenseKeyModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
      /> */}

      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="px-6 py-2 bg-card border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium">SkreenPro v1.0.1</h1>
            <Button
              onClick={async () => {
                if (window.electronAPI?.openExternal) {
                  await window.electronAPI.openExternal('https://github.com/Uaghazade1/sshot');
                } else {
                  console.error('electronAPI.openExternal not available');
                  window.open('https://github.com/Uaghazade1/sshot', '_blank');
                }
              }}
              size="xs"
              variant="outline"
              className="gap-2"
            >
              <GithubIcon size={16} />
              Github
            </Button>
            {/* COMMENTED OUT: Plan badge will be added in future */}
            {/* {userPlan && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase">
                {userPlan.plan}
              </span>
            )} */}
          </div>
          <div className="flex gap-3 items-center">
            {/* {userPlan?.plan === 'free' && (
              <Button
                onClick={() => setShowLicenseModal(true)}
                size="xs"
                variant="default"
                className="gap-2"
              >
                <Key size={16} />
                Upgrade to Pro
              </Button>
            )} */}
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
            <UserMenu userEmail={user.email || 'User'} onSignOut={handleSignOut} />
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
              <h2 className="text-white text-2xl font-medium mb-5">SkreenPro v1.0.1</h2>
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
    </>
  );
}

export default App;
