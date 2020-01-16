import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Scrollbars } from "react-custom-scrollbars";
import PolymerIcon from "@material-ui/icons/Polymer";

const useStyles = makeStyles({
  paper: {
    width: "100%",
    height: "100%",
    //position: "absolute",
    // overflow: "hidden",
    backgroundColor: "rgb(40, 49, 54)"
  },
  tab: {
    position: "fixed",
    zIndex: 2,
    width: "100px",
    height: "20px",
    marginTop: "-20px",
    backgroundColor: "rgb(40, 49, 54)",
    color: "white"
  }
});

const Sensor = () => {
  const classes = useStyles();

  return (
    <Scrollbars>
      <div style={{ backgroundColor: "gray" }}>
        <div className={classes.tab}>
          <PolymerIcon style={{ fontSize: 20, marginLeft: 5 }} />
          <span
            style={{ position: "absolute", marginLeft: "10px", bottom: "1px" }}
          >
            Console
          </span>
        </div>
        <Paper id="sensor" className={classes.paper}></Paper>
      </div>
    </Scrollbars>
  );
};

export default Sensor;
