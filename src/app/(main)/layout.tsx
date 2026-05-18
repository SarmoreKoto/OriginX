import { Toaster } from "react-hot-toast";
import DashboardShell from "@/resources/header_collapse";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DashboardShell>
          {children}
        </DashboardShell>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}