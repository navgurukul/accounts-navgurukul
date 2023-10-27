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


  function reverseJwtBody(jwt) {
    const [header, body, signature] = jwt.split('.');
    const reversedBody = body.split('').reverse().join('');
    return [header, reversedBody, signature].join('.');
  }

  const handleCallbackResponse = (response) => {
    console.log("encoded data JWT: " + response.credential);
    setLoading(true)
    let jwtToken = response.credential;
    console.log(document.referrer, "document referrer")
    // Decode the JWT token to get the user ID
    const decodedToken = jwt_decode(response.credential);
    console.log(decodedToken)
    localStorage.setItem("token", response.credential)
    const reversedString = reverseJwtBody(jwtToken);


    console.log("Modified String:", reversedString);

    window.location.href = document.referrer+`?q=${qValue}&token=`+reversedString;
    console.log(document.referrer, "document referrer")

  }

  let qValue;
  useEffect(() => {

    console.log(document.referrer, "document referrer")
    setOriginUrl(document.referrer);
  document.referrer=="https://partner-dashboard-dev.vercel.app/"?setOriginName("Partner Dashboard"):setOriginName("Meraki")
    // Use URLSearchParams to parse the query string
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of the 'q' parameter
    qValue = urlParams.get("q");
    setStateParam(JSON.stringify(qValue))

    let loggedOutState = urlParams.get("loggedOut");
    let isFirstLogin = urlParams.get("isFirstLogin");

    let storedToken = localStorage.getItem("token");
    if (loggedOutState == true) {
      localStorage.removeItem("token")
    }
    else if (loggedOutState == "false" && storedToken!=="undefined" && localStorage.getItem("token")) {
      window.location.href = document.referrer+`?q=${qValue}&token=`+reverseJwtBody(storedToken)
    } else if (isFirstLogin == "true" && localStorage.getItem("token")) {
      window.location.href = document.referrer+`?q=${qValue}&token=`+reverseJwtBody(storedToken)
    }
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