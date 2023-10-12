/* global google */
import { useState, useEffect } from 'react';
import './App.css';
import jwt_decode from 'jwt-decode';
import backgroundImg from './assets/background.png'
import logo from './assets/logo.svg';
import loader from './assets/loader.gif'
import { BrowserRouter as Router, Route, useLocation } from 'react-router-dom';

import createHost from "cross-domain-storage/host";
import { useParams } from 'react-router-dom';
function App() {


  const location = useLocation();
  let [originUrl, setOriginUrl] = useState("");
  const [loading, setLoading] = useState(false)
  const [originName, setOriginName] = useState('')
  const [stateParam, setStateParam] = useState("")

  const { q } = useParams();

  const handleCallbackResponse = (response) => {
    console.log("encoded data JWT: " + response.credential);
    setLoading(true)
    let jwtToken = response.credential;

    // Decode the JWT token to get the user ID
    const decodedToken = jwt_decode(response.credential);
    console.log(decodedToken)
    localStorage.setItem("token", response.credential)

    // Step 1: Convert the input string to ASCII codes
    const asciiCodes = [];
    for (let i = 0; i < jwtToken.length; i++) {
      asciiCodes.push(jwtToken.charCodeAt(i));
    }

    // Step 2: Increment each ASCII code by 1 if it's not equal to 9
    const modifiedAsciiCodes = asciiCodes.map(code => (code !== 57 ? code + 1 : code));

    // Step 3: Convert the modified ASCII codes back to a string
    const modifiedString = String.fromCharCode(...modifiedAsciiCodes);

    console.log("Modified String:", modifiedString);

    window.location.href = document.referrer + "?token=" + modifiedString;
    console.log(document.referrer, "document referrer")
  }



  let qValue;
  useEffect(() => {

    setOriginUrl(document.referrer);
    // Use URLSearchParams to parse the query string
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of the 'q' parameter
    qValue = urlParams.get("q");
    setStateParam(JSON.stringify(qValue))

    let loggedOutState = urlParams.get("loggedOut");
    if (loggedOutState === "true") {
      localStorage.removeItem("token");
    }
    else if (loggedOutState === "false") {
     let token =  localStorage.get("token", qValue)
      window.location.href = document.referrer + "?token=" + token;
    }


    // Log the 'q' parameter value
    console.log("Value of 'q' parameter:", qValue);


    google?.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google?.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      width: 200, size: "large"
    });

    document.title = "Accounts Navgurukul";


  }, []);



  return (

    <>
      {
        <div className="container">
          <img id="backgroundImg" src={backgroundImg} alt="" />
          <div id="login-container">
            <img id="ng-logo" src={logo} alt="" />
            <h2 id="learn-heading">Embark On Your Learning Journey</h2>
            <h5>Continue to {originName}</h5>
            <div id="signInDiv" className="custom-google-button" >Login with Google</div>
            {loading ?
              <img src={loader} alt="loader" id="loading-image" /> : null}
          </div>
        </div>
      }
    </>
  );
}

export default App;