import React from "react";

const edpEmulPadding = 12;

function onResize() {
  var scrW = window.innerWidth - edpEmulPadding * 2;
  var scrH = window.innerHeight - edpEmulPadding * 2;
  var splitH = 0.3; // 가로 분할 비율
  var splitV = 0.1;
  var qsetRatio = window.tsQhull.get("ui", "contentRatio");
  var headerH = 0.1; // header 세로 비율
  var headerSize = Math.ceil((scrH - edpEmulPadding) * headerH);

  //  HEADER
  var header = document.getElementById("header");

  header.style.top = edpEmulPadding + "px";
  header.style.left = edpEmulPadding + "px";
  header.style.height = headerSize + "px";
  header.style.width =
    Math.ceil((scrW - edpEmulPadding) * 1) + edpEmulPadding + "px";

  //  QSET IFRAME
  var qset = document.getElementById("qset");

  qset.style.top = headerSize + edpEmulPadding * 2 + "px";
  qset.style.right = edpEmulPadding + "px";
  qset.style.width = Math.ceil((scrW - edpEmulPadding) * (1 - splitH)) + "px";
  qset.style.height =
    Math.ceil(
      qsetRatio
        ? (scrW - edpEmulPadding) * (1 - splitH) * qsetRatio -
            parseInt(header.style.height)
        : (scrH - edpEmulPadding) * splitV - parseInt(header.style.height)
    ) + "px"; // qsetRatio로 하거나 세로 방향으로 1/2로 나눔

  //  SENSOR
  var sensor = document.getElementById("sensor");

  sensor.style.bottom = edpEmulPadding + "px";
  sensor.style.right = edpEmulPadding + "px";
  sensor.style.width = Math.ceil((scrW - edpEmulPadding) * (1 - splitH)) + "px";
  sensor.style.height =
    scrH -
    parseInt(qset.style.height) -
    parseInt(header.style.height) -
    edpEmulPadding * 2 +
    "px";

  //  COURSE TREE
  var course = document.getElementById("course");

  course.style.top = headerSize + edpEmulPadding * 2 + "px";
  course.style.left = edpEmulPadding + "px";
  course.style.height =
    scrH - parseInt(header.style.height) - edpEmulPadding + "px";
  course.style.width = Math.ceil((scrW - edpEmulPadding) * splitH) + "px";
}

const resize = () => {
  //  Layout
  onResize();

  window.addEventListener("resize", onResize, false);

  window.addEventListener(
    "message",
    function(ev) {
      if (
        ev.data &&
        ev.data.edpEmul &&
        ev.data.edpEmul.event === "contentOnReady"
      ) {
        var screen = document.getElementById("screen");

        screen.style.transition = "opacity 600ms ease-out";
        screen.style.opacity = 1;
      }
    },
    false
  );

  return <></>;
};

export default resize;
