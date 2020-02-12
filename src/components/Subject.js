import React, { useEffect, useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import { makeStyles } from "@material-ui/core/styles";

//icon
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import TodayIcon from "@material-ui/icons/Today";
import CreateIcon from "@material-ui/icons/Create";

let keyValue = "",
  arrSubject = [],
  arrSubjectToQ = [];

function getTreeItemsFromData(treeItems, depth) {
  depth = depth || 0;

  return treeItems.map((treeItemData, index) => {
    let children = undefined;

    if (treeItemData.childNode && treeItemData.childNode.length > 0) {
      if (index === 0) {
        depth++;
      }

      children = getTreeItemsFromData(treeItemData.childNode, depth);
    } else {
      if (index === 0) {
        depth++;
      }
    }

    if (depth !== 1) {
      keyValue = !treeItemData.id
        ? `${
            !treeItemData.rule.category
              ? treeItemData.rule.id
              : treeItemData.rule.category
          }-${treeItemData.Title}`
        : `${treeItemData.id}-${treeItemData.Title}`;
    } else {
      keyValue = treeItemData.Title;
    }

    //console.log(`key > ${keyValue}`);

    return (
      <TreeItem
        key={keyValue}
        nodeId={keyValue}
        name={`depth${depth}`}
        title={treeItemData.id ? treeItemData.id : ""}
        label={
          <div>
            {depth === 1 ? (
              <BookmarkBorderIcon
                className="icon"
                style={{ fontSize: "25px", marginTop: "1px" }}
              />
            ) : depth === 2 ? (
              <MenuBookIcon
                className="icon"
                style={{ fontSize: "20px", marginTop: "1px" }}
              />
            ) : depth === 3 ? (
              <TodayIcon
                className="icon"
                style={{ fontSize: "15px", marginTop: "3px" }}
              />
            ) : depth === 4 ? (
              <CreateIcon
                className="icon"
                style={{ fontSize: "15px", marginTop: "2px" }}
              />
            ) : (
              ""
            )}

            <span>{escapeHTML(treeItemData.Title)}</span>

            {subjectButtonBuild(treeItemData, keyValue)}
          </div>
        }
        children={children}
        onClick={() =>
          function(event) {
            console.log(event);
          }
        }
      />
    );
  });
}

let arrList = [],
  keyData = "";

function getTreeExpandedList(treeItems, depth) {
  depth = depth || 0;

  treeItems.forEach(function(item, index) {
    if (item.childNode && item.childNode.length > 0) {
      if (index === 0) {
        depth++;
      }

      if (depth !== 1) {
        keyData = !item.id
          ? `${!item.rule.category ? item.rule.id : item.rule.category}-${
              item.Title
            }`
          : `${item.id}-${item.Title}`;
      } else {
        keyData = item.Title;
      }

      arrList.push(keyData);
      getTreeExpandedList(item.childNode, depth);
    } else {
      if (index === 0) {
        depth++;
      }
    }
  });
  return arrList;
}

function contentRun(Content) {
  let url = window.tsPando.contentGetExeURI(Content, window.tsQsbjTool._cfg, {
    trace: true
  });

  document.getElementById("view").src = url;

  let element = document.getElementById("console");

  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

function subjectButtonBuild(node, keyValue) {
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
    <span style={{ color: infoClr, marginLeft: "5px" }} title={`[${infoTip}]`}>
      [{infoCount}]{subjectOnLoad_buildAction(node.id, keyValue)}
    </span>
  );
}

function subjectOnLoad_buildAction(subjectID, keyValue) {
  if (subjectID) {
    //  Subject 취합
    let subject = window.tsQsbjExe.subjectGetTerminalNode(subjectID); // Child Node가 되는 Subject 목록
    let IdSubject = [];

    for (let i in subject) IdSubject.push(i);

    //  실행이 가능한 QSETUI
    let qsetUi = window.tsQsbjExe.subjectGetQsetui(IdSubject);

    return qsetUi.map(function(item) {
      return (
        <span
          key={`${keyValue}-${item._abbr}`}
          className="subjectButton"
          title={item._title}
          onClick={() => {
            contentRun(window.tsQsbjExe.subjectMakeContent(IdSubject, item));
          }}
          style={{ backgroundColor: item._clr || "#000000" }}
        >
          {item._abbr}
        </span>
      );
    });
  }
}

function escapeHTML(text) {
  return (text + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\'/g, "&apos;")
    .replace(/\"/g, "&quot;")
    .replace(/>/g, "&gt;");
}

const useStyles = makeStyles(theme => ({
  selected: {
    "&:focus": {
      backgroundColor: "red"
    }
  }
}));

function contentRunT(e) {
  e.target.childNodes[0].style.backgroundColor = null;
  // form.addEventListener(
  //   "focus",
  //   function(event) {
  //     this.style.backgroundColor = "pink";
  //   },
  //   true
  // );
}

const Subject = () => {
  const [subject, setSubject] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    if (subject.length > 0) {
      return;
    }

    if (arrSubject.length > 0) {
      setSubject(arrSubject);
      return;
    }

    window.tsQsbjTool.init(
      function() {
        arrSubject.push(window.tsQsbjTool.tree);
        arrSubjectToQ = window.tsQsbjTool.mapSubjectToQ;
        setSubject(arrSubject);
      },
      function(level, log) {
        window.tsPando.log.call(window.tsQsbjTool, level, log);
      }
    );
  }, [subject]);

  return (
    <>
      {subject !== "" && (
        <TreeView
          className="nav"
          itemProp={{ className: classes.selected }}
          onFocus={e => {
            contentRunT(e);
          }}
          defaultExpanded={getTreeExpandedList(subject, 0)}
        >
          {getTreeItemsFromData(subject, 0)}
        </TreeView>
      )}
    </>
  );
};

export default Subject;
