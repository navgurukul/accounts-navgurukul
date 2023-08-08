/* global google */
import { useState, useEffect } from 'react';
import './App.css';
import jwt_decode from 'jwt-decode';
import backgroundImg from './assets/background.png'
import logo from './assets/logo.svg';
import loader from './assets/loader.gif'

function App() {

  
  const [jwtToken, setJwtToken] = useState('');
  let [originUrl, setOriginUrl] = useState("");
  const [responseCount, setresponseCount] = useState(0);
  const [loading, setLoading] = useState(false)
  const [originName, setOriginName] = useState('')

  const handleCallbackResponse = (response) => {
    console.log("encoded data JWT: " + response.credential);
    setLoading(true)
    setJwtToken(response.credential); 
    // Decode the JWT token to get the user ID
    const decodedToken = jwt_decode(response.credential);
    // const googleUserId = decodedToken.sub; 
    // console.log(decodedToken, "decoded token")
    // console.log("Google User ID: " + googleUserId);

    let idToken = response.credential;
    let googleData = { 
      id: decodedToken.sub,
      name: decodedToken.name,
      imageUrl: decodedToken.picture,
      email: decodedToken.email,
      idToken,
    }
    const message = {
      type: "USER_LOGIN",
      payload: {
        token: idToken,
        userDetails: googleData,
      },
    };

    const postMessageToIframe = (iframeId, targetOrigin) => {
      const iframe = document.querySelector(iframeId);
      if (!iframe) {
        console.error(`Iframe with ID '${iframeId}' not found.`);
        return false;
      }
      const window = iframe.contentWindow;
      window.postMessage(message, targetOrigin);
      return true;
    };
    postMessageToIframe("#scratchiFrame", "https://sso-login.d3laxofjrudx9j.amplifyapp.com/");
    postMessageToIframe("#merakiiFrame", "https://sso-login.dkchei85ij0cu.amplifyapp.com/");
    postMessageToIframe("#dashboardiframe", "https://partner-dashboard-dev.vercel.app/");
    postMessageToIframe("#localiframe", "http://localhost:3000/");
    postMessageToIframe("#partnerlocal", "http://localhost:5173/");
  }

  useEffect(() => {
    if (responseCount >= 3) {
      setTimeout(() => {
        originUrl == 'https://partner-dashboard-dev.vercel.app/' || "http://localhost:3000/" ? window.location.href = `${originUrl}` : window.location.href = `${originUrl}login`
      }, 1000);

    }
  }, [responseCount]);
 
  useEffect(() => {
    localStorage.clear();
    console.log(document.referrer, "document origin link")
    setOriginUrl(document.referrer);
    if (originUrl == 'https://sso-login.d3laxofjrudx9j.amplifyapp.com/') setOriginName("Scratch")
    else if (originUrl == 'https://partner-dashboard-dev.vercel.app/') setOriginName("Partner Dashboard")
    else setOriginName("Meraki")

  }, [originUrl]);



  useEffect(() => {
    google?.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google?.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      width: 200, size: "large"
    });
   
  }, []);

  
  //For gettting response from the apps
  window.addEventListener("message", function (event) {
    if (event.origin == "https://sso-login.dkchei85ij0cu.amplifyapp.com") setresponseCount((prev) => prev + 1)
    if (event.origin == "https://sso-login.d3laxofjrudx9j.amplifyapp.com") setresponseCount((prev) => prev + 1)
    if (event.origin == "https://partner-dashboard-dev.vercel.app/") setresponseCount((prev) => prev + 1)
    if (event.origin == "http://localhost:3000/") setresponseCount((prev) => prev + 1)
    if (event.origin == "http://localhost:5173/") setresponseCount((prev) => prev + 1)

    else {
      console.warn("Unauthorized application sending response", event.origin);
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
      <iframe
        id="scratchiFrame"
        src="https://sso-login.d3laxofjrudx9j.amplifyapp.com"
        title="Scratch"
      ></iframe>
      <iframe
        id="merakiiFrame"
        src="https://sso-login.dkchei85ij0cu.amplifyapp.com/"
        title="Meraki"
      ></iframe>
      <iframe
        id="dashboardiframe"
        src="https://partner-dashboard-dev.vercel.app/"
        title="Meraki"
      ></iframe>
      <iframe
        id="localiframe"
        src="http://localhost:3000/"
        title="Meraki"
      ></iframe>
      <iframe
        id="partnerlocal"
        src="http://localhost:5173/"
        title="Meraki"
      ></iframe>
    </>
  );
}

export default App;
