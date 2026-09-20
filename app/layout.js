export const metadata = {
  title: "Raven Junior School — Result MIS",
  description: "Result Management System for Raven Junior School",
  manifest: "/manifest.json",
  themeColor: "#1e3a6e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Raven MIS",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
