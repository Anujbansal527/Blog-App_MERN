import { Link, Navigate } from "react-router-dom";
import InputBox from "../Components/imput.component";
import googleIcon from "../images/google.png";
import AnimationWrapper from "../Common/page-animation";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../App";
import { storeInSession } from "../Common/session";
import { authWithGoogle } from "../Common/firebase";

const UserAuthForm = ({ type }) => {

  //call context api  for user data
  let {userAuth : {access_token} , setUserAuth} = useContext(UserContext);

  //console.log(access_token)

  //creating functionto svaed data to server
  const userAuthToServer = async (serverRoute, formData) => {
    await axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth${serverRoute}`,
        formData
      )
      .then(({ data }) => {

        //setting session
        storeInSession("user",JSON.stringify(data))
        //console.log(sessionStorage)
      
        //setting session details globaly
        setUserAuth(data)
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handelSubmit = (e) => {
    //preventing default behave 
    e.preventDefault();

    //setting server Route

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    //regx validation for email and password
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    //formdata
    let form = new FormData(formElement);
    //console.log(form)

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    //destructuring form data
    let { fullname, email, password } = formData;

    //form validatoion frontend
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Full name must be at least 3 characters");
      }
    }

    if (!email.length) {
      return toast.error("Enter Email");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Email is Invalid");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password Should be 6 to 20 Character long with a numeric , ! lowercase , 1 uppercase letter"
      );
    }

    //calling function
    userAuthToServer(serverRoute, formData);

  };

  
    //google auth signup
    const GoogleAuthHandel = async(e) => {
      e.preventDefault();

      authWithGoogle()
      .then((user)=>{
        
        let serverRoute = "/google-auth";

        let formData = {
          access_token:user.accessToken
        }

        userAuthToServer(serverRoute,formData)
      })
      .catch((error)=>{
        toast.error("Trouble Login With Google")
        console.log(error)
      })
  }

  return (
    access_token 
    ? 
    <Navigate to="/" /> 
    :
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center ">
        <Toaster />
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize mb-4">
            {type == "sign-in" ? " Welcome Back " : " Join Us Today"}
          </h1>
          {type != "sign-in" ? (
            <InputBox
              name={"fullname"}
              typr={"text"}
              placeholder={"Full Name"}
              icon={"fi-rr-user"}
            />
          ) : (
            " "
          )}
          <InputBox
            name={"email"}
            typr={"email"}
            placeholder={"Email"}
            icon={"fi-rr-envelope"}
          />

          <InputBox
            name={"password"}
            type={"password"}
            placeholder={"Password"}
            icon={"fi-rr-key"}
          />

          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handelSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button 
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={GoogleAuthHandel}
          >
            <img src={googleIcon} className="w-5 " />
            Continue With Google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't Have An Account{" "}
              <Link to="/singup" className="underline text-black text-xl ml-1">
                Join Us Now
              </Link>{" "}
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Have An Account ?{" "}
              <Link to="/singin" className="underline text-black text-xl ml-1">
                Sign In Here
              </Link>{" "}
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
