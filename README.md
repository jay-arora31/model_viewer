# Model Viewer

A professional 3D model visualization web application built with React and Three.js.

## 🚀 Live Demo

**Hosted on AWS S3 + CloudFront**: [Your Live URL Here]

## ✨ Features

- **3D Model Display**: Support for PLY and SPLAT formats
- **Checkpoint System**: 4 predefined model orientations
- **Interactive Controls**: Drag to rotate, PREV/NEXT navigation
- **Format Toggle**: Switch between PLY and SPLAT models
- **Responsive Design**: Works on desktop and mobile
- **Professional UI**: Clean, modern interface

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **3D Graphics**: Three.js + React Three Fiber
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Hosting**: AWS S3 + CloudFront

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ModelViewer.tsx  # 3D model rendering
│   ├── CheckpointControls.tsx
│   └── FormatToggle.tsx
├── utils/              # Utilities
│   └── modelLoader.ts  # PLY/SPLAT loaders
└── App.tsx            # Main application
```

## 🗂️ Model Files

Place your 3D models in `public/models/`:
- `patchwork_chair.ply` (PLY format)
- `dino_30k_cropped.splat` (SPLAT format)

## 🌐 AWS Deployment

**Architecture**: S3 (Static Hosting) + CloudFront (CDN)

### Benefits:
- **Global CDN**: Fast loading worldwide
- **HTTPS**: Secure connections
- **Cost-effective**: Pay-as-you-use pricing
- **Scalable**: Handles traffic spikes automatically

### Deployment Steps:
1. Build the project: `bun run build`
2. Upload `dist/` folder to S3 bucket
3. Configure S3 for static website hosting
4. Set up CloudFront distribution
5. Configure custom domain (optional)

## 📄 License

MIT License
