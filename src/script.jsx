import React from "react";
import { render } from "react-dom";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import "./style.scss";
import App from "./app/App";
import pkg from "../package.json";

// loads the Icon plugin
UIkit.use(Icons);

render(<App title={pkg.name} />, document.getElementById("root"));
