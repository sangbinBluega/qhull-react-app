import React, { useEffect } from "react";
import Course from "../components/Course";
import Subject from "../components/Subject";
import { Scrollbars } from "react-custom-scrollbars";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import GolfCourseIcon from "@material-ui/icons/GolfCourse";
import SubjectIcon from "@material-ui/icons/Subject";

import { makeStyles } from "@material-ui/core/styles";

//style
import "../styles/tree.scss";

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
  const [value, setValue] = React.useState(
    !localStorage.getItem("treeValue")
      ? 0
      : parseInt(localStorage.getItem("treeValue"))
  );
  const classes = useStyles(value);

  const handleChange = (event, newValue) => {
    localStorage.setItem("treeValue", newValue);
    setValue(newValue);
  };

  useEffect(() => {
    console.log("dddd");
  }, [value]);

  return (
    <div id="course" className="course">
      <div className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
          scrollButtons="off"
          className={classes.tabs}
          TabIndicatorProps={{
            style: { left: value !== 1 ? "0%" : "50%", width: "50%" }
          }}
        >
          <Tab icon={<GolfCourseIcon />} label="Course" />
          <Tab icon={<SubjectIcon />} label="Subject" />
        </Tabs>
      </div>
      <Scrollbars style={{ height: "calc(100% - 72px)" }}>
        {/* {value !== 1 ? <Course /> : <Subject />} */}
        <Course selectValue={value} />
        <Subject selectValue={value} />
      </Scrollbars>
    </div>
  );
};

export default TreeContainer;
