import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = ({ children }: { children: ReactNode }) => {
  

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Conditionally render Navbar */}
      <Navbar />
      
      <main className="flex-grow">{children}</main>
      
      {/* Conditionally render Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;