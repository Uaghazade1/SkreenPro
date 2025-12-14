import { EditorControlsProps, BackgroundPreset, AspectRatioPreset } from '@/renderer/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/renderer/components/ui/tabs';
import { Slider } from '@/renderer/components/ui/slider';
import { Label } from '@/renderer/components/ui/label';
import { Button } from '@/renderer/components/ui/button';
import { Switch } from '@/renderer/components/ui/switch';

// Background images from public/bgs folder
const BG_IMAGES = [
  'bg.JPG',
  'IMG_0020.JPG',
  'IMG_0021.JPG',
  'IMG_0022.JPG',
  'IMG_0023.JPG',
  'IMG_0026.JPG',
  'IMG_0027.JPG',
  'IMG_0028.JPG',
  'IMG_0029.JPG',
  'IMG_0051.JPG',
  'IMG_9979.JPG',
  'IMG_9987.JPG',
];

const EditorControls: React.FC<EditorControlsProps> = ({ settings, onChange }) => {
  const handleChange = (key: keyof typeof settings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const backgroundPresets: BackgroundPreset[] = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Gradient Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Gradient Pink', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Gradient Green', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ];

  const aspectRatioPresets: AspectRatioPreset[] = [
    { name: 'Free', value: 'free', ratio: null },
    { name: '16:9', value: '16:9', ratio: 16 / 9 },
    { name: '9:16', value: '9:16', ratio: 9 / 16 },
    { name: '4:3', value: '4:3', ratio: 4 / 3 },
    { name: '5:4', value: '5:4', ratio: 5 / 4 },
    { name: '1:1', value: '1:1', ratio: 1 },
    { name: '4:5', value: '4:5', ratio: 4 / 5 },
    { name: '3:4', value: '3:4', ratio: 3 / 4 },
    { name: '2:3', value: '2:3', ratio: 2 / 3 },
  ];

  const socialMediaPresets: AspectRatioPreset[] = [
    { name: 'IG Post', value: 'ig-post', ratio: 1 },
    { name: 'IG Portrait', value: 'ig-portrait', ratio: 4 / 5 },
    { name: 'IG Story', value: 'ig-story', ratio: 9 / 16 },
    { name: 'Tweet', value: 'tweet', ratio: 16 / 9 },
  ];

  return (
    <div className="bg-card rounded-b-lg w-[300px] h-full flex flex-col overflow-hidden">
      <Tabs defaultValue="image" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b h-12">
          <TabsTrigger value="image" className="text-xs font-medium">IMAGE</TabsTrigger>
          <TabsTrigger value="background" className="text-xs font-medium">BACKGROUND</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6">
          {/* IMAGE TAB */}
          <TabsContent value="image" className="mt-0 space-y-7">
            {/* Border */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Border</h3>
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-muted-foreground">Width</Label>
                    <span className="text-xs font-semibold text-foreground">{settings.borderWidth}px</span>
                  </div>
                  <Slider
                    value={[settings.borderWidth]}
                    onValueChange={([value]) => handleChange('borderWidth', value)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">Color</Label>
                  <div className="relative">
                    <input
                      type="color"
                      value={settings.borderColor}
                      onChange={(e) => handleChange('borderColor', e.target.value)}
                      className="w-full h-11 border-2 border-input rounded-lg cursor-pointer hover:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Border Radius */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Radius</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground">Corner Radius</Label>
                  <span className="text-xs font-semibold text-foreground">{settings.borderRadius}px</span>
                </div>
                <Slider
                  value={[settings.borderRadius]}
                  onValueChange={([value]) => handleChange('borderRadius', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Shadow */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Shadow</h3>
                <Switch
                  checked={settings.shadow}
                  onCheckedChange={(checked) => handleChange('shadow', checked)}
                />
              </div>

              {settings.shadow && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {['light', 'medium', 'heavy', 'soft', 'sharp', 'dramatic'].map((preset) => (
                    <Button
                      key={preset}
                      variant={settings.shadowPreset === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleChange('shadowPreset', preset)}
                      className="capitalize text-xs h-9"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* BACKGROUND TAB */}
          <TabsContent value="background" className="mt-0 space-y-7">
            {/* Padding */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Padding</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground">Canvas Padding</Label>
                  <span className="text-xs font-semibold text-foreground">{settings.padding}px</span>
                </div>
                <Slider
                  value={[settings.padding]}
                  onValueChange={([value]) => handleChange('padding', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Frame (Aspect Ratio) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Frame</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2.5 block">Aspect Ratio</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {aspectRatioPresets.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={settings.aspectRatio === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChange('aspectRatio', preset.value)}
                        className="text-xs h-9"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2.5 block">Social Media</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {socialMediaPresets.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={settings.aspectRatio === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChange('aspectRatio', preset.value)}
                        className="text-xs h-9"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Background */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">Background</h3>
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">Custom Color</Label>
                  <input
                    type="color"
                    value={settings.backgroundColor === 'transparent' || settings.backgroundColor.startsWith('bg-image:') || settings.backgroundColor.startsWith('linear-gradient') ? '#ffffff' : settings.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="w-full h-11 border-2 border-input rounded-lg cursor-pointer hover:border-primary transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2.5 block">Color Presets</Label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {backgroundPresets.map((preset) => (
                      <button
                        key={preset.name}
                        className={`h-14 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 relative overflow-hidden ${
                          settings.backgroundColor === preset.value
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{
                          background:
                            preset.value === 'transparent'
                              ? 'repeating-conic-gradient(#404040 0% 25%, #2a2a2a 0% 50%) 50% / 10px 10px'
                              : preset.value,
                        }}
                        onClick={() => handleChange('backgroundColor', preset.value)}
                        title={preset.name}
                      >
                        {preset.name === 'Transparent' && (
                          <span className="absolute inset-0 flex items-center justify-center text-2xl">⊘</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2.5 block">Background Images</Label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {BG_IMAGES.map((bgImage) => (
                      <button
                        key={bgImage}
                        className={`h-14 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 relative overflow-hidden ${
                          settings.backgroundColor === `bg-image:${bgImage}`
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{
                          background: `url(/bgs/${bgImage}) center/cover`,
                        }}
                        onClick={() => handleChange('backgroundColor', `bg-image:${bgImage}`)}
                        title={bgImage}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EditorControls;
