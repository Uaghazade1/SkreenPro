import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { ImageCanvasProps, GradientPreset, ShadowSettings, ShadowPreset } from '@/renderer/types';

// Gradient presets with Konva-compatible format
const GRADIENT_PRESETS: Record<string, GradientPreset> = {
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)': {
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [0, '#667eea', 1, '#764ba2']
  },
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)': {
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [0, '#f093fb', 1, '#f5576c']
  },
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)': {
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    colorStops: [0, '#4facfe', 1, '#00f2fe']
  }
};

// Shadow presets
const SHADOW_PRESETS: Record<ShadowPreset, ShadowSettings> = {
  light: {
    blur: 10,
    offsetX: 0,
    offsetY: 5,
    opacity: 0.2
  },
  medium: {
    blur: 20,
    offsetX: 0,
    offsetY: 8,
    opacity: 0.3
  },
  heavy: {
    blur: 30,
    offsetX: 0,
    offsetY: 12,
    opacity: 0.4
  },
  soft: {
    blur: 40,
    offsetX: 0,
    offsetY: 15,
    opacity: 0.25
  },
  sharp: {
    blur: 5,
    offsetX: 0,
    offsetY: 3,
    opacity: 0.5
  },
  dramatic: {
    blur: 50,
    offsetX: 0,
    offsetY: 20,
    opacity: 0.5
  }
};

