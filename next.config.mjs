/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      lokijs: false,
      encoding: false,
    }

    // Alias optional wallet connector peer deps to false (empty module)
    const optionalDeps = [
      '@metamask/sdk',
      '@coinbase/wallet-sdk',
      '@base-org/account',
      'porto',
      'porto/internal',
    ]

    optionalDeps.forEach((dep) => {
      config.resolve.alias[dep] = false
    })

    return config
  },
}

export default nextConfig
