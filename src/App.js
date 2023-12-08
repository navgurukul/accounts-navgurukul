/* global google */
import { useState, useEffect } from "react";
import "./App.css";
import jwt_decode from "jwt-decode";
import backgroundImg from "./assets/background.png";
import logo from "./assets/logo.svg";
import loader from "./assets/loader.gif";
import { BrowserRouter as Router, Route, useLocation } from "react-router-dom";

import createHost from "cross-domain-storage/host";
import { useParams } from "react-router-dom";
import axios from "axios";
function App() {
  const location = useLocation();
  let [originUrl, setOriginUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [originName, setOriginName] = useState("");
  const [stateParam, setStateParam] = useState("");

  const { q } = useParams();

  function reverseJwtBody(jwt) {
    const [header, body, signature] = jwt.split(".");
    const reversedBody = body.split("").reverse().join("");
    return [header, reversedBody, signature].join(".");
  }

  const handleCallbackResponse = async (response) => {
    setLoading(true);
    let jwtToken = response.credential;
    localStorage.setItem("token", jwtToken);

    axios({
      url: `https://merd-api.merakilearn.org/users/auth/google`,
      method: "post",
      headers: { accept: "application/json", Authorization: jwtToken },
      data: { idToken: jwtToken, mode: "web" },
    }).then((res) => {
      console.log("res", res.data.token);
      axios
        .get("https://merd-api.merakilearn.org/users/addSessionToken")
        .then((response) => {
          console.log(response.data, "response data");

          const reversedString = reverseJwtBody(jwtToken);
          console.log(document.referrer, "document referrer");
          if (document.referrer == "http://localhost:8080/"|| document.referrer == "https://sso-login.d3laxofjrudx9j.amplifyapp.com/") {
            window.location.href =
              document.referrer +
              "login/?token=" +
              res.data.token +
              "&loggoutToken=" +
              response.data;
            console.log(document.referrer, "document referrer");
          }else{
            window.location.href =
            document.referrer +
            "?token=" +
            res.data.token +
            "&loggoutToken=" +
            response.data;
          console.log(document.referrer, "document referrer");
          }
        });
    });

    // Decode the JWT token to get the user ID
    // const decodedToken = jwt_decode(response.credential);
    // console.log(decodedToken);
    // localStorage.setItem("token", response.credential);

    // let generatedSessionToken = await
    // console.log("GeneratedToken:", generatedSessionToken.data);
    // localStorage.setItem("loggoutToken", generatedSessionToken.data);
  };

  let qValue;
  useEffect(() => {
    async function Logout() {
      let removedSessionToken = await axios.get(
        `https://merd-api.merakilearn.org/users/removeSessionToken?token=${localStorage.getItem(
          "loggoutToken"
        )}`
      );
      localStorage.removeItem("token");
      localStorage.removeItem("loggoutToken");
    }
    setOriginUrl(document.referrer);
    // Use URLSearchParams to parse the query string
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of the 'q' parameter
    qValue = urlParams.get("q");
    setStateParam(JSON.stringify(qValue));

    let loggedOutState = urlParams.get("loggedOut");
    let isFirstLogin = urlParams.get("isFirstLogin");
    console.log("first useeffect is running", loggedOutState);
    let storedToken = localStorage.getItem("token");

    // if (loggedOutState == "true") {
    //   Logout();
    //   window.location.href = document.referrer;
    // } else if (document.referrer && storedToken) {
    //   // TODO: SECURITY ISSUE: document.referrer needs to be checked against whitelist of URLS, DON'T LEAK TOKEN
    //   window.location.href =
    //     document.referrer +
    //     "?token=" +
    //     reverseJwtBody(storedToken) +
    //     "&loggoutToken=" +
    //     localStorage.getItem("loggoutToken");
    // }
    if (
      loggedOutState == "false" &&
      localStorage.getItem("token") &&
      localStorage.getItem("loggoutToken")
    ) {
      console.log("second useeffect is running");
      // window.location.href =
      //   document.referrer +
      //   "?token=" +
      //   reverseJwtBody(
      //     storedToken + "&loggoutToken=" + localStorage.getItem("loggoutToken")
      //   );
    }

    // Log the 'q' parameter value
    console.log("Value of 'q' parameter:", qValue);

    google?.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google?.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      width: 200,
      size: "large",
    });
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
            <div id="signInDiv" className="custom-google-button">
              Login with Google
            </div>

            {loading ? (
              <img src={loader} alt="loader" id="loading-image" />
            ) : null}
          </div>
        </div>
      }
    </>
  );
}

export default App;
