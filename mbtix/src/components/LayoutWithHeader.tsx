import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function LayoutWithHeader() {
  return (
    <>
      <Header />
      <Outlet />   {/* 자식 라우트가 여기 들어옴 */}
    </>
  );
}
