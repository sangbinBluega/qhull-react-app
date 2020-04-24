import React, { useEffect, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import CircularProgress from "@material-ui/core/CircularProgress";

import { Scrollbars } from "react-custom-scrollbars";

let arrSubject = [],
  arrSubjectToQ = [],
  arrInit = {};

// const useStyles = makeStyles({
//   root: {
//     height: 240,
//     flexGrow: 1,
//     maxWidth: 400,
//   },
// });

const GlobalCss = withStyles({
  // @global is handled by jss-plugin-global.
  "@global": {
    // You should target [class*="MuiButton-root"] instead if you nest themes.

    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label": {
      backgroundColor: "rgba(0,0,0,0)",
    },
  },
})(() => null);

const Subject = () => {
  //const classes = useStyles();
  const [initData, setInitData] = useState(false);
  //const [subjectData, setSubjectData] = useState([]);

  useEffect(() => {
    if (initData) {
      return;
    }

    window.tsQsbjTool.init(
      function () {
        // const getTreeItemsFromData = (treeItems, depth, idx) => {
        //   depth = depth || 0;

        //   return treeItems.map((treeItemData, index) => {
        //     let children = undefined;

        //     if (treeItemData.childNode && treeItemData.childNode.length > 0) {
        //       if (index === 0) {
        //         depth++;
        //       }

        //       children = getTreeItemsFromData(
        //         treeItemData.childNode,
        //         depth,
        //         index
        //       );
        //     } else {
        //       if (index === 0) {
        //         depth++;
        //       }
        //     }

        //     return {
        //       name: treeItemData.Title,
        //       itemData: treeItemData,
        //       depth: `depth${depth}`,
        //       childNode: children,
        //     };
        //   });
        // };

        arrSubject = window.tsQsbjTool.tree;

        arrInit = {
          id: "title",
          name: arrSubject.Title,
          childNode: arrSubject.childNode,
          itemData: arrSubject,
          depth: "depth1",
        };

        //arrSubject = getTreeItemsFromData(arrSubject.childNode, 1, "title");
        arrSubjectToQ = window.tsQsbjTool.mapSubjectToQ;

        let buttons = ["courseIcon", "viewIcon", "consoleIcon", "clearIcon"];

        buttons.forEach(function (item) {
          let element = document.getElementById(item).style;
          element.opacity = 1;
          element.pointerEvents = "";
        });

        document.getElementById("dimLoading").style.display = "none";
        document.getElementById("circularDiv").style.display = "none";

        setInitData(true);
      },
      function (level, log) {
        window.tsPando.log.call(window.tsQsbjTool, level, log);
      }
    );
  }, [initData]);

  return (
    <>
      {initData && (
        // <div>
        //   <div
        //     style={{
        //       position: "absolute",
        //       width: "100%",
        //       height: "calc(100% - 72px)",
        //       display: "flex",
        //       alignItems: "center",
        //       zIndex: 1,
        //     }}
        //   >
        //     <div style={{ width: "100%", textAlign: "center" }}>
        //       <CircularProgress disableShrink />
        //     </div>
        //   </div>
        // </div>
        <>
          <div id="loading" style={{ display: "none" }}>
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "calc(100% - 72px)",
                display: "flex",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <div style={{ width: "100%", textAlign: "center" }}>
                <CircularProgress disableShrink />
              </div>
            </div>
          </div>

          <Scrollbars
            id="subjectTreeView"
            style={{ height: "calc(100% - 72px)" }}
          >
            <GlobalCss />
            <MyTreeItem
              id={arrInit.id}
              name={arrInit.name}
              childNode={arrInit.childNode}
              itemData={arrInit.itemData}
              depth={arrInit.depth}
            />
          </Scrollbars>
        </>
      )}
    </>
  );
};

