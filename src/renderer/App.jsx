import { useState } from 'react';
import { FolderOpen, Save } from 'lucide-react';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filename, setFilename] = useState('');
  const [showBackground, setShowBackground] = useState(false);

  const handleOpenImage = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openImage();
      if (result.success) {
        setSelectedImage(result.data);
        setFilename(result.filename);
      }
    }
  };

  const handleSaveImage = async () => {
    if (window.electronAPI && selectedImage) {
      const result = await window.electronAPI.saveImage(selectedImage);
      if (result.success) {
        alert('Image saved successfully!');
      } else {
        alert('Failed to save image');
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Image Editor</h1>
        <div className="header-actions">
          <button onClick={handleOpenImage} className="toolbar-btn">
            <FolderOpen size={20} />
            Open Image
          </button>
          {selectedImage && (
            <>
              <button onClick={handleSaveImage} className="toolbar-btn">
                <Save size={20} />
                Save
              </button>
              <button
                onClick={() => setShowBackground(!showBackground)}
                className={`toolbar-btn ${showBackground ? 'active' : ''}`}
              >
                {showBackground ? 'Hide Background' : 'Show Background'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="content">
        {selectedImage ? (
          <div className="editor">
            <div className="editor-info">
              <span className="filename">{filename}</span>
            </div>
            <div className={`canvas-container ${showBackground ? 'with-background' : ''}`}>
              <img src={selectedImage} alt="Editing" className="screenshot" />
            </div>
          </div>
        ) : (
          <div className="welcome">
            <div className="welcome-content">
              <h2>Welcome to Image Editor</h2>
              <p>Open an image to start editing</p>
              <button onClick={handleOpenImage} className="open-btn">
                <FolderOpen size={24} />
                Open Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
