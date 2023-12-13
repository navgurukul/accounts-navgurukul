/* global google */
import { useState, useEffect } from "react";
import "./App.css";
import jwt_decode from "jwt-decode";
import backgroundImg from "./assets/background.png";
import logo from "./assets/logo.svg";
import loader from "./assets/loader.gif";
import { BrowserRouter as Router, Route, useLocation } from "react-router-dom";
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

    axios({
      url: `https://merd-api.merakilearn.org/users/auth/google`,
      method: "post",
      headers: { accept: "application/json", Authorization: jwtToken },
      data: { idToken: jwtToken, mode: "web" },
    }).then((res) => {
      console.log("res", res.data.token);

      localStorage.setItem("token", res.data.token);
      axios
        .get("https://merd-api.merakilearn.org/users/addSessionToken")
        .then((response) => {
          localStorage.setItem("loggoutToken", response.data);
          if (
            document.referrer == "http://localhost:8080/" ||
            document.referrer ==
              "https://sso-login.d3laxofjrudx9j.amplifyapp.com/"
          ) {
            window.location.href =
              document.referrer +
              "login/?token=" +
              res.data.token +
              "&loggoutToken=" +
              response.data;
            console.log(document.referrer, "document referrer");
          } else {
            window.location.href =
              document.referrer +
              "?token=" +
              reverseJwtBody(res.data.token) +
              "&loggoutToken=" +
              response.data;
            console.log(document.referrer, "document referrer");
          }
        });
    });
  };

  let isLoggedOut;
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
    isLoggedOut = urlParams.get("loggedOut");

    let storedToken = localStorage.getItem("token");

    if (isLoggedOut == "true") {
      Logout();
    }
    if (
      isLoggedOut == "false" &&
      localStorage.getItem("token") &&
      localStorage.getItem("loggoutToken")
    ) {
      if (
        document.referrer == "http://localhost:8080/" ||
        (document.referrer ==
          "https://sso-login.d3laxofjrudx9j.amplifyapp.com/" &&
          !isLoggedOut)
      ) {
        window.location.href =
          document.referrer +
          "login/?token=" +
          localStorage.getItem("token") +
          "&loggoutToken=" +
          localStorage.getItem("loggedOutToken");
        console.log(document.referrer, "document referrer");
      } else {
        window.location.href =
          document.referrer +
          "?token=" +
          reverseJwtBody(localStorage.getItem("token")) +
          "&loggoutToken=" +
          localStorage.getItem("loggedOutToken");
        console.log(document.referrer, "document referrer");
      }
    }

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
