# 3D Model Files

This directory is where you should place your 3D model files for the viewer.

## Supported Formats

### PLY Files
- Place your `.ply` files in this directory
- Supported: Binary and ASCII PLY formats
- Recommended naming: `sample.ply`, `demo.ply`, or any descriptive name
- Large files (>49MB) are supported with optimized loading

### SPLAT Files  
- Place your `.splat` files in this directory
- Gaussian Splat format for point cloud rendering
- Recommended naming: `sample.splat`, `demo.splat`

## File Organization

```
public/models/
├── sample.ply          # Your main PLY model
├── demo.ply           # Alternative PLY model
├── sample.splat       # Your main SPLAT model
├── demo.splat         # Alternative SPLAT model
└── README.md          # This file
```

## Large File Handling

For files larger than 49MB:

1. **Compression**: Consider compressing your models if possible
2. **Chunked Loading**: The app uses optimized loaders with progress tracking
3. **Memory Management**: Models are automatically optimized for GPU rendering
4. **Fallback**: If files fail to load, a generated sample model will be displayed

## Testing Without Files

If you don't have PLY/SPLAT files yet, the app will automatically generate sample models for testing the functionality.

## Adding Your Models

1. Copy your `.ply` or `.splat` files to this directory
2. Update the file paths in `src/components/ModelViewer.tsx` if needed
3. The app will automatically try to load them in order of preference

## Performance Tips

- Use binary PLY format for better loading performance
- Consider level-of-detail (LOD) models for very large datasets
- Monitor browser memory usage with large models
- Use the browser's developer tools to check loading times 