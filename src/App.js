import React from "react";
import CourseContainer from "./containers/CourseContainer";
import QsetContainer from "./containers/QsetContainer";
import SensorContainer from "./containers/SensorContainer";
import HeaderContainer from "./containers/HeaderContainer";

import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import "./App.css";

const App = () => {
  const onDragStart = () => {
    document.getElementById("qset").style.pointerEvents = "none";
  };

  const onDragEnd = () => {
    document.getElementById("qset").style.pointerEvents = "";
  };

  window.tsQhull.set("listener", "sensor", function(/*HTML String*/ msg) {
    document.getElementById("sensor").innerHTML += msg;
  });

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
    var child = document.getElementById("qset");
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
            // primaryMinSize={10} //최소 사이즈
            secondaryInitialSize={/*contentRatio * 100*/ 70}
            // secondaryMinSize={50}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onSecondaryPaneSizeChange={onChangeCourse}
            customClassName="leftLayout"
          >
            <CourseContainer id="courseContainer" />
            <SplitterLayout
              vertical
              percentage
              primaryIndex={1}
              primaryMinSize={10}
              secondaryInitialSize={70}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onSecondaryPaneSizeChange={onChangeFrame}
              customClassName="rightLayout"
            >
              <QsetContainer />
              <SensorContainer />
            </SplitterLayout>
          </SplitterLayout>
        </div>
      </div>
      {/* <footer>
        <p>
          © 2019 Copyright: <a href="http://www.aspenux.com">BLUEGA</a>
        </p>
      </footer> */}
    </div>
  );
};

export default App;
