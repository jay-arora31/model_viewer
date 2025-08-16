# 3D Model Viewer

A professional, high-performance web application for viewing 3D models in PLY and SPLAT formats with interactive checkpoint navigation. Built with React, TypeScript, and Three.js following modern web development best practices.

## ✨ Features

### Core Functionality
- **PLY Model Support**: Optimized loading and rendering of PLY format 3D models
- **SPLAT Model Support**: Gaussian Splat point cloud visualization
- **Checkpoint System**: 4 predefined camera orientations with smooth transitions
- **Interactive Navigation**: PREV/NEXT buttons and direct checkpoint selection
- **Drag Controls**: Mouse/touch interaction for model rotation and zoom
- **Format Toggle**: Seamless switching between PLY and SPLAT formats
- **Large File Optimization**: Handles files >49MB with progress tracking

### Advanced Features
- **Professional Dark Theme**: Modern, eye-friendly interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Memory Management**: Automatic cleanup of 3D resources
- **Error Handling**: Graceful fallbacks and user feedback
- **Loading States**: Real-time progress indicators
- **Accessibility**: ARIA labels and keyboard navigation support

## 🏗️ Architecture & Best Practices

### Code Organization
```
src/
├── components/           # Reusable UI components
│   ├── ModelViewer.tsx  # Main 3D rendering logic
│   ├── CheckpointControls.tsx # Navigation interface
│   ├── FormatToggle.tsx # Format switching component
│   └── *.css           # Component-specific styles
├── utils/              # Business logic utilities
│   └── modelLoader.ts  # Optimized 3D model loading
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

### Design Principles
- **Separation of Concerns**: Clear separation between UI, business logic, and 3D rendering
- **Component Composition**: Modular, reusable React components
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Performance Optimization**: Efficient memory management and rendering
- **Error Boundaries**: Comprehensive error handling and user feedback
- **Accessibility**: WCAG compliant interface design

### Code Quality Standards
- **ESLint Configuration**: Strict linting rules for code consistency
- **TypeScript Strict Mode**: Enhanced type safety and error prevention
- **React Best Practices**: Hooks, functional components, and proper lifecycle management
- **Three.js Optimization**: Efficient geometry processing and material management
- **Memory Management**: Automatic cleanup of WebGL resources

## 🚀 Technology Stack

### Core Technologies
- **React 19**: Modern React with latest features and optimizations
- **TypeScript**: Type-safe development with enhanced IDE support
- **Vite**: Fast development server and optimized production builds
- **Three.js**: Industry-standard 3D graphics library
- **React Three Fiber**: React integration for Three.js

### Development Tools
- **Bun**: Fast package manager and JavaScript runtime
- **ESLint**: Code quality and consistency enforcement
- **CSS3**: Modern styling with dark theme and responsive design
- **WebGL**: Hardware-accelerated 3D rendering

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+** or **Bun 1.0+**
- **Modern browser** with WebGL 2.0 support
- **Git** for version control

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd model-viewer

# Install dependencies
bun install
# or npm install

# Start development server
bun dev
# or npm run dev

# Open browser
open http://localhost:5173
```

### Adding 3D Models
1. Place your `.ply` and `.splat` files in `public/models/`
2. Update file paths in `src/components/ModelViewer.tsx` if needed
3. The app will automatically detect and load your models

## 🎯 Usage Guide

### Navigation
- **PREV/NEXT Buttons**: Navigate between predefined checkpoints
- **Checkpoint List**: Click any checkpoint for direct navigation
- **Mouse Controls**: Drag to rotate, scroll to zoom, right-click to pan

### Model Formats
- **PLY Format**: Mesh-based 3D models with optional vertex colors
- **SPLAT Format**: Gaussian Splat point clouds for photorealistic rendering

### Checkpoints
1. **Front View**: Direct front-facing perspective
2. **Side View**: Profile view from the right side
3. **Top View**: Bird's eye view from above
4. **Isometric View**: 3D perspective at 45° angles

## ⚡ Performance Optimization

### Large File Handling
- **Chunked Loading**: Files load progressively with real-time progress
- **Memory Management**: Automatic geometry and material cleanup
- **GPU Optimization**: Efficient WebGL buffer management
- **Fallback System**: Graceful degradation for failed loads

### Rendering Optimizations
- **Frustum Culling**: Only render visible geometry
- **Level of Detail**: Automatic scaling for optimal performance
- **Material Optimization**: Efficient shader usage based on model attributes
- **Batch Rendering**: Minimized draw calls for better performance

