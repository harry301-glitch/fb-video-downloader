export interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'usage' | 'technical' | 'legal';
}

export const FAQ_DATA: FaqItem[] = [
  {
    category: 'general',
    question: 'What is Facebook Video Downloader?',
    answer:
      'Facebook Video Downloader is a free, web-based utility that enables you to save publicly accessible Facebook videos and reels directly to your device in MP4 format. It works directly in modern web browsers without requiring browser extensions, third-party software, or account sign-ups.'
  },
  {
    category: 'usage',
    question: 'How do I download a Facebook video?',
    answer:
      'To download a video: 1) Copy the link of the public Facebook video from your browser address bar or by tapping the "Share" button and selecting "Copy Link". 2) Paste the URL into our downloader box above. 3) Click "Download" to fetch the available streams. 4) Select your preferred video resolution (HD or SD) to save the MP4 file to your device.'
  },
  {
    category: 'legal',
    question: 'Can I download private Facebook videos?',
    answer:
      'No. Our service strictly processes only publicly accessible videos. We do not bypass privacy settings, login prompts, closed groups, password protections, or authentication mechanisms. If a video is set to "Friends only" or resides in a private group, our tool will not be able to retrieve it.'
  },
  {
    category: 'technical',
    question: 'Why is my Facebook video not downloading?',
    answer:
      'Common reasons include: 1) The video privacy is restricted to friends, a private group, or custom audience rather than Public. 2) The video post has been deleted or region-restricted by its creator. 3) The link provided is a profile or page URL rather than a direct video or reel post. 4) Temporary rate limits or network connectivity interruptions.'
  },
  {
    category: 'general',
    question: 'Does this downloader work on mobile?',
    answer:
      'Yes, Facebook Video Downloader is fully mobile-optimized. You can use it on any iOS device (iPhone or iPad via Safari or Chrome) and any Android smartphone or tablet. The responsive interface adapts seamlessly to touch screens and initiates native mobile file downloads.'
  },
  {
    category: 'general',
    question: 'Is the Facebook Video Downloader free?',
    answer:
      'Yes, this tool is 100% free to use. There are no subscription fees, hidden charges, usage paywalls, or mandatory registration requirements.'
  },
  {
    category: 'technical',
    question: 'What video quality is available?',
    answer:
      'When available from the original public upload, our downloader provides both High Definition (HD 1080p / 720p) and Standard Definition (SD 480p / 360p) streams in universal MP4 format. The available resolutions depend entirely on the quality of the video originally published to Facebook.'
  },
  {
    category: 'technical',
    question: 'Where are downloaded videos saved?',
    answer:
      'Videos are automatically saved in your device\'s default download location. On Windows and macOS, this is typically your system "Downloads" folder. On Android, files appear in the "Files" or "Downloads" app. On iOS (iPhone/iPad), downloaded files can be accessed via the "Files" app under "Downloads".'
  },
  {
    category: 'legal',
    question: 'Can I download videos that I do not own?',
    answer:
      'You should only download videos if you own the copyright, have explicit written permission from the copyright owner, or if the content is distributed under a permissive license (such as Creative Commons) or for permissible fair-use purposes. You are solely responsible for ensuring your use respects intellectual property rights.'
  },
  {
    category: 'legal',
    question: 'Why should I only download videos I have permission to use?',
    answer:
      'Respecting copyright laws and content creators protects you from intellectual property infringement and supports artists and publishers. Unauthorized distribution, commercial reproduction, or re-uploading of copyrighted media without permission violates international copyright laws and Facebook\'s terms of service.'
  }
];

export function getFaqSchema(faqs: FaqItem[] = FAQ_DATA) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };
}
