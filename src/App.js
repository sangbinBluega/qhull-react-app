import React from "react";
import TreeContainer from "./containers/TreeContainer";
import ViewContainer from "./containers/ViewContainer";
import ConsoleContainer from "./containers/ConsoleContainer";
import HeaderContainer from "./containers/HeaderContainer";

import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import "./App.scss";

const App = () => {
  const onDragStart = () => {
    document.getElementById("view").style.pointerEvents = "none";
  };

  const onDragEnd = () => {
    document.getElementById("view").style.pointerEvents = "";

    let rightPaneWidth = document
      .getElementsByClassName("layout-pane")[1]
      .style.width.replace("%", "");

    let rightPaneHeight = document
      .getElementsByClassName("layout-pane")[2]
      .style.height.replace("%", "");

    localStorage.setItem("rightPaneWidth", rightPaneWidth);
    localStorage.setItem("rightPaneHeight", rightPaneHeight);
  };

  window.tsQhull.set("listener", "sensor", function(/*HTML String*/ msg) {
    sendConsoleMessage(msg);
  });

  window.tsQsbjExe.set("listener", "sensor", function(/*HTML String*/ msg) {
    sendConsoleMessage(msg);
  });

  const sendConsoleMessage = msg => {
    document.getElementById("console").innerHTML += msg;
    let consoleElement = document.getElementById("console");
    let scrollElement = document.getElementById("consoleScroll");
    consoleElement.scrollTop = consoleElement.scrollHeight;
    scrollElement.childNodes[0].scrollTop = consoleElement.scrollHeight;
  };

  if (document.getElementsByTagName("TITLE").length) {
    try {
      //%%IE8
      document.getElementsByTagName("TITLE")[0].innerHTML =
        window.tsQhull.get("ui", "title") || "서비스 구조 실행기";
    } catch (ex) {}
  }

  function onChangeCourse(e) {
    sendMessage({
      method: "resize",
      width: e
    });
  }

  function onChangeFrame(e) {
    sendMessage({
      method: "resize",
      height: e
    });
  }

  function sendMessage(msg) {
    var child = document.getElementById("view");
    child.contentWindow.postMessage(msg);
  }

  return (
    <div>
      <header>
        <HeaderContainer />
      </header>
      <div className="main">
        <div className="child-content">
          <SplitterLayout
            primaryIndex={0}
            percentage
            primaryMinSize={25} //최소 사이즈
            secondaryInitialSize={
              !localStorage.getItem("rightPaneWidth")
                ? 75
                : parseFloat(localStorage.getItem("rightPaneWidth"))
            }
            // secondaryMinSize={50}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onSecondaryPaneSizeChange={onChangeCourse}
            customClassName="leftLayout"
          >
            <TreeContainer id="TreeContainer" />
            <SplitterLayout
              vertical
              percentage
              primaryIndex={1}
              primaryMinSize={3}
              secondaryInitialSize={
                !localStorage.getItem("rightPaneHeight")
                  ? 70
                  : parseFloat(localStorage.getItem("rightPaneHeight"))
              }
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onSecondaryPaneSizeChange={onChangeFrame}
              customClassName="rightLayout"
            >
              <ViewContainer />
              <ConsoleContainer />
            </SplitterLayout>
          </SplitterLayout>
        </div>
      </div>
    </div>
  );
};

export default App;
