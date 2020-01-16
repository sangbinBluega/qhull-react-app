import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SvgIcon from "@material-ui/core/SvgIcon";
import { fade, makeStyles, withStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
// import Collapse from "@material-ui/core/Collapse";
import { useSpring, animated } from "react-spring/web.cjs";
import Paper from "@material-ui/core/Paper";

import { Collapse } from 'react-bootstrap';

//icon
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import AddBoxOutlinedIcon from "@material-ui/icons/AddBoxOutlined";
import StopIcon from "@material-ui/icons/Stop";
import IndeterminateCheckBoxOutlinedIcon from "@material-ui/icons/IndeterminateCheckBoxOutlined";

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <IndeterminateCheckBoxOutlinedIcon />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <AddBoxOutlinedIcon />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <StopIcon />
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = useSpring({
    from: { opacity: 0, transform: "translate3d(20px,0,0)" },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`
    }
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

function getTreeItemsFromData(treeItems) {
  return treeItems.map(treeItemData => {
    let children = undefined;
    if (treeItemData.childNode && treeItemData.childNode.length > 0) {
      children = getTreeItemsFromData(treeItemData.childNode);
    } else {
      //var url = window.tsQhull.getContentURI(treeItemData);
      //console.error(treeItemData.Content);
      var url = treeItemData.Content ? window.tsPando.contentGetExeURI(treeItemData.Content, window.tsQhull._cfg) : '';
    }
    return (
      <StyledTreeItem
        key={!treeItemData.Id ? treeItemData.Title : treeItemData.Id}
        nodeId={!treeItemData.Id ? treeItemData.Title : treeItemData.Id}
        label={treeItemData.Title}
        children={children}
        onClick={() => {
          courseRunQsetUi(url);
        }}
      />
    );
  });
}

var arrList = [];

function getTreeExpandedList(treeItems) {
  treeItems.forEach(function(item) {
    if (item.childNode && item.childNode.length > 0) {
      arrList.push(!item.Id ? item.Title : item.Id);
      getTreeExpandedList(item.childNode);
    }
  });
  return arrList;
}

function courseRunQsetUi(url) {
  if (url) {
    document.getElementById("qset").src = url;
  }
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool
};

const StyledTreeItem = withStyles(theme => ({
  iconContainer: {
    "& .close": {
      opacity: 0.3
    }
  },
  group: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`
  }
}))(props => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

const useStyles = makeStyles(theme => ({
  tree: {
    flexGrow: 1,
    padding: "8px",
    color: "black"
  },
  course: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#3fa5000f"
  },
  icon: {
    marginLeft: theme.spacing(1),
    fontSize: 20,
    marginTop: "5px"
  },
  courseTitle: {
    width: "100%",
    height: "30px",
    backgroundColor: "rgb(127, 200, 129)",
    color: "white"
  }
}));

const Course = () => {
  const classes = useStyles();
  const [course, setCourse] = useState("");

  useEffect(() => {
    if( course.length > 0 ) {
      return;
    }
    window.tsQhull.init(function() {
      let arrCourse = [];
      arrCourse.push(window.tsQhull.course);
      setCourse(arrCourse);
    });
  }, [course]);

  return (

<ul className="nav">

</ul>

//     <Paper id="course" className={classes.course} color="text.primary">
//       <div className={classes.courseTitle}>
//         <AccountTreeIcon className={classes.icon} />
//         <span
//           style={{ position: "absolute", marginLeft: "10px", marginTop: "3px" }}
//         >
//           Course
//         </span>
//         <hr />
//       </div>
//       {course !== "" && (
//         <TreeView
//           className={classes.tree}
//           defaultExpanded={getTreeExpandedList(course)}
//           defaultCollapseIcon={<MinusSquare />}
//           defaultExpandIcon={<PlusSquare />}
//           defaultEndIcon={<CloseSquare />}
//         >
//           {getTreeItemsFromData(course)}
//         </TreeView>
//       )}
//     </Paper>
   );
};

export default Course;
