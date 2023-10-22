/* global google */
import { useState, useEffect } from 'react';
import './App.css';
import jwt_decode from 'jwt-decode';
import backgroundImg from './assets/background.png'
import logo from './assets/logo.svg';
import loader from './assets/loader.gif'
import { BrowserRouter as Router, Route, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
function App() {


  const location = useLocation();
  let [originUrl, setOriginUrl] = useState("");
  const [loading, setLoading] = useState(false)
  const [originName, setOriginName] = useState('')
  const [stateParam, setStateParam] = useState("")

  const { q } = useParams();

 function reverseLastFiveChars(str) {
    if (str?.length < 5) {
      return str;
    } else {
      const charArray = str?.slice(-5);
      return str.slice(0, str.length - 5).concat(charArray.split("").reverse().join(""))
    }
  }

  const handleCallbackResponse = (response) => {
    console.log("encoded data JWT: " + response.credential);
    setLoading(true)
    let jwtToken = response.credential;

    // Decode the JWT token to get the user ID
    const decodedToken = jwt_decode(response.credential);
    console.log(decodedToken)
    localStorage.setItem("token", response.credential)
    const reversedString = reverseLastFiveChars(jwtToken);


    console.log("Modified String:", reversedString);

    window.location.href = document.referrer + "?token=" + reversedString;
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
    let isFirstLogin = urlParams.get("isFirstLogin");
    console.log("first useeffect is running", loggedOutState)

    let storedToken = localStorage.getItem("token");

    if (loggedOutState == true) {
      localStorage.removeItem("token")
    }
    else if (loggedOutState == "false") {
      console.log("second useeffect is running")
      window.location.href = document.referrer + "?token=" + reverseLastFiveChars(storedToken)
    } else if (isFirstLogin == "true" && localStorage.getItem("token")) {
      console.log("third useeffect is running")
      window.location.href = document.referrer + "?token=" + reverseLastFiveChars(storedToken)
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