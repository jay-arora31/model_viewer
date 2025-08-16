# AWS Deployment Guide - 3D Model Viewer

This guide covers the most efficient ways to deploy your 3D Model Viewer on AWS, optimized for performance and cost-effectiveness.

## 🚀 Recommended Deployment Options

### Option 1: AWS Amplify (Easiest & Most Efficient) ⭐
**Best for**: Quick deployment, automatic CI/CD, built-in CDN
**Cost**: ~$1-5/month for small projects
**Performance**: Excellent (Global CDN included)

### Option 2: S3 + CloudFront (Most Cost-Effective)
**Best for**: Maximum control, lowest cost, high performance
**Cost**: ~$0.50-2/month for small projects
**Performance**: Excellent (Custom CDN configuration)

### Option 3: EC2 + Load Balancer (Advanced)
**Best for**: Complex applications, custom server logic
**Cost**: ~$10-20/month minimum
**Performance**: Good (Requires more setup)

---

## 🎯 Option 1: AWS Amplify Deployment (Recommended)

### Prerequisites
- AWS Account
- GitHub repository with your code
- Domain name (optional)

### Step 1: Prepare Your Project
```bash
# Build your project
bun build

# Verify build output
ls dist/
```

### Step 2: Deploy to Amplify
1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Select "GitHub" as source
   - Authorize AWS Amplify to access your repository
   - Select your `model-viewer` repository
   - Choose `main` branch

3. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install -g bun
           - bun install
       build:
         commands:
           - bun build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Advanced Settings**
   - **Environment Variables** (if needed):
     ```
     VITE_MODEL_BASE_URL=https://your-domain.com/models/
     ```
   - **Redirects and Rewrites**:
     ```
     Source: </^[^.]+$/>
     Target: /index.html
     Type: 200 (Rewrite)
     ```

5. **Deploy**
   - Click "Save and deploy"
   - Wait 3-5 minutes for deployment

### Step 3: Upload Large Model Files
Since your models are >49MB, upload them separately:

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure

# Upload models to Amplify storage
aws s3 cp public/models/ s3://amplify-modelviewer-main-xxxxx-deployment/models/ --recursive
```

---

## 💰 Option 2: S3 + CloudFront (Most Cost-Effective)

### Step 1: Create S3 Bucket
```bash
# Create bucket (replace with unique name)
aws s3 mb s3://your-model-viewer-bucket

# Enable static website hosting
aws s3 website s3://your-model-viewer-bucket \
  --index-document index.html \
  --error-document index.html
```

### Step 2: Build and Upload
```bash
# Build project
bun build

# Upload built files
aws s3 sync dist/ s3://your-model-viewer-bucket/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Upload HTML with shorter cache
aws s3 sync dist/ s3://your-model-viewer-bucket/ \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --include "service-worker.js"

# Upload models with long cache
aws s3 sync public/models/ s3://your-model-viewer-bucket/models/ \
  --cache-control "public, max-age=31536000"
```

### Step 3: Configure Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-model-viewer-bucket/*"
    }
  ]
}
```

### Step 4: Create CloudFront Distribution
```bash
# Create distribution (save this as cloudfront-config.json)
{
  "CallerReference": "model-viewer-$(date +%s)",
  "Comment": "3D Model Viewer CDN",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-model-viewer-bucket",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-your-model-viewer-bucket",
        "DomainName": "your-model-viewer-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}

# Create distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

---

## 🔧 Option 3: EC2 Deployment (Advanced)

### Step 1: Launch EC2 Instance
```bash
# Launch Ubuntu instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --user-data file://user-data.sh
```

### Step 2: User Data Script (user-data.sh)
```bash
#!/bin/bash
apt update
apt install -y nginx nodejs npm

# Install bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Clone and build project
git clone https://github.com/your-username/model-viewer.git /var/www/html/
cd /var/www/html
bun install
bun build

