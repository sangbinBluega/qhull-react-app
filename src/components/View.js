import React from "react";
import Paper from "@material-ui/core/Paper";

const View = () => {
  return (
    <div className="card">
      <div className="content">
        <Paper
          id="view"
          component="iframe"
          frameBorder="no"
          scrolling="no"
          className="iframe"
          style={{
            background: `url(${process.env.PUBLIC_URL}/${window.tsQhull.get(
              "ui",
              "fullLogo"
            )}) no-repeat center`
          }}
        ></Paper>
      </div>
    </div>
  );
};

export default View;
