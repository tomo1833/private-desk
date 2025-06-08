import React from "react";

const MainLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return <>{children}</>;
};

export default MainLayout;