# Configure nginx
cp dist/* /var/www/html/
systemctl start nginx
systemctl enable nginx
```

### Step 3: Configure Load Balancer (Optional)
```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name model-viewer-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678
```

---

## 📊 Cost Comparison

| Option | Setup Time | Monthly Cost | Scalability | Maintenance |
|--------|------------|--------------|-------------|-------------|
| **Amplify** | 10 minutes | $1-5 | Automatic | Minimal |
| **S3 + CloudFront** | 30 minutes | $0.50-2 | Manual | Low |
| **EC2** | 1-2 hours | $10-20 | Manual | High |

---

## 🚀 Automated Deployment Scripts

### Deploy Script (deploy.sh)
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Build project
echo "📦 Building project..."
bun build

# Choose deployment method
read -p "Choose deployment (1=Amplify, 2=S3, 3=EC2): " choice

case $choice in
  1)
    echo "🔄 Deploying to Amplify..."
    # Amplify deployment via GitHub webhook
    git add .
    git commit -m "Deploy: $(date)"
    git push origin main
    ;;
  2)
    echo "☁️ Deploying to S3..."
    aws s3 sync dist/ s3://$S3_BUCKET/ --delete
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
    ;;
  3)
    echo "🖥️ Deploying to EC2..."
    scp -r dist/* ec2-user@$EC2_HOST:/var/www/html/
    ;;
esac

echo "✅ Deployment complete!"
```

### Environment Variables (.env.production)
```bash
# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET=your-model-viewer-bucket
CLOUDFRONT_ID=E1234567890ABC
EC2_HOST=your-ec2-instance.amazonaws.com

# Application Configuration
VITE_MODEL_BASE_URL=https://your-domain.com/models/
VITE_ENABLE_ANALYTICS=true
```

---

## 🔒 Security Best Practices

### 1. IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://your-api.com;
  worker-src 'self' blob:;
">
```

---

## 📈 Performance Optimization

### 1. Compression Settings
```bash
# Enable gzip for all text files
aws s3 cp dist/ s3://your-bucket/ \
  --recursive \
  --content-encoding gzip \
  --exclude "*" \
  --include "*.js" \
  --include "*.css" \
  --include "*.html"
```

### 2. Cache Headers
```bash
# Long cache for assets
aws s3 cp dist/assets/ s3://your-bucket/assets/ \
  --recursive \
  --cache-control "public, max-age=31536000, immutable"

# Short cache for HTML
aws s3 cp dist/index.html s3://your-bucket/ \
  --cache-control "public, max-age=300"
```

### 3. Model File Optimization
```bash
# Compress large model files
gzip -9 public/models/*.ply
aws s3 cp public/models/ s3://your-bucket/models/ \
  --recursive \
  --content-encoding gzip \
  --content-type "application/octet-stream"
```

---

## 🔍 Monitoring & Analytics

### 1. CloudWatch Metrics
- **S3**: Request count, data transfer
- **CloudFront**: Cache hit ratio, origin latency
- **Amplify**: Build success rate, deployment time

### 2. Custom Analytics
```javascript
// Add to your app
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  // Track model loading times
  performance.mark('model-load-start');
  // ... after model loads
  performance.mark('model-load-end');
  performance.measure('model-load-time', 'model-load-start', 'model-load-end');
}
```

### 3. Error Tracking
```javascript
// Add error boundary
window.addEventListener('error', (event) => {
  // Send to CloudWatch or external service
  console.error('Application error:', event.error);
});
```

---

## 🎯 Recommended Workflow

### For Development/Testing: AWS Amplify
1. Connect GitHub repository
2. Automatic deployments on push
3. Built-in CDN and SSL
4. Easy rollbacks

### For Production: S3 + CloudFront
1. Maximum performance control
2. Lowest cost
3. Custom caching strategies
4. Global edge locations

### Deployment Commands
```bash
# Quick Amplify deployment
git push origin main

# S3 deployment with cache invalidation
./deploy.sh 2

# Check deployment status
aws amplify get-app --app-id your-app-id
aws s3 ls s3://your-bucket/
aws cloudfront get-distribution --id your-distribution-id
```

---

## 📞 Support & Troubleshooting

### Common Issues
1. **Large file uploads**: Use multipart upload for files >5GB
2. **CORS errors**: Configure bucket CORS policy
3. **Cache issues**: Create CloudFront invalidation
4. **SSL certificates**: Use AWS Certificate Manager

### Useful Commands
```bash
# Check deployment status
aws amplify list-apps
aws s3 ls s3://your-bucket/ --recursive --human-readable --summarize

# Monitor costs
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics BlendedCost

# Debug CloudFront
aws logs describe-log-groups --log-group-name-prefix /aws/cloudfront
```

---

**🎉 Your 3D Model Viewer is now ready for professional AWS deployment!**

Choose **AWS Amplify** for the easiest setup, or **S3 + CloudFront** for maximum cost efficiency and performance control. 