const MyTreeItem = (props) => {
  //const classes = useStyles();
  const [childNodes, setChildNodes] = useState(null);
  const [expanded, setExpanded] = useState([]);

  function fetchChildNodes(id) {
    let data = arrSubject.childNode;

    let depth = 2;

    if (id !== "title") {
      let arrId = id.split("-");

      data = arrSubject.childNode;
      for (let i = 1; i < arrId.length; i++) {
        data = data[arrId[i]].childNode;
        depth++;
      }
    }

    let childrenData = [];

    childrenData.push(
      data.map((item, index) => {
        return {
          id: id + "-" + index,
          name: item.Title,
          childNode: item.childNode,
          itemData: item,
          depth: `depth${depth}`,
        };
      })
    );

    return new Promise((resolve) => {
      document.getElementById("loading").style.display = "block";

      setTimeout(() => {
        resolve({
          children: childrenData[0],
        });
        document.getElementById("loading").style.display = "none";
      }, 1000);
    });
  }

  const handleChange = (event, nodes) => {
    const expandingNodes = nodes.filter((x) => !expanded.includes(x));
    setExpanded(nodes);
    if (expandingNodes[0]) {
      const childId = expandingNodes[0];

      fetchChildNodes(childId).then((result) => {
        return setChildNodes(
          result.children.map((node) => <MyTreeItem key={node.id} {...node} />)
        );
      });
    }
  };

  const subjectButtonBuild = (node, keyValue) => {
    window.tsQsbjExe.treeCollectQinfo(); // Data 수집

    //  노드 정보 색상
    let infoClr = "red"; // 실행가능 상위 노드

    if (arrSubjectToQ && arrSubjectToQ[node.id]) {
      // 실행가능 말단 노드
      infoClr = "blue";
    }

    if (!node.id) {
      // 실행 불가능 상위 노드
      infoClr = "#515253";
    }

    //  노드 정보
    let infoQ = window.tsQsbjTool.subjectDictateQinfo(node.infoQ);

    let infoTip = "",
      infoCount = "";

    if (infoQ.length) {
      for (let i = 0; i < infoQ.length; i++) {
        infoTip += (infoTip ? ":" : "") + infoQ[i].tip;
        infoCount += (infoCount ? ":" : "") + infoQ[i].count;
      }
    }
    return (
      <span
        style={{ color: infoClr, marginLeft: "5px" }}
        title={`[${infoTip}]`}
      >
        [{infoCount}]{subjectOnLoad_buildAction(node.id, keyValue)}
      </span>
    );
  };

  const subjectOnLoad_buildAction = (subjectID, keyValue) => {
    if (subjectID) {
      //  Subject 취합
      let subject = window.tsQsbjExe.subjectGetTerminalNode(subjectID); // Child Node가 되는 Subject 목록
      let IdSubject = [];

      for (let i in subject) IdSubject.push(i);

      //  실행이 가능한 QSETUI
      let qsetUi = window.tsQsbjExe.subjectGetQsetui(IdSubject);

      return qsetUi.map(function (item) {
        return (
          <span
            key={`${keyValue}-${item._abbr}`}
            className="subjectButton"
            title={item._title}
            onClick={(event) => {
              contentRun(
                event,
                window.tsQsbjExe.subjectMakeContent(IdSubject, item)
              );
            }}
            style={{ backgroundColor: item._clr || "#000000" }}
          >
            {item._abbr}
          </span>
        );
      });
    }
  };

  const contentRun = (event, Content) => {
    let url = window.tsPando.contentGetExeURI(Content, window.tsQsbjTool._cfg, {
      trace: true,
    });

    document.getElementById("view").src = url;

    let element = document.getElementById("console");

    while (element.hasChildNodes()) {
      element.removeChild(element.firstChild);
    }

    event.stopPropagation();
  };

  return (
    <>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        onNodeToggle={handleChange}
      >
        {/*The node below should act as the root node for now */}
        <TreeItem
          nodeId={props.id}
          label={
            <div>
              <span>{props.name}</span>
              {subjectButtonBuild(props.itemData, props.id)}
            </div>
          }
          name={props.depth}
        >
          {props.childNode ? childNodes || [<div key="stub" />] : null}
        </TreeItem>
      </TreeView>
    </>
  );
};

export default Subject;
