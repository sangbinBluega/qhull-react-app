import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CardMedia from "@material-ui/core/CardMedia";

import AccountTreeIcon from "@material-ui/icons/AccountTree";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import PolymerIcon from "@material-ui/icons/Polymer";

import "../styles/header.scss";

let courseFlag = true,
  viewFlag = true,
  consoleFlag = true,
  tempViewWidth = "",
  tempViewHeight = "",
  tempConsoleHeight = "";

//course show/hidden
function visibilityCourse() {
  let courseElement = document.getElementsByClassName(
    "layout-pane layout-pane-primary"
  )[0];

  let viewElement = document.getElementsByClassName("layout-pane")[1];
  let courseButton = document.getElementById("courseButton");
  let splitterLine = document.getElementsByClassName("layout-splitter")[0];
  let viewButton = document.getElementById("viewButton");

  if (courseFlag) {
    courseFlag = false;
    courseElement.style.display = "none";
    tempViewWidth = viewElement.style.width;
    viewElement.style.width = "100%";
    courseButton.style.opacity = "0.3";
    splitterLine.style.pointerEvents = "none";
    courseButton.setAttribute("title", "Show Course pane");
    if (!viewFlag && !consoleFlag) {
      viewButton.style.pointerEvents = "none";
      viewFlag = false;
      visibilityView();
    }
  } else {
    courseFlag = true;
    courseElement.style.display = "";
    viewElement.style.width = tempViewWidth;
    courseButton.style.opacity = "1";
    splitterLine.style.pointerEvents = "";
    courseButton.setAttribute("title", "Hide Course pane");
    if (viewFlag || consoleFlag) {
      courseElement.style.flex = "1 1 auto";
      courseElement.style.width = "";
    } else if (!viewFlag && !consoleFlag) {
      courseElement.style.flex = "0 0 auto";
      courseElement.style.width = "100%";
    }
  }

  checkViewPointer();
}

//view show/hidden
function visibilityView() {
  let viewElement = document.getElementsByClassName("layout-pane")[2];
  let viewButton = document.getElementById("viewButton");
  let courseElement = document.getElementsByClassName(
    "layout-pane layout-pane-primary"
  )[0];

  if (viewFlag) {
    viewFlag = false;
    viewElement.style.display = "none";
    viewButton.style.opacity = "0.3";
    viewButton.setAttribute("title", "Show Preview pane");
    if (courseFlag && !consoleFlag) {
      courseElement.style.flex = "0 0 auto";
      courseElement.style.width = "100%";
    }
  } else {
    viewFlag = true;
    viewElement.style.display = "";
    viewButton.style.opacity = "1";
    viewButton.setAttribute("title", "Hide Preview pane");
    if (courseFlag && !consoleFlag) {
      courseElement.style.flex = "1 1 auto";
      courseElement.style.width = "";
    }
  }

  checkViewPointer();
}

//console show/hidden
function visibilityConsole(e) {
  let viewElement = document.getElementsByClassName("layout-pane")[2];

  let consoleElement = document.getElementsByClassName(
    "layout-pane layout-pane-primary"
  )[1];

  let consoleButton = document.getElementById("consoleButton");

  let courseElement = document.getElementsByClassName(
    "layout-pane layout-pane-primary"
  )[0];
  let viewButton = document.getElementById("viewButton");

  if (consoleFlag) {
    consoleFlag = false;
    tempViewHeight = viewElement.style.height;
    tempConsoleHeight = consoleElement.style.height;
    consoleElement.style.display = "none";
    viewElement.style.height = "calc(100% - 24px)";
    consoleButton.style.opacity = "0.3";
    consoleButton.setAttribute("title", "Show Console pane");
    if (courseFlag && !viewFlag) {
      courseElement.style.flex = "0 0 auto";
      courseElement.style.width = "100%";
    }
    if (!viewFlag && !consoleFlag) {
      viewButton.style.pointerEvents = "none";
      viewFlag = false;
      visibilityView();
    }
  } else {
    consoleFlag = true;
    viewElement.style.height = tempViewHeight;
    consoleElement.style.height = tempConsoleHeight;
    consoleElement.style.display = "";
    consoleButton.style.opacity = "1";
    consoleButton.setAttribute("title", "Hide Console pane");
    if (courseFlag && !viewFlag) {
      courseElement.style.flex = "1 1 auto";
      courseElement.style.width = "";
    }
  }

  checkViewPointer();
}

function checkViewPointer() {
  let viewButton = document.getElementById("viewButton");

  if (!consoleFlag && !courseFlag) {
    viewButton.style.pointerEvents = "none";
  } else {
    viewButton.style.pointerEvents = "";
  }
}

const useStyles = makeStyles(theme => ({
  paper: {
    padding: 0,
    width: "100%",
    height: "60px",
    minHeight: "70px",
    zIndex: 1,
    backgroundColor: "rgb(3,101,179)"
  },
  logo: {
    marginRight: theme.spacing(2),
    pointerEvents: "none"
  },
  menuButton: {
    justifyContent: "right",
    color: "white",
    marginRight: theme.spacing(1)
  },
  appBar: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgb(3,101,179)",
    justifyContent: "center"
  },
  typography: {
    color: "white",
    marginLeft: "20px",
    fontFamily: "'Open Sans', sans-serif"
  }
}));

const Header = () => {
  const classes = useStyles();
  return (
    <Paper id="header" className={classes.paper}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            className={classes.logo}
            color="inherit"
            aria-label="menu"
          >
            <CardMedia
              component="img"
              src={window.tsQhull.get("ui", "titleLogo")}
            />
          </IconButton>

          <Typography variant="h6" className={classes.typography}>
            {window.tsQhull.get("ui", "title")}
          </Typography>

          <div className="buttons">
            <IconButton
              id="courseButton"
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={visibilityCourse}
              title="Hide Course pane"
            >
              <AccountTreeIcon />
            </IconButton>

            <IconButton
              id="viewButton"
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={visibilityView}
              title="Hide Preview pane"
            >
              <DesktopWindowsIcon />
            </IconButton>

            <IconButton
              id="consoleButton"
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={visibilityConsole}
              title="Hide Console pane"
            >
              <PolymerIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </Paper>
  );
};

export default Header;
