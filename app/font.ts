import { Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const Mont = localFont({
  src: [
    {
      path: './fonts/Mont-Trial-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Mont-Trial-Semibold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Mont-Trial-Book.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Mont-Trial-Bold.woff',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-mont',
});
