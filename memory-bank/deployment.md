# Bloom IL - Deployment Configuration

## Environment Setup

### Required Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key for client-side access

### Setting Environment Variables in Vercel
1. **Via Vercel Dashboard**:
   - Go to project settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Set for Production, Preview, and Development environments

2. **Via Vercel CLI**:
   ```bash
   npx vercel env add VITE_SUPABASE_URL
   npx vercel env add VITE_SUPABASE_ANON_KEY
   ```

## Known Deployment Issues

### Rollup Linux Platform Dependencies Error
**Problem**: Build fails on Vercel/Linux deployment with missing `@rollup/rollup-linux-x64-gnu` module

**Solution Applied**: Added to `package.json`:
```json
"optionalDependencies": {
  "@rollup/rollup-linux-x64-gnu": "^4.24.0"
},
"overrides": {
  "rollup": "npm:@rollup/wasm-node"
}
```

**Status**: ✅ Resolved - builds successfully on Vercel

### node-domexception Deprecation Warning
**Warning**: `npm warn deprecated node-domexception@1.0.0`

**Impact**: Warning only - does not affect functionality
**Root Cause**: Transitive dependency from Supabase package chain
**Action**: No action required - warning can be safely ignored

## Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: Compatible with Node.js 18+
- **Build Tool**: Vite with TypeScript and React plugins

## Deployment Status
- ✅ Successfully deployed to Vercel
- ✅ Environment variables configured
- ✅ Build issues resolved
- ✅ Application fully functional in production 