const ImageCanvas: React.FC<ImageCanvasProps> = ({ imageSrc, settings, onExport }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image] = useImage(imageSrc);

  // Extract background image URL if it's a bg-image type
  const bgImageUrl = settings.backgroundColor.startsWith('bg-image:')
    ? `${window.location.protocol === 'file:' ? './bgs/' : '/bgs/'}${settings.backgroundColor.replace('bg-image:', '')}`
    : null;
  const [bgImage] = useImage(bgImageUrl || '');

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (image) {
      let width = image.width;
      let height = image.height;

      // If aspect ratio is set, apply it to canvas dimensions
      if (settings.aspectRatio && settings.aspectRatio !== 'free') {
        const aspectRatioMap: Record<string, number> = {
          '16:9': 16 / 9,
          '9:16': 9 / 16,
          '4:3': 4 / 3,
          '5:4': 5 / 4,
          '1:1': 1,
          '4:5': 4 / 5,
          '3:4': 3 / 4,
          '2:3': 2 / 3,
          'ig-post': 1,
          'ig-portrait': 4 / 5,
          'ig-story': 9 / 16,
          'tweet': 16 / 9,
        };

        const targetRatio = aspectRatioMap[settings.aspectRatio];
        if (targetRatio) {
          const currentRatio = width / height;

          if (currentRatio > targetRatio) {
            // Image is wider, adjust width to match target ratio
            width = height * targetRatio;
          } else {
            // Image is taller, adjust height to match target ratio
            height = width / targetRatio;
          }
        }
      }

      setDimensions({ width, height });
    }
  }, [image, settings.aspectRatio]);

  // Handle responsive scaling
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !image) return;

      const container = containerRef.current.parentElement;
      const containerWidth = container.clientWidth - 80; // padding
      const containerHeight = container.clientHeight - 80;

      // Canvas dimensions are FIXED (original image size)
      // Scale is calculated based only on canvas size, not padding/border
      const fullWidth = dimensions.width;
      const fullHeight = dimensions.height;

      // Calculate scale to fit container
      const scaleX = containerWidth / fullWidth;
      const scaleY = containerHeight / fullHeight;
      const newScale = Math.min(1, scaleX, scaleY);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    // Also update when settings change
    const timeoutId = setTimeout(updateScale, 100);

    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeoutId);
    };
  }, [image, dimensions, settings]);

  useEffect(() => {
    if (onExport && stageRef.current) {
      onExport(stageRef);
    }
  }, [onExport]);

  const {
    borderWidth = 0,
    borderColor = '#000000',
    borderRadius = 0,
    backgroundColor = 'transparent',
    padding = 0,
    shadow = false,
    shadowPreset = 'medium',
  } = settings;

  // Get shadow settings
  const shadowSettings: ShadowSettings | null = shadow ? SHADOW_PRESETS[shadowPreset] : null;

  // Calculate extra space needed for shadow on each side
  const shadowSpaceLeft = shadowSettings ? Math.max(0, shadowSettings.blur - shadowSettings.offsetX) : 0;
  const shadowSpaceRight = shadowSettings ? Math.max(0, shadowSettings.blur + shadowSettings.offsetX) : 0;
  const shadowSpaceTop = shadowSettings ? Math.max(0, shadowSettings.blur - shadowSettings.offsetY) : 0;
  const shadowSpaceBottom = shadowSettings ? Math.max(0, shadowSettings.blur + shadowSettings.offsetY) : 0;

  // Total shadow space on each axis
  const totalShadowWidth = shadowSpaceLeft + shadowSpaceRight;
  const totalShadowHeight = shadowSpaceTop + shadowSpaceBottom;

  // Canvas size is ALWAYS the original image dimensions (FIXED) - never changes
  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height;

  // Calculate the maximum available space for the DISPLAYED image after accounting for padding, border AND shadow
  const maxDisplayWidth = canvasWidth - (padding * 2 + borderWidth * 2 + totalShadowWidth);
  const maxDisplayHeight = canvasHeight - (padding * 2 + borderWidth * 2 + totalShadowHeight);

  // Image should maintain its ORIGINAL aspect ratio, not be cropped to canvas ratio
  // Use original image dimensions for crop (no cropping based on aspect ratio)
  const cropWidth = image?.width || dimensions.width;
  const cropHeight = image?.height || dimensions.height;

  // Calculate display dimensions - fit the ORIGINAL image aspect ratio into available space
  let imageWidth = maxDisplayWidth;
  let imageHeight = maxDisplayHeight;

  if (image) {
    // Original image aspect ratio
    const imageRatio = image.width / image.height;
    const availableRatio = maxDisplayWidth / maxDisplayHeight;

    if (availableRatio > imageRatio) {
      // Available space is wider than image, fit to height
      imageHeight = maxDisplayHeight;
      imageWidth = imageHeight * imageRatio;
    } else {
      // Available space is taller than image, fit to width
      imageWidth = maxDisplayWidth;
      imageHeight = imageWidth / imageRatio;
    }
  }

  // Position the image at the center of the canvas
  const imageX = (canvasWidth - imageWidth) / 2;
  const imageY = (canvasHeight - imageHeight) / 2;

  // Check background type
  const isGradient = GRADIENT_PRESETS[backgroundColor];
  const isBgImage = backgroundColor.startsWith('bg-image:');

  const getFillProp = (): string | null => {
    if (backgroundColor === 'transparent') return null;
    if (isGradient) return null; // We'll use fillLinearGradient instead
    if (isBgImage) return null; // We'll use fillPatternImage instead
    return backgroundColor;
  };

  const getGradientProps = (): any => {
    if (!isGradient) return {};

    const gradient = GRADIENT_PRESETS[backgroundColor];
    return {
      fillLinearGradientStartPoint: {
        x: gradient.start.x * canvasWidth,
        y: gradient.start.y * canvasHeight
      },
      fillLinearGradientEndPoint: {
        x: gradient.end.x * canvasWidth,
        y: gradient.end.y * canvasHeight
      },
      fillLinearGradientColorStops: gradient.colorStops
    };
  };

  const getBgImageProps = (): any => {
    if (!isBgImage || !bgImage) return {};

    return {
      fillPatternImage: bgImage,
      fillPatternScaleX: canvasWidth / bgImage.width,
      fillPatternScaleY: canvasHeight / bgImage.height,
      fillPatternRepeat: 'no-repeat'
    };
  };

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      <Stage
        width={canvasWidth * scale}
        height={canvasHeight * scale}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {/* Background Layer - behind everything */}
          {backgroundColor !== 'transparent' && (
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={getFillProp()}
              {...getGradientProps()}
              {...getBgImageProps()}
            />
          )}

          {/* Image with border and effects */}
          {image && (
            <>
              {/* Image */}
              <KonvaImage
                image={image}
                x={imageX}
                y={imageY}
                width={imageWidth}
                height={imageHeight}
                crop={{
                  x: (image.width - cropWidth) / 2,
                  y: (image.height - cropHeight) / 2,
                  width: cropWidth,
                  height: cropHeight
                }}
                cornerRadius={borderRadius}
                shadowEnabled={shadow && shadowSettings !== null}
                shadowColor="black"
                shadowBlur={shadowSettings?.blur || 0}
                shadowOffset={{
                  x: shadowSettings?.offsetX || 0,
                  y: shadowSettings?.offsetY || 0
                }}
                shadowOpacity={shadowSettings?.opacity || 0}
              />

              {/* Border on top of image */}
              {borderWidth > 0 && (
                <Rect
                  x={imageX}
                  y={imageY}
                  width={imageWidth}
                  height={imageHeight}
                  stroke={borderColor}
                  strokeWidth={borderWidth}
                  cornerRadius={borderRadius}
                  listening={false}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageCanvas;