### Build Optimizations
- **Code Splitting**: Separate chunks for Three.js libraries
- **Tree Shaking**: Eliminate unused code from bundles
- **Asset Optimization**: Compressed and optimized static assets
- **Browser Caching**: Efficient cache strategies for faster loads

## 🌐 Deployment

### Production Build
```bash
# Build for production
bun build
# or npm run build

# Preview production build locally
bun preview
# or npm run preview
```

### Hosting Platforms

#### Static Hosting (Recommended)
- **Vercel**: Automatic deployments with GitHub integration
- **Netlify**: Easy drag-and-drop deployment with CDN
- **GitHub Pages**: Free hosting for open-source projects

#### Cloud Platforms
- **AWS S3 + CloudFront**: Scalable with global CDN
- **Azure Static Web Apps**: Integrated CI/CD pipeline
- **Google Cloud Storage**: High-performance static hosting

### Large File Considerations
For models >49MB, ensure your hosting platform supports:
- Large file uploads and serving
- Proper MIME types for `.ply` and `.splat` files
- CORS headers for cross-origin requests
- Adequate bandwidth for model streaming

### Environment Configuration
```bash
# Production environment variables
VITE_MODEL_BASE_URL=https://your-cdn.com/models/
VITE_ENABLE_ANALYTICS=true
VITE_ERROR_REPORTING=true
```

## 🛠️ Development

### Available Scripts
```bash
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun lint         # Run ESLint
bun lint:fix     # Fix ESLint issues automatically
bun type-check   # Run TypeScript type checking
```

### Development Workflow
1. **Feature Development**: Create feature branches from `main`
2. **Code Quality**: Ensure ESLint and TypeScript checks pass
3. **Testing**: Test with various model files and devices
4. **Performance**: Monitor memory usage and rendering performance
5. **Documentation**: Update README and inline documentation

### Adding New Features

#### New Model Formats
```typescript
// Extend modelLoader.ts
export class NewFormatLoader {
  async load(url: string): Promise<ModelLoadResult> {
    // Implementation
  }
}
```

#### Additional Checkpoints
```typescript
// Update App.tsx
const CHECKPOINTS: Checkpoint[] = [
  // Add new checkpoint configurations
  { id: 5, name: "Custom View", position: [x, y, z], target: [0, 0, 0] }
];
```

#### Custom UI Components
```typescript
// Create new component in src/components/
export const CustomComponent: React.FC<Props> = ({ ...props }) => {
  // Component implementation
};
```

## 🔧 Troubleshooting

### Common Issues

**Models not loading:**
- Verify file paths in `public/models/` directory
- Check browser console for network errors
- Ensure files are in correct PLY/SPLAT format
- Verify file permissions and MIME types

**Performance issues:**
- Monitor memory usage in browser DevTools
- Reduce model complexity if needed
- Use binary PLY format for faster loading
- Check WebGL capabilities in browser

**Build errors:**
- Clear `node_modules` and reinstall dependencies
- Verify TypeScript configuration is correct
- Check for ESLint rule violations
- Ensure all imports are properly typed

### Browser Compatibility
- **Chrome 90+**: Full support (recommended)
- **Firefox 88+**: Full support
- **Safari 14+**: Full support
- **Edge 90+**: Full support

WebGL 2.0 is required for optimal performance.

## 📊 Performance Monitoring

### Key Metrics
- **Initial Load Time**: Target <3 seconds
- **Model Load Time**: Depends on file size, target <10 seconds for 50MB
- **Frame Rate**: Target 60 FPS during interaction
- **Memory Usage**: Monitor for memory leaks during format switching

### Optimization Tools
- Chrome DevTools Performance tab
- Three.js Inspector browser extension
- WebGL Insight for GPU debugging
- Lighthouse for overall performance auditing

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Ensure all tests pass and linting is clean
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- Follow existing TypeScript and React patterns
- Add JSDoc comments for public APIs
- Include error handling for all async operations
- Write descriptive commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community**: Excellent 3D rendering capabilities
- **React Three Fiber**: Seamless React integration
- **PLY Format Contributors**: Standardized 3D model format
- **Gaussian Splatting Research**: Innovative 3D representation
- **Open Source Community**: Inspiration and best practices

---

**Built with ❤️ using modern web technologies for professional 3D visualization.**
