import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sontakun (ソンタくん)',
    short_name: 'Sontakun',
    description: '空気を読むAI日程調整ツール',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/sontakun-icon.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  }
}
