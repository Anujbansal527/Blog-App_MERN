import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon ,disable=false }) => {

  const [passVisible, setPassVisible] = useState(false);

  return (
    <>
      <div className="relative w-[100%] mb-4">
        <input
          name={name}
          type={ type == "password" ? passVisible ? "text" : "password" : type }
          placeholder={placeholder}
          defaultValue={value}
          id={id}
          disabled={disable}
          className="input-box "
        />
        <i className={" fi " + icon + " input-icon "}></i>

        {type == "password" ? (
          <i className={"fi fi-rr-eye" + (!passVisible ? "-crossed" : "" )  + " input-icon left-[auto] right-4 cursor-pointer "}
          onClick={()=>setPassVisible(currentValue => !currentValue)} ></i>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default InputBox;
