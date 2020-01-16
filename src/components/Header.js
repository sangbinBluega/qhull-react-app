import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CardMedia from "@material-ui/core/CardMedia";

// import AccountTreeIcon from "@material-ui/icons/AccountTree";
// import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
// import PolymerIcon from "@material-ui/icons/Polymer";

const useStyles = makeStyles(theme => ({
  paper: {
    //position: "absolute",
    padding: 0,
    width: "100%",
    height: "60px",
    minHeight: "60px",
    zIndex: 1
  },
  logo: {
    marginRight: theme.spacing(2)
  },
  menuButton: {
    justifyContent: "right"
  },
  appBar: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgb(67, 157, 69)",
    justifyContent: "center"
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
              src={process.env.PUBLIC_URL + "/db/img/titleLogo.png"}
            />
          </IconButton>

          <Typography variant="h6" color="inherit">
            {window.tsQhull.get("ui", "title")}
          </Typography>

          {/* <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <AccountTreeIcon />
          </IconButton>

          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <DesktopWindowsIcon />
          </IconButton>

          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <PolymerIcon />
          </IconButton> */}
        </Toolbar>
      </AppBar>
    </Paper>
  );
};

export default Header;
