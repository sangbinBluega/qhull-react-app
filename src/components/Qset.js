import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";

const useStyles = makeStyles(theme => ({
  frame: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    padding: 0,
    zIndex: 1,
    backgroundColor: "white"
  },
  tab: {
    position: "fixed",
    zIndex: 2,
    width: "100px",
    height: "20px",
    marginTop: "-20px",
    backgroundColor: "white"
    //color: "white"
  }
}));

const Qset = () => {
  const classes = useStyles();

  return (
    <>
      <div>
        <div className={classes.tab}>
          <DesktopWindowsIcon style={{ fontSize: 20, marginLeft: 15 }} />
          <span
            style={{ position: "absolute", marginLeft: "10px", bottom: "1px" }}
          >
            View
          </span>
        </div>

        <Paper
          id="qset"
          component="iframe"
          frameBorder="no"
          scrolling="no"
          className={classes.frame}
        ></Paper>
      </div>
    </>
  );
};

export default Qset;
