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
  const [jwtToken, setJwtToken] = useState('');
  let [originUrl, setOriginUrl] = useState("");
  const [loading, setLoading] = useState(false)
  const [originName, setOriginName] = useState('')
  const [stateParam, setStateParam] = useState("")

  const { q } = useParams();

  const handleCallbackResponse = (response) => {
    console.log("encoded data JWT: " + response.credential);
    setLoading(true)
    setJwtToken(response.credential);
    // Decode the JWT token to get the user ID
    const decodedToken = jwt_decode(response.credential);
    console.log(decodedToken)
    sessionStorage.setItem("token", response.credential)

    console.log(document.referrer , "document referrer")
    window.location.href = document.referrer;


    setTimeout(() => {
      sessionStorage.removeItem("token")
    }, 5000);

  }



  let qValue;
  useEffect(() => {

    setOriginUrl(document.referrer);
    // Use URLSearchParams to parse the query string
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of the 'q' parameter
    qValue = urlParams.get("q");
    setStateParam(JSON.stringify(qValue))
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


  window.addEventListener('message', event => {
    if (event.origin === 'http://localhost:3000') {
      // Check if the token is present in sessionStorage
      console.log("event received at accounts page", event.origin)
      const token = sessionStorage.getItem('token');

      // Send the token back to localhost:3000
      var response = "Message received at meraki";
      event.source.postMessage(token, event.origin);
    }
  });


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