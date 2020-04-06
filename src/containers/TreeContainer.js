import React, { useState } from "react";
import Course from "../components/Course";
import Subject from "../components/Subject";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import GolfCourseIcon from "@material-ui/icons/GolfCourse";
import SubjectIcon from "@material-ui/icons/Subject";

import CircularProgress from "@material-ui/core/CircularProgress";

import { makeStyles } from "@material-ui/core/styles";

//style
import "../styles/tree.scss";

const courseDisabled = window.tsQhull.get("ui", "disabled");
const subjectDisabled = window.tsQsbjExe.get("ui", "disabled");
const localTreeValue = localStorage.getItem("treeValue");

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    backgroundColor: "rgb(228 ,234 ,239)"
  }
  /* 값 전달 할 수도 있음 (참고용) */
  // indicator: props => ({
  //   left: props !== 1 ? "0%" : "50%",
  //   width: "50%"
  // })
});

const TreeContainer = () => {
  const [value, setValue] = useState(
    !localTreeValue && !courseDisabled
      ? 0
      : !localTreeValue && !subjectDisabled
      ? 1
      : parseInt(localTreeValue)
  );

  if (localTreeValue) {
    if (subjectDisabled) {
      localStorage.setItem("treeValue", 0);
    } else if (courseDisabled) {
      localStorage.setItem("treeValue", 1);
    }
  } else {
    localStorage.setItem("treeValue", value);
  }

  const classes = useStyles(value);

  const handleChange = (event, newValue) => {
    if (courseDisabled || subjectDisabled) {
      return;
    }

    localStorage.setItem("treeValue", newValue);

    let courseTree = document.getElementById("courseTreeView").style;
    let subjectTree = document.getElementById("subjectTreeView").style;

    if (newValue === 0) {
      courseTree.width = "100%";
      courseTree.height = "calc(100% - 72px)";
      courseTree.visibility = "visible";

      subjectTree.width = "0px";
      subjectTree.height = "0px";
      subjectTree.visibility = "hidden";
    } else {
      courseTree.width = "0px";
      courseTree.height = "0px";
      courseTree.visibility = "hidden";

      subjectTree.width = "100%";
      subjectTree.height = "calc(100% - 72px)";
      subjectTree.visibility = "visible";
    }

    setValue(newValue);
  };

  return (
    <div id="course" className="course">
      <div className={classes.root}>
        <div
          id="dimLoading"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            width: "100%",
            height: "100%",
            zIndex: 1,
            position: "fixed",
            display: "flex",
            alignItems: "center",
            top: 0,
            left: 0
          }}
        ></div>

        <div
          id="circularDiv"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center"
          }}
        >
          <div style={{ width: "100%", textAlign: "center" }}>
            <CircularProgress disableShrink />
          </div>
        </div>

        <Tabs
          value={courseDisabled || subjectDisabled ? 0 : value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
          scrollButtons="off"
          className={classes.tabs}
          TabIndicatorProps={{
            style: {
              left: value !== 1 ? "0%" : "50%",
              width: courseDisabled || subjectDisabled ? "0%" : "50%"
            }
          }}
        >
          {!courseDisabled && <Tab icon={<GolfCourseIcon />} label="Course" />}
          {!subjectDisabled && <Tab icon={<SubjectIcon />} label="Subject" />}
        </Tabs>
      </div>
      {!courseDisabled && <Course />}
      {!subjectDisabled && <Subject />}
    </div>
  );
};

export default TreeContainer;
