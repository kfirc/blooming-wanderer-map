# Deployment Issues

## Rollup Linux Platform Dependencies Error

**Problem**: Build fails on Vercel/Linux deployment with:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

**Root Cause**: npm bug with optional dependencies - platform-specific rollup binaries not installed correctly on Linux deployment environments.

**Solution**: Add to `package.json`:
```json
"optionalDependencies": {
  "@rollup/rollup-linux-x64-gnu": "^4.24.0"
}
```

**Alternative Solution**: Use WebAssembly fallback:
```json
"overrides": {
  "rollup": "npm:@rollup/wasm-node"
}
```

**Reference**: 
- npm issue: https://github.com/npm/cli/issues/4828
- Vercel issue: https://github.com/vercel/vercel/issues/11665

**Last Updated**: 2025-01-08 