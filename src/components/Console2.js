import React, { useRef, useState, useEffect } from "react";
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
  const consoleRef = useRef();
  const consoleScrollRef = useRef();

  let [log, setLog] = useState("");
  const [logQueue, setLogQueue] = useState([]);
  let [bufferClear, setBufferClear] = useState(false);
  let [bufferClearId, setBufferClearId] = useState();

  useEffect(() => {
    if (!bufferClear) {
      return;
    }

    const curLog = logQueue
      // .map(logData => logData.data)
      .reduce((acc, cur) => `${acc}${cur}`);
    setLog(`${consoleRef.current.innerHTML}${curLog}`);
    setLogQueue([]);

    setBufferClearId();
    setBufferClear(false);
  }, [bufferClear]);

  useEffect(() => {
    if (!bufferClear) {
      if (logQueue.length === 0) {
        return;
      } else if (logQueue.length === 1) {
        setBufferClearId(
          setTimeout(() => {
            setBufferClear(true);
          }, 100)
        );

        return;
      }

      if (bufferClearId) {
        clearTimeout(bufferClearId);
        setBufferClearId(
          setTimeout(() => {
            setBufferClear(true);
          }, 100)
        );
      }
    }
  }, [logQueue]);

  useEffect(() => {
    consoleScrollRef.current.scrollToBottom();
  }, [log]);

  window.tsQhull.set("listener", "sensor", function(/*HTML String*/ msg) {
    let cloneCueue = logQueue.slice();
    cloneCueue.push(msg);
    setLogQueue(cloneCueue);
  });

  window.tsQsbjExe.set("listener", "sensor", function(/*HTML String*/ msg) {
    let cloneCueue = logQueue.slice();
    cloneCueue.push(msg);
    setLogQueue(cloneCueue);
  });

  // const sendConsoleMessage = msg => {
  //   consoleRef.current.innerHTML += msg;
  //   consoleScrollRef.current.scrollToBottom();
  // };

  const clearConsole = () => {
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
          <DeleteForeverIcon
            id="clearIcon"
            style={{ fontSize: "20px", pointerEvents: "none", opacity: "0.3" }}
          />
        </IconButton>
        {/* <IconButton
          id="clearConsole"
          edge="start"
          className={classes.clearButton}
          color="inherit"
          aria-label="menu"
          onClick={e => {
            let cloneCueue = logQueue.slice();
            cloneCueue.push({data: `${index++}<div>test</div><br/><br/>`, time: new Date().getTime()});
            setLogQueue(cloneCueue);
            setIndex(index);
            // console.log(logQueue);
          }}
          title="Clear"
        >
          <DeleteForeverIcon style={{ fontSize: "20px" }} />
        </IconButton> */}
      </div>

      <Scrollbars
        id="consoleScroll"
        ref={consoleScrollRef}
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
        <div
          id="console"
          ref={consoleRef}
          className="console"
          dangerouslySetInnerHTML={{ __html: log }}
        ></div>
      </Scrollbars>
    </>
  );
};

export default Console;
