'use client';

import { MantineProvider, createTheme, MantineColorsTuple, Loader } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { ReactNode, useMemo } from 'react';

// Vibrant, High-Contrast Luxury Colors
const COLORS: Record<string, MantineColorsTuple> = {
  pink: [
    '#fff0f6', '#ffdeeb', '#fbacc9', '#f779a7', '#f3518d',
    '#f0307e', '#ee2277', '#d51666', '#be105b', '#a60a51'
  ],
  blue: [
    '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7',
    '#339af0', '#1c7ed6', '#1971c2', '#1864ab', '#104d82'
  ],
  red: [
    '#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787',
    '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'
  ],
  orange: [
    '#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d',
    '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f'
  ],
  green: [
    '#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9',
    '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b'
  ],
  dark: [
    '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
    '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'
  ]
};

export function ThemeWrapper({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const themeColor = useMemo(() => {
    return (session?.user as any)?.theme_color || 'blue';
  }, [session]);

  const theme = useMemo(() => {
    return createTheme({
      primaryColor: themeColor,
      primaryShade: { light: 6, dark: 8 },
      colors: COLORS,
      fontFamily: '"Geist", sans-serif',
      headings: {
        fontFamily: '"Geist", sans-serif',
        fontWeight: '700',
      },
      components: {
        Card: {
          defaultProps: {
            padding: 'lg',
            radius: 'md',
            withBorder: true,
          },
          styles: {
            root: {
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 25px rgba(0,0,0,0.06)',
              }
            }
          }
        },
        Button: {
          defaultProps: {
            radius: 'md',
            loaderProps: { type: 'dots' },
          },
          styles: {
            root: {
              transition: 'all 0.2s ease',
              fontWeight: 600,
            }
          }
        },
        AppShell: {
          styles: {
            navbar: {
              borderRight: '1px solid rgba(0,0,0,0.05)',
            },
            header: {
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.8)',
            }
          }
        },
        Table: {
          styles: {
            th: { textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', color: '#888' },
            tr: { transition: 'background-color 0.1s ease' },
          }
        }
      }
    });
  }, [themeColor]);

  // ซ่อนเนื้อหาจนกว่า Session จะโหลดเสร็จ เพื่อป้องกันการเห็นสีอื่นก่อน (Flash of Color)
  if (status === 'loading') {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #339af0',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <span style={{ color: '#888', fontSize: '14px' }}>กำลังโหลดระบบ...</span>
        </div>
      </div>
    );
  }

  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
