import React, { useRef } from "react";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { makeStyles } from "@material-ui/core/styles";
import { Scrollbars } from "react-custom-scrollbars";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles(theme => ({
  clearButton: {
    color: "white",
    float: "right",
    padding: "5px"
  }
}));

const Console = () => {
  const classes = useStyles();
  const refConsole = useRef();
  const refConsoleScroll = useRef();

  window.tsQhull.set("listener", "sensor", function(/*HTML String*/ msg) {
    sendConsoleMessage(msg);
  });

  window.tsQsbjExe.set("listener", "sensor", function(/*HTML String*/ msg) {
    sendConsoleMessage(msg);
  });

  const sendConsoleMessage = msg => {
    refConsole.current.innerHTML += msg;

    if (document.getElementById("dimLoading").style.display === "none") {
      refConsoleScroll.current.scrollToBottom();
    }
  };

  const clearConsole = () => {
    console.error(refConsole);
    let element = document.getElementById("console");
    while (element.hasChildNodes()) {
      element.removeChild(element.firstChild);
    }
  };

  return (
    <>
      <div className="consoleHeader" style={{ width: "100%" }}>
        <IconButton
          id="clearConsole"
          edge="start"
          className={classes.clearButton}
          color="inherit"
          aria-label="menu"
          onClick={clearConsole}
          title="Clear"
        >
          <DeleteForeverIcon style={{ fontSize: "20px" }} />
        </IconButton>
      </div>

      <Scrollbars
        id="consoleScroll"
        ref={refConsoleScroll}
        style={{ height: "calc(100% - 40px)" }}
        renderThumbVertical={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              backgroundColor: "rgb(255, 255, 255, 0.2)"
            }}
          />
        )}
      >
        <div id="console" ref={refConsole} className="console"></div>
      </Scrollbars>
    </>
  );
};

export default Console;
