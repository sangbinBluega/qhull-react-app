import React, { useEffect, useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";

//icon
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import TodayIcon from "@material-ui/icons/Today";

let fromParent = "",
  keyValue = "",
  arrCourse = [];

function getTreeItemsFromData(treeItems, depth) {
  depth = depth || 0;

  return treeItems.map((treeItemData, index) => {
    let children = undefined;

    if (treeItemData.childNode && treeItemData.childNode.length > 0) {
      fromParent = treeItemData.Title;

      if (index === 0) {
        depth++;
      }

      children = getTreeItemsFromData(treeItemData.childNode, depth);
    } else {
      var url = treeItemData.Content
        ? window.tsPando.contentGetExeURI(
            treeItemData.Content,
            window.tsQhull._cfg,
            { trace: true }
          )
        : "";

      if (index === 0) {
        depth++;
      }
    }

    if (depth !== 1) {
      keyValue = !treeItemData.Id
        ? `${fromParent}-${treeItemData.Title}`
        : `${treeItemData.Id}-${treeItemData.Title}`;
    } else {
      keyValue = treeItemData.Title;
    }

    //console.log(`key > ${keyValue}`);

    return (
      <TreeItem
        key={keyValue}
        nodeId={keyValue}
        name={`depth${depth}`}
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
            ) : (
              ""
            )}

            <span>{treeItemData.Title}</span>
          </div>
        }
        children={children}
        onClick={() => {
          courseRunQsetUi(url);
        }}
      />
    );
  });
}

let arrList = [],
  expandedParent = "",
  noTitle = false,
  keyData = "";

function getTreeExpandedList(treeItems) {
  treeItems.forEach(function(item) {
    if (item.childNode && item.childNode.length > 0) {
      expandedParent = item.Title;
      if (noTitle) {
        keyData = !item.Id
          ? `${expandedParent}-${item.Title}`
          : `${item.Id}-${item.Title}`;
      } else {
        noTitle = true;
        keyData = item.Title;
      }
      arrList.push(keyData);
      getTreeExpandedList(item.childNode);
    }
  });
  return arrList;
}

function courseRunQsetUi(url) {
  if (url) {
    document.getElementById("view").src = url;
    let element = document.getElementById("console");

    while (element.hasChildNodes()) {
      element.removeChild(element.firstChild);
    }
  }
}

const Course = () => {
  const [course, setCourse] = useState("");

  useEffect(() => {
    if (course.length > 0) {
      return;
    }

    if (arrCourse.length > 0) {
      setCourse(arrCourse);
      return;
    }

    window.tsQhull.init(function() {
      arrCourse.push(window.tsQhull.course);
      setCourse(arrCourse);
    });
  }, [course]);

  return (
    <>
      {course !== "" && (
        <TreeView className="nav" defaultExpanded={getTreeExpandedList(course)}>
          {getTreeItemsFromData(course, 0)}
        </TreeView>
      )}
    </>
  );
};

export default Course;
