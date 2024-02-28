import { useContext, useState } from "react";
import logo from "../images/logo.png";
import { Link, Outlet } from "react-router-dom";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";

const Navbar = () => {
  //search box visiblity statte
  const [searchBox, setSearchBox] = useState(false);

  //navigation panel
  const [userNav, setUserNav] = useState(false);

  //fetching global user data from context
  const {
    userAuth,
    userAuth: { access_token, profile_img },
  } = useContext(UserContext);

  //usernav panel
  const handelUserNav = () => {
    setUserNav((currVal) => !currVal);
  };

  const handelBlur = () => {
    setTimeout(() => setUserNav(false), 200);
  };

  return (
    <>
      {/* Logo */}
      <nav className="navbar">
        <Link to="/" className="flex-none w-20">
          <img src={logo} alt="logo" className="w-full" />
        </Link>

        {/* Search bar */}
        <div
          className={
            searchBox
              ? "show"
              : "hide" +
                " absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey md:border-0 md:block md:relative md:inset-0 md:p-0  md:w-auto  md:show "
          }
        >
          <input
            type="text"
            placeholder="Serach"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey py-4 px-[5vw] md:pl-12"
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        {/* Search Buttons */}
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setSearchBox((currentValue) => !currentValue)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>
        </div>

        <Link to={"/edditor"} className="hidden md:flex gap-2 link ">
          <i className="fi fi-rr-attribution-pen"></i>
          <p>Write </p>
        </Link>

        {access_token ? (
          <>
            <Link to="/dashboard/notification">
              <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                <i className="fi fi-rr-bell text-2xl block mt-1"></i>
              </button>
            </Link>

            <div
              className="relative"
              onClick={handelUserNav}
              onBlur={handelBlur}
            >
              <button className="w-12 h-12 mt-1">
                <img
                  src={profile_img}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>

              {userNav ? <UserNavigationPanel /> : ""}
            </div>
          </>
        ) : (
          <>
            <Link to={"/singin"} className="btn-dark py-2 ">
              Sing In
            </Link>

            <Link to={"/singup"} className="btn-light py-2  md:block hidden">
              Sing Up
            </Link>
          </>
        )}
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
