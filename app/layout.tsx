import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SevaSaar AI • Multilingual Patient Intake & Triage Portal",
  description: "AI-powered multilingual patient intake assistant for hospitals in Gujarati, Hindi, English, and Hinglish. Streamlines triage without medical diagnosis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
